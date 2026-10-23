// The post-deploy analytics check: it must recognise a deployment created before Web Analytics was
// enabled (the 2026-10-23 production incident), a page without the script, and a healthy deployment.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let checker, config;
test.before(async () => {
  checker = await import('../scripts/check-analytics.mjs');
  config = await import('../site/config.mjs');
});

// Fake deployment: pages from the committed HTML, the analytics script as configured.
function deployment({ script = 'ok', page = (html) => html } = {}) {
  const calls = [];
  const fetchImpl = async (url, opts = {}) => {
    const u = new URL(url);
    calls.push({ path: u.pathname, method: opts.method || 'GET' });
    const res = (status, body, type) => ({ status, text: async () => body, headers: { get: (k) => (k.toLowerCase() === 'content-type' ? type : null) } });
    if (u.pathname === checker.SCRIPT_PATH) {
      if (script === 'ok') return res(200, '"use strict";', 'application/javascript; charset=utf-8');
      return res(404, '<!DOCTYPE html><title>Page not found</title>', 'text/html; charset=utf-8');
    }
    const file = u.pathname === '/' ? 'index.html' : u.pathname === '/fr' ? 'fr/index.html' : `${u.pathname.slice(1)}.html`;
    const p = path.join(root, file);
    return fs.existsSync(p) ? res(200, page(fs.readFileSync(p, 'utf8')), 'text/html; charset=utf-8') : res(404, '', 'text/html');
  };
  return { fetchImpl, calls };
}

test('a deployment that serves the script and carries it on every page passes', async () => {
  const { fetchImpl, calls } = deployment();
  const r = await checker.check('https://example.test', { fetchImpl });
  assert.equal(r.ok, true, r.problems.join('; '));
  assert.ok(r.pages.every((p) => p.tags === 1 && p.deferred));
  assert.equal(r.customEvents, config.ANALYTICS.customEvents ? `on (${config.ANALYTICS.maxEventProperties} properties per event)` : 'off (events stay in the page)');
  // Read-only: only GET requests, never the page-view or event endpoints.
  assert.ok(calls.every((c) => c.method === 'GET'));
  assert.ok(calls.every((c) => !/\/_vercel\/insights\/(view|event)/.test(c.path)));
});

test('a deployment created before Web Analytics was enabled is diagnosed with the fix: redeploy', async () => {
  const { fetchImpl } = deployment({ script: 'missing' });
  const r = await checker.check('https://example.test', { fetchImpl });
  assert.equal(r.ok, false);
  assert.equal(r.problems.length, 1);
  assert.match(r.problems[0], /answered 404 \(text\/html[^)]*\): this deployment does not serve Web Analytics.*created before it was enabled: redeploy \(no code change needed\)/);
});

test('pages without the script tag are reported with the configuration fix', async () => {
  const { fetchImpl } = deployment({ page: (html) => html.replace(/<script defer src="\/_vercel\/insights\/script\.js"><\/script>/, '') });
  const r = await checker.check('https://example.test', { fetchImpl });
  assert.equal(r.ok, false);
  assert.ok(r.problems.every((p) => /0 analytics script tags \(expected 1\)\. Set ANALYTICS\.webAnalytics/.test(p)), r.problems.join('; '));
  assert.equal(r.problems.length, checker.PAGES.length);
});

test('inspectPage reads the script tags and the custom-events switch', () => {
  assert.deepEqual(checker.inspectPage('<body data-page="x">'), { tags: 0, deferred: true, eventProperties: 0 });
  assert.deepEqual(checker.inspectPage('<script defer src="/_vercel/insights/script.js"></script><body data-page="x" data-va-events="2">'), { tags: 1, deferred: true, eventProperties: 2 });
  assert.equal(checker.inspectPage('<script src="/_vercel/insights/script.js"></script>').deferred, false);
});

test('the checker is owner tooling: not deployed', () => {
  const ignored = fs.readFileSync(path.join(root, '.vercelignore'), 'utf8').split(/\r?\n/).map((l) => l.trim());
  assert.ok(ignored.includes('scripts/'));
});
