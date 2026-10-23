// Post-deploy check for Vercel Web Analytics on a deployment (docs/TERANGA-05A-analytics-activation.md).
// Read-only: it fetches pages and the analytics script, and never sends a page view or an event.
//
//   node scripts/check-analytics.mjs https://teranga-tech.com
//   node scripts/check-analytics.mjs "https://<preview>.vercel.app/?_vercel_share=…"   (protected preview)
//
// Exit code 0 when every page carries the script and the deployment serves it; 1 otherwise.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SCRIPT_PATH = '/_vercel/insights/script.js';
export const PAGES = ['/', '/fr', '/contact', '/fr/contact', '/privacy'];

/** What a page's HTML says about analytics: number of script tags and the events switch. */
export function inspectPage(html) {
  const tags = (html.match(/<script\b[^>]*\bsrc="\/_vercel\/insights\/script\.js"[^>]*>/g) || []);
  const events = /<body\b[^>]*\bdata-va-events="(\d+)"/.exec(html);
  return { tags: tags.length, deferred: tags.every((t) => /\sdefer\b/.test(t)), eventProperties: events ? Number(events[1]) : 0 };
}

/**
 * Turns the observations into a verdict and the action that fixes it.
 * @param pages  [{ path, status, tags, deferred, eventProperties }]
 * @param script { status, contentType }
 */
export function diagnose(pages, script) {
  const problems = [];
  for (const p of pages) {
    if (p.status !== 200) problems.push(`${p.path}: page answered ${p.status}`);
    else if (p.tags !== 1) problems.push(`${p.path}: ${p.tags} analytics script tags (expected 1). Set ANALYTICS.webAnalytics in site/config.mjs, run npm run generate, commit and deploy`);
    else if (!p.deferred) problems.push(`${p.path}: the analytics script is not deferred`);
  }
  const js = script.status === 200 && /javascript/.test(script.contentType || '');
  if (!js) {
    problems.push(script.status === 404 || /html/.test(script.contentType || '')
      ? `${SCRIPT_PATH} answered ${script.status} (${script.contentType || 'no type'}): this deployment does not serve Web Analytics. Either Web Analytics is not enabled for the project, or the deployment was created before it was enabled: redeploy (no code change needed)`
      : `${SCRIPT_PATH} answered ${script.status} (${script.contentType || 'no type'})`);
  }
  const events = [...new Set(pages.filter((p) => p.status === 200).map((p) => p.eventProperties))];
  return {
    ok: problems.length === 0,
    problems,
    customEvents: events.length === 1 ? (events[0] > 0 ? `on (${events[0]} properties per event)` : 'off (events stay in the page)') : `inconsistent across pages: ${events.join(', ')}`,
  };
}

// A protected preview is opened with its share link once; the auth cookie it sets is reused
// (never printed).
async function session(start, fetchImpl) {
  const u = new URL(start);
  if (!u.searchParams.has('_vercel_share')) return { origin: u.origin, headers: {} };
  const res = await fetchImpl(u, { redirect: 'manual' });
  const cookie = (res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get('set-cookie') || ''])
    .map((c) => c.split(';')[0]).filter(Boolean).join('; ');
  return { origin: u.origin, headers: cookie ? { cookie } : {} };
}

export async function check(start, { fetchImpl = fetch } = {}) {
  const { origin, headers } = await session(start, fetchImpl);
  const pages = [];
  for (const p of PAGES) {
    const res = await fetchImpl(origin + p, { headers });
    const html = res.status === 200 ? await res.text() : '';
    pages.push({ path: p, status: res.status, ...inspectPage(html) });
  }
  const res = await fetchImpl(origin + SCRIPT_PATH, { headers });
  const script = { status: res.status, contentType: res.headers.get('content-type') || '' };
  return { origin, pages, script, ...diagnose(pages, script) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = process.argv[2];
  if (!target) {
    process.stderr.write('Usage: node scripts/check-analytics.mjs <deployment URL>\n');
    process.exitCode = 1;
  } else {
    check(target).then((r) => {
      console.log(`Deployment: ${r.origin}`);
      for (const p of r.pages) console.log(`  ${p.path.padEnd(12)} ${p.status}  script tags: ${p.tags}`);
      console.log(`  ${SCRIPT_PATH} → ${r.script.status} ${r.script.contentType}`);
      console.log(`Custom events: ${r.customEvents}`);
      console.log(r.ok ? 'OK: this deployment can collect page views.' : `NOT OK:\n- ${r.problems.join('\n- ')}`);
      process.exitCode = r.ok ? 0 : 1;
    }).catch((err) => { process.stderr.write(`${err.message}\n`); process.exitCode = 1; });
  }
}
