// Checks of the generated multi-page site: freshness, EN/FR parity, metadata, navigation,
// links, form markup, accessibility basics, CSP compatibility and deployment configuration.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { SERVICES, INQUIRY_TYPES } = require('../api/_lib/contact');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8').replace(/\r\n/g, '\n');
const NBSP = String.fromCharCode(0xa0);

let build, config, en, fr, pages;

test.before(async () => {
  build = await import('../site/build.mjs');
  config = await import('../site/config.mjs');
  en = (await import('../site/content/en.mjs')).default;
  fr = (await import('../site/content/fr.mjs')).default;
  pages = [];
  for (const lang of config.LANGS) {
    for (const page of config.PAGES) {
      const file = config.fileFor(lang, page);
      pages.push({ lang, page, file, path: config.pathFor(lang, page), html: read(file) });
    }
  }
});

const attr = (html, re) => (re.exec(html) || [])[1];
const all = (html, re) => [...html.matchAll(re)].map((m) => m[1]);
const textOf = (html) => html
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .replace(/<style[\s\S]*?<\/style>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

function shape(v) {
  if (Array.isArray(v)) return v.map(shape);
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, shape(v[k])]));
  return typeof v;
}

test('committed pages match the generator output (run npm run generate)', () => {
  const stale = [];
  for (const [file, content] of build.renderSite()) {
    if (!fs.existsSync(path.join(root, file)) || read(file) !== content) stale.push(file);
  }
  assert.deepEqual(stale, []);
});

test('English and French content have the same structure and no empty French text', () => {
  assert.deepEqual(shape(fr), shape(en));
  const empty = [];
  (function walk(v, at) {
    if (typeof v === 'string') { if (!v.trim()) empty.push(at); return; }
    if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${at}.${k}`);
  })(fr, 'fr');
  assert.deepEqual(empty, []);
});

test('every page has its language, one h1, and unique, bounded title and description', () => {
  const titles = new Set();
  const descs = new Set();
  for (const p of pages) {
    assert.match(p.html, new RegExp(`<html lang="${p.lang}">`), p.file);
    assert.equal((p.html.match(/<h1\b/g) || []).length, 1, `${p.file} h1`);
    const title = attr(p.html, /<title>([^<]*)<\/title>/);
    const desc = attr(p.html, /<meta name="description" content="([^"]*)">/);
    assert.ok(title && title.length <= 70, `${p.file} title length ${title && title.length}`);
    assert.ok(desc && desc.length >= 80 && desc.length <= 170, `${p.file} description length ${desc && desc.length}`);
    assert.ok(!titles.has(title), `duplicate title ${title}`);
    assert.ok(!descs.has(desc), `duplicate description ${p.file}`);
    titles.add(title);
    descs.add(desc);
  }
});

test('canonical, hreflang and Open Graph point at the right production URLs', () => {
  for (const p of pages) {
    const self = `${config.SITE_URL}${p.path}`;
    const other = pages.find((q) => q.page === p.page && q.lang !== p.lang);
    assert.equal(attr(p.html, /<link rel="canonical" href="([^"]+)">/), self, p.file);
    assert.equal(attr(p.html, /hreflang="en" href="([^"]+)"/), `${config.SITE_URL}${p.lang === 'en' ? p.path : other.path}`);
    assert.equal(attr(p.html, /hreflang="fr" href="([^"]+)"/), `${config.SITE_URL}${p.lang === 'fr' ? p.path : other.path}`);
    assert.equal(attr(p.html, /hreflang="x-default" href="([^"]+)"/), attr(p.html, /hreflang="en" href="([^"]+)"/));
    assert.equal(attr(p.html, /property="og:url" content="([^"]+)"/), self);
    assert.equal(attr(p.html, /property="og:locale" content="([^"]+)"/), p.lang === 'fr' ? 'fr_FR' : 'en_US');
    assert.doesNotMatch(p.html.slice(0, p.html.indexOf('</head>')), /vercel\.app|terangatech\.com/);
  }
});

test('header navigation links every page in the same language and marks the current one', () => {
  for (const p of pages) {
    const nav = attr(p.html, /<nav class="site-nav"[^>]*>([\s\S]*?)<\/nav>/);
    const hrefs = all(nav, /href="([^"]+)"/g);
    assert.deepEqual(hrefs, config.PAGES.map((pg) => config.pathFor(p.lang, pg)), p.file);
    assert.deepEqual(all(nav, /href="([^"]+)" aria-current="page"/g), [p.path], `${p.file} current`);
    const mobile = attr(p.html, /<div class="mobile-nav"[\s\S]*?<nav[^>]*>([\s\S]*?)<\/nav>/);
    assert.deepEqual(all(mobile, /href="([^"]+)"/g), hrefs, `${p.file} mobile nav`);
  }
});

test('the language switcher goes to the same page in the other language', () => {
  for (const p of pages) {
    const other = pages.find((q) => q.page === p.page && q.lang !== p.lang);
    const switches = all(p.html, /<div class="lang-switch[^"]*" role="group" aria-label="[^"]+">([\s\S]*?)<\/div>/g);
    assert.equal(switches.length, 3, `${p.file}: header, mobile and footer switchers`);
    for (const s of switches) {
      assert.match(s, new RegExp(`href="${other.path}" lang="${other.lang}" hreflang="${other.lang}" aria-label="${other.lang.toUpperCase()}, [^"]+" data-lang-link="${other.lang}"`));
      assert.match(s, new RegExp(`href="${p.path}"[^>]*aria-current="true"`));
    }
  }
});

test('every internal link and fragment resolves', () => {
  const byPath = new Map(pages.map((p) => [p.path, p]));
  const ids = (html) => new Set(all(html, /\sid="([^"]+)"/g));
  const broken = [];
  for (const p of [...pages, { file: '404.html', html: read('404.html') }]) {
    for (const href of all(p.html, /href="([^"]+)"/g)) {
      if (/^(https?:|mailto:|tel:)/.test(href)) continue;
      const [pathAndQuery, hash] = href.split('#');
      const target = pathAndQuery.split('?')[0];
      if (!target) { if (hash && !ids(p.html).has(hash)) broken.push(`${p.file} → ${href}`); continue; }
      if (byPath.has(target)) {
        if (hash && !ids(byPath.get(target).html).has(hash)) broken.push(`${p.file} → ${href}`);
      } else if (!fs.existsSync(path.join(root, target))) broken.push(`${p.file} → ${href}`);
    }
  }
  assert.deepEqual(broken, []);
});

test('links that open a new tab do not expose the opener', () => {
  for (const p of pages) for (const m of p.html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(m[0], /rel="noopener noreferrer"/, p.file);
});

test('images have alternative text, dimensions and existing files', () => {
  for (const p of pages) {
    for (const m of p.html.matchAll(/<img\b[^>]*>/g)) {
      const tag = m[0];
      assert.match(tag, /\salt="[^"]*"/, `${p.file} alt: ${tag}`);
      if (!/brand-mark/.test(tag)) assert.match(tag, /\salt="[^"]{8,}"/, `${p.file} meaningful alt: ${tag}`);
      assert.match(tag, /\swidth="\d+" height="\d+"/, `${p.file} size: ${tag}`);
      assert.ok(fs.existsSync(path.join(root, attr(tag, /src="([^"]+)"/))), tag);
    }
    for (const s of all(p.html, /srcset="([^"]+)"/g)) assert.ok(fs.existsSync(path.join(root, s)), s);
  }
});

test('pages work under the Content-Security-Policy', () => {
  const headers = JSON.parse(read('vercel.json')).headers.find((h) => h.source === '/(.*)').headers;
  const csp = headers.find((h) => h.key === 'Content-Security-Policy').value;
  assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
  for (const p of [...pages, { file: '404.html', html: read('404.html') }]) {
    assert.doesNotMatch(p.html, /\sstyle="/, `${p.file}: inline style`);
    assert.doesNotMatch(p.html, /\son[a-z]+="/, `${p.file}: inline handler`);
    const inline = [...p.html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g)].map((m) => m[1]);
    assert.deepEqual(inline.filter((a) => !/application\/ld\+json/.test(a)), [], p.file);
  }
});

test('structured data appears only on the home pages and is valid JSON', () => {
  for (const p of pages) {
    const ld = attr(p.html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (p.page === 'home') assert.equal(JSON.parse(ld)['@type'], 'ProfessionalService');
    else assert.equal(ld, undefined, p.file);
  }
});

test('the contact form keeps its API contract and accessible markup in both languages', () => {
  for (const p of pages.filter((q) => q.page === 'contact')) {
    for (const f of ['name', 'email', 'service', 'message']) {
      const field = new RegExp(`id="f-${f}"[^>]*required[^>]*aria-describedby="([^"]*)"`).exec(p.html);
      assert.ok(field, `${p.file}: f-${f} required and described`);
      for (const id of field[1].split(' ')) assert.match(p.html, new RegExp(`id="${id}"`));
      assert.match(p.html, new RegExp(`<label for="f-${f}"`));
    }
    const options = all(p.html, /<option value="([^"]+)"/g);
    for (const s of Object.keys(SERVICES)) assert.ok(options.includes(s), `${p.file} lacks ${s}`);
    assert.match(p.html, /id="f-feedback"[^>]*role="status"[^>]*aria-live="polite"/);
    assert.match(p.html, /class="hp-field" aria-hidden="true"[\s\S]*?tabindex="-1"/);
  }
  for (const p of pages.filter((q) => q.page !== 'contact')) assert.doesNotMatch(p.html, /id="contact-form"/, p.file);
});

test('every discovery CTA goes to the contact page (with a valid service) or a real destination', () => {
  for (const p of pages) {
    const contact = config.pathFor(p.lang, 'contact');
    for (const m of p.html.matchAll(/<a\b[^>]*data-cta="[^"]*"[^>]*>/g)) {
      const href = attr(m[0], /href="([^"]+)"/);
      const ok = href === contact || href.startsWith(`${contact}?service=`) || /^(https:|mailto:|tel:)/.test(href) || pages.some((q) => q.path === href);
      assert.ok(ok, `${p.file}: ${href}`);
      const svc = /\?service=([a-z]+)/.exec(href);
      if (svc) assert.ok(SERVICES[svc[1]], `${p.file}: unknown service ${svc[1]}`);
    }
    for (const s of all(p.html, /data-service="([^"]+)"/g)) assert.ok(SERVICES[s], s);
  }
});

test('French pages use a non-breaking space before ? ! : ;', () => {
  for (const p of pages.filter((q) => q.lang === 'fr')) {
    const t = textOf(p.html).replace(/https?:\/\/\S+/g, '');
    const bad = t.match(/.{0,25} [?!:;].{0,10}/g);
    assert.equal(bad, null, `${p.file}: ${bad}`);
  }
});

test('no unapproved promises, fake proof or broken-flow labels are published', () => {
  for (const p of pages) {
    const t = textOf(p.html);
    assert.doesNotMatch(t, /24 hours|24\s?heures|guarantee|garanti|testimonial|témoignage|certified|certifié|award|world-class|leading|n°\s?1/i, p.file);
    assert.doesNotMatch(t, /Get a (Free )?Quote|Request Submitted|Book a discovery call|Réserver un appel/i, p.file);
  }
  assert.match(read('site/config.mjs'), /export const BOOKING_URL = '';/);
});

test('every lead goes to the API: no console-only quote wizard remains', () => {
  const js = read('main.js');
  assert.doesNotMatch(js, /console\.(log|info|debug|table)\(/);
  assert.doesNotMatch(js + pages.map((p) => p.html).join(''), /quote-modal|Quote Submission|api\/quote|q\.success/i);
  assert.match(js, /fetch\('\/api\/contact'/);
  const type = /type:\s+'([a-z]+)'/.exec(js)[1];
  assert.ok(INQUIRY_TYPES[type], `form sends unknown inquiry type ${type}`);
});

test('form and menu messages exist in both languages with the same keys', async () => {
  const js = read('main.js');
  const block = /var MESSAGES = (\{[\s\S]*?\n {2}\});/.exec(js)[1];
  const MESSAGES = Function(`var NB = '${NBSP}'; return (${block});`)();
  assert.deepEqual(Object.keys(MESSAGES.fr).sort(), Object.keys(MESSAGES.en).sort());
  for (const k of Object.keys(MESSAGES.en)) assert.notEqual(MESSAGES.fr[k], MESSAGES.en[k], `${k} is not translated`);
  for (const l of ['en', 'fr']) assert.match(MESSAGES[l].error, /data-fallback="email"[\s\S]*data-fallback="whatsapp"/);
  // The messages follow the page language (no runtime switch can leave a stale language).
  assert.match(js, /var lang = document\.documentElement\.lang === 'fr' \? 'fr' : 'en';/);
});

test('links from the previous one-page site land on an existing page and section', () => {
  const js = read('main.js');
  const map = Function(`return (${/var LEGACY_HASHES = (\{[\s\S]*?\});/.exec(js)[1]});`)();
  for (const [hash, [page, id]] of Object.entries(map)) {
    for (const lang of ['en', 'fr']) {
      const target = pages.find((p) => p.lang === lang && p.page === page);
      assert.ok(target, `#${hash} → ${page}`);
      if (id) assert.match(target.html, new RegExp(`\\sid="${id}"`), `#${hash} → ${page}#${id}`);
    }
  }
  for (const lang of ['en', 'fr']) {
    const home = pages.find((p) => p.lang === lang && p.page === 'home').html;
    for (const id of ['why', 'process']) assert.match(home, new RegExp(`\\sid="${id}"`), `home keeps #${id}`);
  }
});

test('no Resend key, configuration or API address reaches browser code', () => {
  for (const [name, content] of [...pages.map((p) => [p.file, p.html]), ['main.js', read('main.js')], ['style.css', read('style.css')]]) {
    assert.doesNotMatch(content, /re_[A-Za-z0-9]{8,}|RESEND|LEAD_NOTIFICATION|api\.resend\.com|notifications@teranga-tech\.com/, name);
  }
});

test('sitemap lists every page in both languages with alternates; robots points to it', () => {
  const sm = read('sitemap.xml');
  for (const p of pages) assert.match(sm, new RegExp(`<loc>${config.SITE_URL}${p.path}</loc>`), p.path);
  assert.equal((sm.match(/<url>/g) || []).length, pages.length);
  assert.equal((sm.match(/hreflang="fr"/g) || []).length, pages.length);
  assert.match(read('robots.txt'), /Sitemap: https:\/\/teranga-tech\.com\/sitemap\.xml/);
});

test('the 404 page is not indexed and links to every page in both languages', () => {
  const nf = read('404.html');
  assert.match(nf, /<meta name="robots" content="noindex">/);
  assert.doesNotMatch(nf, /rel="canonical"/);
  for (const p of pages) assert.match(nf, new RegExp(`href="${p.path}"`), p.path);
});

test('deployment serves clean URLs and keeps internal and source files private', () => {
  const v = JSON.parse(read('vercel.json'));
  assert.equal(v.cleanUrls, true);
  assert.ok(v.redirects.some((r) => r.source === '/' && r.destination === '/fr' && r.has[0].key === 'lang' && r.has[0].value === 'fr'));
  const ignored = read('.vercelignore').split('\n').map((l) => l.trim());
  for (const p of ['docs/', 'Pictures/', 'server.js', 'tests/', '.github/', 'site/']) assert.ok(ignored.includes(p), p);
  // Vercel runs a "build" (or "vercel-build") script automatically; the generator source is not
  // uploaded, so such a script would fail the deployment. The committed HTML is what gets served.
  const scripts = JSON.parse(read('package.json')).scripts;
  assert.equal(scripts.build, undefined);
  assert.equal(scripts['vercel-build'], undefined);
});
