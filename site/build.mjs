// Static site generator: renders every page in English and French from site/content/*.mjs
// into plain HTML at the repository root (/, /services …) and under /fr. No dependencies.
//
//   npm run generate      write the pages, 404.html and sitemap.xml
//
// The generated files are committed: Vercel serves them as they are (no build step), and
// tests/site.test.js fails if they differ from what this script would produce.
// The npm script is deliberately not called "build": Vercel runs a "build" script automatically,
// and this source folder is not uploaded (.vercelignore).

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import en from './content/en.mjs';
import fr from './content/fr.mjs';
import { frenchTypography } from './lib/typography.mjs';
import { layout } from './layout.mjs';
import { PAGE_RENDERERS, notFoundBody } from './pages.mjs';
import { SITE_URL, LANGS, PAGES, pathFor, fileFor } from './config.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CONTENT = { en, fr: frenchTypography(fr) };

// Bump when page content changes meaningfully (kept fixed so the output is reproducible).
const LASTMOD = '2026-10-23';

/** Cache-busting version from the file's content, line endings normalised (Windows checkouts use CRLF). */
function version(file) {
  const text = fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\r\n/g, '\n');
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 10);
}

/** Remove trailing spaces and runs of blank lines left by template indentation. */
function tidy(s) {
  return s.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n');
}

export function makeCtx(lang, page, versions, { switchTo } = {}) {
  return {
    lang,
    page,
    c: CONTENT[lang],
    link: (pg, hash) => pathFor(lang, pg, hash),
    pathIn: (l) => pathFor(l, switchTo || page),
    asset: (p) => `${p}?v=${versions[p]}`,
  };
}

function sitemap() {
  const urls = PAGES.flatMap((page) => LANGS.map((lang) => {
    const alt = (l) => `${SITE_URL}${pathFor(l, page)}`;
    return `  <url>
    <loc>${alt(lang)}</loc>
    <lastmod>${LASTMOD}</lastmod>
    <xhtml:link rel="alternate" hreflang="en" href="${alt('en')}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${alt('fr')}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${alt('en')}"/>
  </url>`;
  }));
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`;
}

/** Returns Map(relative file path → content). */
export function renderSite() {
  const versions = { '/style.css': version('style.css'), '/main.js': version('main.js') };
  const out = new Map();
  for (const lang of LANGS) {
    for (const page of PAGES) {
      const ctx = makeCtx(lang, page, versions);
      out.set(fileFor(lang, page), tidy(layout(ctx, PAGE_RENDERERS[page](ctx))));
    }
  }
  const ctxEn = makeCtx('en', '404', versions, { switchTo: 'home' });
  const ctxFr = makeCtx('fr', '404', versions, { switchTo: 'home' });
  out.set('404.html', tidy(layout(ctxEn, {
    title: CONTENT.en.pages.notFound.title,
    description: CONTENT.en.pages.notFound.heading,
    body: notFoundBody(ctxEn, ctxFr),
    noindex: true,
    alternates: false,
  })));
  out.set('sitemap.xml', sitemap());
  return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const files = renderSite();
  for (const [rel, content] of files) {
    const target = path.join(ROOT, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  console.log(`Generated ${files.size} files: ${[...files.keys()].join(', ')}`);
}
