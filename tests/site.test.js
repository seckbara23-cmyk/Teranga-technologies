// Static checks of the page: EN/FR parity, CTA routing, form markup, SEO and deployment config.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { SERVICES, INQUIRY_TYPES } = require('../api/_lib/contact');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const html = read('index.html');

// Run main.js against a minimal DOM stub to read its dictionaries.
function loadI18n() {
  const noop = () => {};
  const storage = { getItem: () => null, setItem: noop };
  const document = {
    querySelectorAll: () => [],
    querySelector: () => null,
    getElementById: () => null,
    addEventListener: noop,
    documentElement: {},
    referrer: '',
  };
  const window = {
    location: { search: '', hostname: 'teranga-tech.com', pathname: '/' },
    localStorage: storage,
    sessionStorage: storage,
    matchMedia: () => ({ matches: false, addEventListener: noop }),
  };
  const context = { window, document, navigator: { languages: ['en'] }, URLSearchParams, URL, setTimeout, clearTimeout };
  vm.runInNewContext(read('main.js'), context);
  return window.TT.i18n;
}

const i18n = loadI18n();
const text = (s) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, '\u00A0').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const attrValues = (name) => [...html.matchAll(new RegExp(`${name}="([^"]*)"`, 'g'))].map((m) => m[1]);
const ids = new Set(attrValues('id'));

test('English and French dictionaries have the same keys', () => {
  const en = Object.keys(i18n.en).sort();
  const fr = Object.keys(i18n.fr).sort();
  assert.deepEqual(en.filter((k) => !i18n.fr[k]), [], 'missing in FR');
  assert.deepEqual(fr.filter((k) => !i18n.en[k]), [], 'missing in EN');
  for (const k of en) assert.notEqual(i18n.fr[k].trim(), '', `empty FR value for ${k}`);
});

test('every key used by the page exists in both languages', () => {
  const used = new Set(attrValues('data-i18n'));
  for (const spec of attrValues('data-i18n-attr')) {
    for (const pair of spec.split(';')) used.add(pair.split(':')[1].trim());
  }
  const missing = [...used].filter((k) => !(k in i18n.en) || !(k in i18n.fr));
  assert.deepEqual(missing, []);
});

test('the HTML fallback text matches the English dictionary', () => {
  const drift = [];
  for (const m of html.matchAll(/<(\w+)\b[^>]*\sdata-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)) {
    const [, , key, inner] = m;
    if (text(inner) !== text(i18n.en[key])) drift.push(key);
  }
  assert.deepEqual(drift, []);
});

test('French text uses a non-breaking space before ? ! : ;', () => {
  // Tags only are stripped: text() would turn the non-breaking spaces into ordinary ones.
  const bad = Object.entries(i18n.fr).filter(([, v]) => / [?!:;]/.test(v.replace(/<[^>]+>/g, ''))).map(([k]) => k);
  assert.deepEqual(bad, []);
});

test('no unapproved promises or broken-flow labels are published', () => {
  const visible = text(html) + ' ' + Object.values(i18n.en).concat(Object.values(i18n.fr)).map(text).join(' ');
  assert.doesNotMatch(visible, /24 hours|24\u00A0heures|24 heures|guarantee|garanti/i);
  assert.doesNotMatch(visible, /Get a (Free )?Quote|Request Submitted/i);
  // "Book…" labels exist for a future booking page but are not used while BOOKING_URL is empty.
  assert.match(read('main.js'), /var BOOKING_URL = '';/);
  assert.doesNotMatch(html, /data-i18n="cta\.book/);
});

test('every in-page link points to an existing section', () => {
  const broken = attrValues('href').filter((h) => h.startsWith('#') && h !== '#' && !ids.has(h.slice(1)));
  assert.deepEqual(broken, []);
});

test('every discovery-call CTA opens the form and pre-selects a real service', () => {
  for (const m of html.matchAll(/<a\b[^>]*data-cta="([^"]+)"[^>]*>/g)) {
    const tag = m[0];
    const href = /href="([^"]+)"/.exec(tag)[1];
    assert.ok(href === '#contact' || /^(https:|mailto:|tel:)/.test(href), `${m[1]} → ${href}`);
  }
  for (const s of attrValues('data-service')) assert.ok(SERVICES[s], `unknown service ${s}`);
  const options = [...html.matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]);
  for (const s of Object.keys(SERVICES)) assert.ok(options.includes(s), `form lacks option ${s}`);
});

test('every lead goes to the API: no console-only quote wizard remains', () => {
  const js = read('main.js');
  assert.doesNotMatch(js, /console\.(log|info|debug|table)\(/);
  assert.doesNotMatch(js + html, /quote-modal|Quote Submission|api\/quote|q\.success/i);
  assert.match(js, /fetch\('\/api\/contact'/);
  const type = /type:\s+'([a-z]+)'/.exec(js)[1];
  assert.ok(INQUIRY_TYPES[type], `form sends unknown inquiry type ${type}`);
});

test('form validation, success and error messages exist in both languages', () => {
  for (const k of ['f.success', 'f.error', 'v.name', 'v.email', 'v.service', 'v.message']) {
    assert.ok(i18n.en[k] && i18n.fr[k], k);
    assert.notEqual(i18n.en[k], i18n.fr[k], `${k} is not translated`);
  }
  assert.match(i18n.en['f.error'], /data-fallback="email"[\s\S]*data-fallback="whatsapp"/);
  assert.match(i18n.fr['f.error'], /data-fallback="email"[\s\S]*data-fallback="whatsapp"/);
});

test('links that open a new tab do not expose the opener', () => {
  for (const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(m[0], /rel="[^"]*noopener/);
});

test('required form fields are labelled and announce their errors', () => {
  for (const f of ['name', 'email', 'service', 'message']) {
    const field = new RegExp(`id="f-${f}"[^>]*required[^>]*aria-describedby="([^"]*)"`).exec(html);
    assert.ok(field, `f-${f} is required and described`);
    for (const id of field[1].split(' ')) assert.ok(ids.has(id), `missing #${id}`);
    assert.match(html, new RegExp(`<label for="f-${f}"`));
  }
  assert.match(html, /id="f-feedback"[^>]*role="status"[^>]*aria-live="polite"/);
  assert.match(html, /class="hp-field" aria-hidden="true"[\s\S]*?tabindex="-1"/);
});

test('SEO metadata points at the production domain', () => {
  assert.match(html, /<html lang="en">/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  // Search results truncate long titles; keep both languages within 70 characters.
  assert.equal(/<title>([^<]*)<\/title>/.exec(html)[1], i18n.en['meta.title']);
  for (const l of ['en', 'fr']) assert.ok(i18n[l]['meta.title'].length <= 70, `${l} title too long`);
  assert.match(html, /<link rel="canonical" href="https:\/\/teranga-tech\.com\/">/);
  assert.match(html, /property="og:url"\s+content="https:\/\/teranga-tech\.com\/"/);
  assert.match(html, /property="og:image"\s+content="https:\/\/teranga-tech\.com\/assets\/brand\/og-image\.png"/);
  assert.match(html, /<meta name="description" content="[^"]{50,}">/);
  // Metadata and crawl files name only the production domain (portfolio links to vercel.app products are fine).
  const head = html.slice(0, html.indexOf('</head>'));
  assert.doesNotMatch(head + read('sitemap.xml') + read('robots.txt'), /terangatech\.com|vercel\.app/);
  assert.match(read('sitemap.xml'), /<loc>https:\/\/teranga-tech\.com\/<\/loc>/);
  assert.match(read('robots.txt'), /Sitemap: https:\/\/teranga-tech\.com\/sitemap\.xml/);
  JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)[1]);
});

test('local files referenced by the page exist', () => {
  const refs = [...attrValues('src'), ...attrValues('href'), ...attrValues('srcset')]
    .filter((r) => !/^(https?:|mailto:|tel:|#)/.test(r))
    .map((r) => r.split('?')[0]);
  for (const r of refs) assert.ok(fs.existsSync(path.join(root, r)), r);
});

test('the page works under the Content-Security-Policy', () => {
  const headers = JSON.parse(read('vercel.json')).headers.find((h) => h.source === '/(.*)').headers;
  const csp = headers.find((h) => h.key === 'Content-Security-Policy').value;
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.doesNotMatch(html, /\sstyle="/, 'inline style attributes are blocked by style-src');
  assert.doesNotMatch(html, /\son[a-z]+="/, 'inline event handlers are blocked by script-src');
  const inline = [...html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g)].map((m) => m[1]);
  assert.deepEqual(inline.filter((a) => !/application\/ld\+json/.test(a)), []);
});

test('internal and local-only files are kept out of deployments', () => {
  const ignored = read('.vercelignore').split(/\r?\n/).map((l) => l.trim());
  for (const p of ['docs/', 'Pictures/', 'server.js', 'tests/', '.github/']) assert.ok(ignored.includes(p), p);
});
