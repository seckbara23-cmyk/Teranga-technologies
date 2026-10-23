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

test('header navigation links every main page in the same language and marks the current one', () => {
  assert.deepEqual(config.PAGES.filter((pg) => !config.NAV_PAGES.includes(pg)), ['privacy']);
  for (const p of pages) {
    const nav = attr(p.html, /<nav class="site-nav"[^>]*>([\s\S]*?)<\/nav>/);
    const hrefs = all(nav, /href="([^"]+)"/g);
    assert.deepEqual(hrefs, config.NAV_PAGES.map((pg) => config.pathFor(p.lang, pg)), p.file);
    assert.deepEqual(all(nav, /href="([^"]+)" aria-current="page"/g), config.NAV_PAGES.includes(p.page) ? [p.path] : [], `${p.file} current`);
    const mobile = attr(p.html, /<div class="mobile-nav"[\s\S]*?<nav[^>]*>([\s\S]*?)<\/nav>/);
    assert.deepEqual(all(mobile, /href="([^"]+)"/g), hrefs, `${p.file} mobile nav`);
  }
});

test('every page links to the privacy page in its language from the footer and the form', () => {
  for (const p of pages) {
    const footer = attr(p.html, /<footer class="site-footer">([\s\S]*?)<\/footer>/);
    assert.match(footer, new RegExp(`href="${config.pathFor(p.lang, 'privacy')}"`), p.file);
  }
  for (const p of pages.filter((q) => q.page === 'contact')) {
    const note = attr(p.html, /<p class="form-note">([\s\S]*?)<\/p>/);
    assert.match(note, new RegExp(`<a href="${config.pathFor(p.lang, 'privacy')}">`), p.file);
  }
});

test('the privacy page describes what is actually collected, stored and processed', () => {
  for (const lang of config.LANGS) {
    const p = pages.find((q) => q.lang === lang && q.page === 'privacy');
    const t = textOf(p.html);
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'Vercel', 'Resend', 'Google', 'seckbara23@gmail.com']) assert.ok(t.includes(k), `${p.file}: ${k}`);
    assert.match(t, lang === 'fr' ? /Aucun cookie/ : /No cookies/);
    assert.match(t, lang === 'fr' ? /12\smois/ : /12 months/); // \s: French typography uses a non-breaking space
    // The analytics section is published exactly when the analytics script is.
    assert.equal(/id="analytics"/.test(p.html), config.ANALYTICS.webAnalytics, p.file);
    // Recorded actions are disclosed exactly when conversion events are sent to Vercel.
    const events = (lang === 'fr' ? fr : en).pages.privacy.sections.find((s) => s.id === 'analytics').events;
    assert.ok(typeof events === 'string' && events.length > 40, 'events disclosure written');
    assert.equal(/(also records a few actions|enregistre aussi quelques actions)/.test(t), config.ANALYTICS.webAnalytics && config.ANALYTICS.customEvents, `${p.file} events disclosure`);
  }
});

test('custom events are sent with no more properties than the Pro plan records', () => {
  // Vercel Pro records 2 properties per custom event (8 with Web Analytics Plus).
  assert.ok([2, 8].includes(config.ANALYTICS.maxEventProperties), `maxEventProperties ${config.ANALYTICS.maxEventProperties}`);
  for (const p of pages) {
    const v = attr(p.html, /<body\b[^>]*\bdata-va-events="(\d+)"/);
    assert.equal(v, config.ANALYTICS.customEvents ? String(config.ANALYTICS.maxEventProperties) : undefined, p.file);
  }
});

test('Web Analytics loads from the first-party path only when enabled; events go to Vercel only on request', () => {
  for (const p of [...pages, { file: '404.html', html: read('404.html') }]) {
    const tags = all(p.html, /<script\b([^>]*)>/g).filter((a) => /src=/.test(a));
    const insights = tags.filter((a) => /_vercel\/insights/.test(a));
    assert.deepEqual(insights, config.ANALYTICS.webAnalytics ? [' defer src="/_vercel/insights/script.js"'] : [], p.file);
    // No other analytics or marketing tracker is loaded.
    assert.ok(tags.every((a) => /src="\/(main\.js\?v=|_vercel\/insights\/script\.js)/.test(a)), `${p.file}: ${tags}`);
    assert.doesNotMatch(p.html, /googletagmanager|google-analytics|gtag\(|fbq\(|plausible|hotjar|clarity\.ms|segment\.com/i, p.file);
    assert.equal(/data-va-events="\d+"/.test(p.html), config.ANALYTICS.customEvents, p.file);
  }
  assert.ok(config.ANALYTICS.maxEventProperties >= 1 && config.ANALYTICS.maxEventProperties <= 8);
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

test('structured data: one valid graph per indexable page, describing only what the page shows', () => {
  const ORG = `${config.SITE_URL}/#organization`;
  const SITE = `${config.SITE_URL}/#website`;
  for (const p of pages) {
    const blocks = all(p.html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
    assert.equal(blocks.length, 1, `${p.file}: one JSON-LD block`);
    const data = JSON.parse(blocks[0]);
    assert.equal(data['@context'], 'https://schema.org');
    const graph = data['@graph'];
    const byId = new Map(graph.filter((n) => n['@id']).map((n) => [n['@id'], n]));
    const org = byId.get(ORG);
    assert.equal(org['@type'], 'Organization', p.file);
    assert.equal(byId.get(SITE)['@type'], 'WebSite', p.file);
    // Organization facts are the ones shown in the footer of every page.
    const text = textOf(p.html);
    assert.ok(text.includes(org.email), `${p.file}: email visible`);
    assert.ok(p.html.includes(`href="tel:${org.telephone}"`), `${p.file}: phone visible`);
    assert.equal(org.address.addressLocality, 'Dakar');
    assert.equal(org.address.addressCountry, 'SN');
    assert.equal(org.address.streetAddress, undefined, 'no street address: the office line is a neighbourhood');
    // The page node matches the page's own metadata.
    const page = graph.find((n) => n['@id'] === `${config.SITE_URL}${p.path}#webpage`);
    assert.ok(page, `${p.file}: WebPage node`);
    assert.equal(page.url, attr(p.html, /<link rel="canonical" href="([^"]+)">/));
    assert.equal(page.name, attr(p.html, /<title>([^<]*)<\/title>/).replace(/&amp;/g, '&').replace(/&#39;/g, "'"));
    assert.equal(page.inLanguage, p.lang);
    assert.equal(page['@type'], { about: 'AboutPage', contact: 'ContactPage' }[p.page] || 'WebPage');
    // Every reference resolves inside the graph.
    for (const n of graph) for (const k of ['provider', 'isPartOf', 'about', 'publisher']) if (n[k]) assert.ok(byId.has(n[k]['@id']), `${p.file}: ${k} → ${n[k]['@id']}`);
    // Nothing that is not on the site: no ratings, reviews, founders, awards, profiles or FAQ markup.
    assert.doesNotMatch(blocks[0], /aggregateRating|"review|"Review|founder|award|sameAs|FAQPage|LocalBusiness|ProfessionalService/, p.file);
  }
  for (const p of pages.filter((q) => q.page === 'services')) {
    const graph = JSON.parse(attr(p.html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/))['@graph'];
    const services = graph.filter((n) => n['@type'] === 'Service');
    const c = p.lang === 'fr' ? fr : en;
    assert.deepEqual(services.map((s) => s.url), c.pages.services.items.map((s) => `${config.SITE_URL}${p.path}#${s.id}`));
    for (const s of services) {
      assert.match(p.html, new RegExp(`<span class="eyebrow">${s.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</span>`), `${p.file}: ${s.name} is the visible heading`);
      assert.match(p.html, new RegExp(`\\sid="${s.url.split('#')[1]}"`));
    }
  }
  assert.doesNotMatch(read('404.html'), /application\/ld\+json/, '404 has no structured data');
});

test('every page has one h1 first in main and no skipped heading levels', () => {
  for (const p of [...pages, { file: '404.html', html: read('404.html') }]) {
    const main = attr(p.html, /(<main\b[\s\S]*<\/main>)/);
    const levels = all(main, /<h([1-6])\b/g).map(Number);
    assert.equal(levels[0], 1, `${p.file}: h1 first`);
    assert.equal(levels.filter((l) => l === 1).length, 1, `${p.file}: one h1`);
    for (let i = 1; i < levels.length; i++) assert.ok(levels[i] <= levels[i - 1] + 1, `${p.file}: h${levels[i - 1]} → h${levels[i]}`);
  }
});

test('production stays indexable; previews keep Vercel\'s protection; duplicates redirect to the canonical host', () => {
  const v = JSON.parse(read('vercel.json'));
  // No X-Robots-Tag of our own: Vercel adds "noindex" to preview deployments itself, and production must stay indexable.
  assert.doesNotMatch(JSON.stringify(v.headers), /x-robots-tag/i);
  assert.equal(v.trailingSlash, false, '/services/ redirects to /services');
  const host = v.redirects.find((r) => r.has && r.has.some((h) => h.type === 'host'));
  assert.deepEqual(host, { source: '/:path*', has: [{ type: 'host', value: 'teranga-technologies.vercel.app' }], destination: 'https://teranga-tech.com/:path*', permanent: true });
  for (const p of pages) assert.doesNotMatch(p.html, /<meta name="robots"/, `${p.file} is indexable`);
  assert.match(read('404.html'), /<meta name="robots" content="noindex">/);
  const robots = read('robots.txt');
  assert.match(robots, /^User-agent: \*\nAllow: \/\n/);
  assert.doesNotMatch(robots, /Disallow: \/\s*$/m);
});

test('the sitemap lists exactly the canonical URLs, with reciprocal language alternates', () => {
  const sm = read('sitemap.xml');
  const locs = all(sm, /<loc>([^<]+)<\/loc>/g);
  assert.deepEqual(locs.sort(), pages.map((p) => attr(p.html, /<link rel="canonical" href="([^"]+)">/)).sort());
  for (const entry of all(sm, /<url>([\s\S]*?)<\/url>/g)) {
    const loc = attr(entry, /<loc>([^<]+)<\/loc>/);
    const p = pages.find((q) => `${config.SITE_URL}${q.path}` === loc);
    assert.match(attr(entry, /<lastmod>([^<]+)<\/lastmod>/), /^\d{4}-\d{2}-\d{2}$/);
    for (const l of ['en', 'fr']) assert.equal(attr(entry, new RegExp(`hreflang="${l}" href="([^"]+)"`)), attr(p.html, new RegExp(`<link rel="alternate" hreflang="${l}" href="([^"]+)">`)), `${loc} ${l}`);
  }
});

test('a real favicon.ico is served and referenced next to the SVG icon', () => {
  const ico = fs.readFileSync(path.join(root, 'favicon.ico'));
  assert.deepEqual([ico.readUInt16LE(0), ico.readUInt16LE(2)], [0, 1], 'ICO header');
  const sizes = [...Array(ico.readUInt16LE(4)).keys()].map((i) => ico[6 + 16 * i]);
  assert.ok(sizes.includes(48), `sizes ${sizes}`);
  for (const p of pages) {
    assert.match(p.html, /<link rel="icon" href="\/favicon\.ico" sizes="48x48">/);
    assert.match(p.html, /<link rel="icon" href="\/assets\/brand\/teranga-mark\.svg" type="image\/svg\+xml">/);
  }
});

test('search verification tags are absent until a token is set, then escaped', () => {
  for (const p of pages) assert.doesNotMatch(p.html, /google-site-verification|msvalidate/, p.file);
  const saved = { ...config.SEARCH_VERIFICATION };
  try {
    config.SEARCH_VERIFICATION.google = 'tok"en<x';
    config.SEARCH_VERIFICATION.bing = 'B1NG';
    const home = build.renderSite().get('index.html');
    assert.match(home, /<meta name="google-site-verification" content="tok&quot;en&lt;x">/);
    assert.match(home, /<meta name="msvalidate\.01" content="B1NG">/);
    assert.doesNotMatch(build.renderSite().get('404.html'), /google-site-verification/, 'not on the noindex page');
  } finally {
    Object.assign(config.SEARCH_VERIFICATION, saved);
  }
});

test('ScolaTech is presented as formerly EduSen, with its own URL and a screenshot of its current identity', () => {
  const label = { en: 'ScolaTech (formerly EduSen)', fr: 'ScolaTech (anciennement EduSen)' };
  for (const p of pages.filter((q) => ['home', 'work'].includes(q.page))) {
    const t = textOf(p.html).replace(/\s+/g, ' ');
    assert.ok(t.includes(label[p.lang]), `${p.file}: ${label[p.lang]}`);
    // "EduSen" only ever appears as the former name.
    assert.equal(t.split('EduSen').length - 1, t.split(`${p.lang === 'fr' ? 'anciennement' : 'formerly'} EduSen`).length - 1, `${p.file}: bare EduSen`);
  }
  assert.equal(config.PRODUCTS.edusen.url, 'https://scolatech.app');
  assert.equal(config.PRODUCTS.edusen.image, 'scolatech');
  for (const p of pages) {
    assert.doesNotMatch(p.html, /senegal-school-management-system\.vercel\.app|assets\/portfolio\/edusen\./, p.file);
    for (const m of p.html.matchAll(/<img\b[^>]*src="\/assets\/portfolio\/scolatech\.png"[^>]*>/g)) assert.match(m[0], /alt="[^"]*ScolaTech[^"]*"/, `${p.file}: alt names ScolaTech`);
  }
  assert.ok(!fs.existsSync(path.join(root, 'assets/portfolio/edusen.png')), 'old EduSen-branded screenshot removed');
  // The lineage is recorded with its evidence before the name is published.
  const register = read('docs/TERANGA-05B-proof-register.md');
  assert.match(register, /ScolaTech \(formerly EduSen\)[\s\S]*Lineage verified/);
  assert.match(register, /aec8d08/);
  assert.match(register, /"name": "EduSen"[\s\S]*"name": "ScolaTech"/);
});

test('no fixed delivery timeline is published (scope-dependent wording only)', () => {
  for (const p of [...pages, { file: '404.html', html: read('404.html') }]) {
    // The contact form's own start-date options ("Within 1–3 months") are the visitor's choice, not a promise.
    const t = textOf(p.html.replace(/<select[\s\S]*?<\/select>/g, '')).replace(/\s+/g, ' ');
    assert.doesNotMatch(t, /\d+\s*(?:–|-|à|to)\s*\d+\s*(?:weeks?|semaines?|months?|mois)\b/i, p.file);
    assert.doesNotMatch(t, /\b(?:in|within|en|sous)\s+\d+\s*(?:weeks?|semaines?)\b/i, p.file);
  }
  for (const [lang, c] of [['en', en], ['fr', fr]]) {
    const saas = c.pages.services.items.find((s) => s.id === 'saas').outcome;
    assert.match(saas, lang === 'fr' ? /calendrier réaliste lors du cadrage/ : /realistic delivery plan during discovery/);
    const faq = c.pages.contact.faq.items.find((f) => /MVP/.test(f.q)).a;
    assert.match(faq, lang === 'fr' ? /calendrier réaliste lors du cadrage/ : /realistic delivery plan during discovery/);
  }
});

test('XP Client Academy is attributed to its owner, XP Client Consulting; no native-app claim', () => {
  for (const p of pages.filter((q) => q.page === 'work')) {
    const item = attr(p.html, /(<li class="more-card"[\s\S]*?xpclient-academy\.com[\s\S]*?<\/li>)/);
    assert.match(textOf(item), p.lang === 'fr' ? /pour XP Client Consulting/ : /for XP Client Consulting/, p.file);
  }
  for (const p of pages) assert.doesNotMatch(textOf(p.html), /native (iOS|Android|mobile) app|application native|appli native|iOS and Android apps|Applications iOS et Android/i, p.file);
});

test('portfolio links match the proof register; nothing links to private folders', () => {
  const register = read('docs/TERANGA-05B-proof-register.md');
  for (const [key, product] of Object.entries(config.PRODUCTS)) {
    assert.ok(register.includes(product.url), `proof register covers ${key} (${product.url})`);
    for (const p of pages.filter((q) => q.page === 'work')) assert.ok(p.html.includes(`href="${product.url}"`), `${p.file} links ${product.url}`);
  }
  for (const p of [...pages, { file: '404.html', html: read('404.html') }, { file: 'sitemap.xml', html: read('sitemap.xml') }]) {
    assert.doesNotMatch(p.html, /(href|src)="\/?(docs|tests|scripts|site|Pictures)\//, p.file);
    assert.doesNotMatch(p.html, /teranga-tech\.com\/(docs|tests|scripts|site)\//, p.file);
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
      const ok = href === contact || href.startsWith(`${contact}?service=`) || /^(https:|mailto:|tel:)/.test(href) || pages.some((q) => q.path === href.split('#')[0]);
      assert.ok(ok, `${p.file}: ${href}`);
      const svc = /\?service=([a-z]+)/.exec(href);
      if (svc) assert.ok(SERVICES[svc[1]], `${p.file}: unknown service ${svc[1]}`);
    }
    for (const s of all(p.html, /data-service="([^"]+)"/g)) assert.ok(SERVICES[s], s);
  }
});

test('discovery CTAs use the standard wording and preselect their service', () => {
  const lead = { en: /^Discuss (your|ongoing|a similar)/, fr: /^Parlons (de|du|d’)/ };
  for (const [lang, c] of [['en', en], ['fr', fr]]) {
    assert.equal(c.common.cta, lang === 'fr' ? 'Parlons de votre projet' : 'Discuss your project');
    assert.equal(c.common.finalCta.button, c.common.cta);
    for (const s of c.pages.services.items) assert.match(s.cta, lead[lang], `${lang} ${s.id}: ${s.cta}`);
    assert.match(c.pages['ai-engineering'].cta.button, lead[lang]);
    assert.match(c.pages.work.labels.discuss, lead[lang]);
  }
  for (const p of pages) {
    for (const m of p.html.matchAll(/<a\b[^>]*data-service="([^"]+)"[^>]*>/g)) {
      assert.match(m[0], new RegExp(`href="${config.pathFor(p.lang, 'contact')}\\?service=${m[1]}"`), `${p.file}: ${m[0]}`);
    }
  }
});

test('case-study and product links name their project for measurement', () => {
  const keys = Object.keys(config.PRODUCTS);
  for (const p of pages) {
    for (const m of p.html.matchAll(/<a\b[^>]*href="(\/(?:fr\/)?work#[a-z]+)"[^>]*>/g)) {
      if (/class="text-link"/.test(m[0])) assert.match(m[0], /data-case="[a-z]+"/, `${p.file}: ${m[0]}`);
    }
    for (const k of all(p.html, /data-case="([^"]+)"/g)) assert.ok(keys.includes(k), `${p.file}: ${k}`);
  }
});

test('the confirmation panel is hidden until the server accepts, and is accessible', () => {
  for (const p of pages.filter((q) => q.page === 'contact')) {
    const c = p.lang === 'fr' ? fr : en;
    const panel = attr(p.html, /(<div id="f-confirm"[\s\S]*?<\/button>\s*<\/div>)/);
    assert.ok(panel, p.file);
    assert.match(panel, /^<div id="f-confirm" class="form-confirm" hidden>/);
    assert.match(panel, /<h2 id="f-confirm-title" tabindex="-1">/);
    assert.match(panel, /id="f-confirm-ref-box" hidden/);
    assert.match(panel, /<button type="button" class="btn btn-outline" id="f-again">/);
    const t = textOf(panel).replace(/\s+/g, ' ');
    const expected = p.lang === 'fr'
      ? 'Merci. Nous avons bien reçu votre demande. Nous nous efforçons de vous répondre sous un jour ouvré.'
      : 'Thank you. Your project inquiry has been received. We aim to respond within one business day.';
    assert.ok(t.includes(expected), `${p.file}: ${t}`);
    assert.ok(t.includes(c.pages.contact.form.confirmRef), `${p.file}: reference label`);
    assert.doesNotMatch(t, /booked|réservé|confirmed call|appel confirmé/i, 'no booking claim');
  }
  const js = read('main.js');
  // Success is shown and counted only in the branch reached after res.ok.
  const okAt = js.indexOf("if (!res.ok) throw new Error('HTTP ' + res.status);");
  assert.ok(okAt > 0);
  assert.ok(js.indexOf("emit('lead_submit_success'") > okAt);
  assert.ok(js.indexOf('showConfirmation(ref)', okAt) > okAt);
  assert.equal((js.match(/showConfirmation\(/g) || []).length, 2, 'defined once, called once');
});

test('the event schema is the documented taxonomy and carries no personal data', () => {
  const js = read('main.js');
  const block = /var EVENTS = (\{[\s\S]*?\n {2}\});/.exec(js)[1];
  const schema = Function(`var SERVICE = /x/, SLUG = /x/, FIELD_LIST = /x/; return (${block});`)();
  assert.deepEqual(Object.keys(schema).sort(), [
    'case_study_click', 'contact_form_start', 'contact_form_validation_error', 'email_click',
    'lead_submit_failure', 'lead_submit_success', 'service_cta_click', 'whatsapp_click',
  ]);
  const props = new Set(Object.values(schema).flatMap((s) => Object.keys(s)));
  for (const pii of ['name', 'email', 'company', 'message', 'phone', 'ref', 'reference', 'ip', 'url', 'referrer', 'text', 'value']) assert.ok(!props.has(pii), pii);
  for (const s of Object.values(schema)) for (const re of Object.values(s)) assert.ok(re instanceof RegExp);
  // Every emit() uses a declared event; the taxonomy document lists each one.
  const used = [...js.matchAll(/emit\('([a-z_]+)'/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(used)].sort(), Object.keys(schema).sort());
  const doc = read('docs/TERANGA-05A-analytics-taxonomy.md');
  for (const name of Object.keys(schema)) assert.match(doc, new RegExp('`' + name + '`'), name);
  // Old names and other vendors' globals are gone.
  assert.doesNotMatch(js, /\btrack\(|'(cta_click|form_start|form_invalid|lead_submitted|lead_failed|lead_fallback|language_switch)'|plausible|dataLayer/);
});

test('the browser sends only the attribution keys the server accepts', async () => {
  const js = read('main.js');
  const keys = Function(`return ${/var UTM_KEYS = (\[[^\]]*\]);/.exec(js)[1]};`)();
  const { cleanAttribution } = require('../api/_lib/contact');
  const sample = Object.fromEntries(keys.map((k) => [k, 'x']));
  assert.deepEqual(Object.keys(cleanAttribution({ ...sample, referrer: 'example.org', entry: '/' }, '/contact')).sort(),
    [...keys, 'referrer', 'entry', 'page', 'channel'].sort());
  assert.match(js, /fresh\.referrer = ref;/);
  assert.match(js, /new URL\(document\.referrer\)\.hostname/, 'only the referrer host is read');
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
    // Generic or unsupported positioning (TERANGA-05B): no boilerplate superlatives, no "in production" labels
    // for products whose usage is not documented (docs/TERANGA-05B-proof-register.md).
    assert.doesNotMatch(t, /innovative solutions|solutions innovantes|cutting-edge|de pointe|best-in-class|state-of-the-art|trusted by|ils nous font confiance|In production\s*:|En production\s*:/i, p.file);
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
  for (const p of ['docs/', 'Pictures/', 'server.js', 'tests/', '.github/', 'site/', 'scripts/']) assert.ok(ignored.includes(p), p);
  // Vercel runs a "build" (or "vercel-build") script automatically; the generator source is not
  // uploaded, so such a script would fail the deployment. The committed HTML is what gets served.
  const scripts = JSON.parse(read('package.json')).scripts;
  assert.equal(scripts.build, undefined);
  assert.equal(scripts['vercel-build'], undefined);
});
