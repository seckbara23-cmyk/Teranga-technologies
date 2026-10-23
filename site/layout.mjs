// Page shell shared by every page: <head> metadata, header, main, footer, script.

import { html, raw } from './lib/html.mjs';
import { SITE_URL, CONTACT, ANALYTICS, SEARCH_VERIFICATION } from './config.mjs';
import { globalHeader, globalFooter } from './components.mjs';

// Structured data (docs/TERANGA-05B-seo-implementation.md): only facts that are visible on the site.
// No address beyond the city (the office line is a neighbourhood, not a street), no ratings,
// reviews, founders or social profiles until they are verified (docs/TERANGA-05B-proof-register.md).
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
const PAGE_TYPES = { about: 'AboutPage', contact: 'ContactPage' };

function structuredData(ctx, { title, description, canonical, schema = [] }) {
  const telephone = CONTACT.phoneHref.replace(/^tel:/, '');
  const graph = [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'Teranga Technologies',
      url: `${SITE_URL}/`,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/assets/brand/apple-touch-icon.png`, width: 180, height: 180 },
      image: `${SITE_URL}/assets/brand/og-image.png`,
      description: ctx.c.pages.home.description,
      email: CONTACT.email,
      telephone,
      address: { '@type': 'PostalAddress', addressLocality: 'Dakar', addressCountry: 'SN' },
      knowsLanguage: ['fr', 'en'],
      contactPoint: { '@type': 'ContactPoint', contactType: 'sales', email: CONTACT.email, telephone, availableLanguage: ['French', 'English'] },
    },
    { '@type': 'WebSite', '@id': WEBSITE_ID, url: `${SITE_URL}/`, name: 'Teranga Technologies', inLanguage: ['en', 'fr'], publisher: { '@id': ORG_ID } },
    {
      '@type': PAGE_TYPES[ctx.page] || 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: title,
      description,
      inLanguage: ctx.lang,
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': ORG_ID },
    },
    ...schema,
  ];
  const data = { '@context': 'https://schema.org', '@graph': graph };
  // JSON in a non-executable script element is allowed by the CSP (script-src applies to executable scripts only).
  return html`<script type="application/ld+json">${raw(JSON.stringify(data, null, 2).replace(/</g, '\\u003c'))}</script>`;
}

function verification() {
  return html`${SEARCH_VERIFICATION.google ? html`<meta name="google-site-verification" content="${SEARCH_VERIFICATION.google}">` : ''}${SEARCH_VERIFICATION.bing ? html`<meta name="msvalidate.01" content="${SEARCH_VERIFICATION.bing}">` : ''}`;
}

/**
 * @param ctx  page context
 * @param opts { title, description, ogTitle?, body, bodyClass?, noindex?, alternates?, schema? }
 *             schema: extra Schema.org nodes for this page (e.g. the Services page's Service items)
 */
export function layout(ctx, { title, description, ogTitle, body, bodyClass, noindex = false, alternates = true, schema }) {
  const c = ctx.c.common;
  const canonical = `${SITE_URL}${ctx.link(ctx.page)}`;
  const alt = (l) => `${SITE_URL}${ctx.pathIn(l)}`;
  return `<!DOCTYPE html>
${html`<html lang="${ctx.lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#0B1F3A">
  <title>${title}</title>
  <meta name="description" content="${description}">
  ${noindex ? html`<meta name="robots" content="noindex">` : html`<link rel="canonical" href="${canonical}">`}
  ${noindex ? '' : verification()}
  ${alternates ? html`<link rel="alternate" hreflang="en" href="${alt('en')}">
  <link rel="alternate" hreflang="fr" href="${alt('fr')}">
  <link rel="alternate" hreflang="x-default" href="${alt('en')}">` : ''}

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Teranga Technologies">
  <meta property="og:title" content="${ogTitle || title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE_URL}/assets/brand/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${ctx.c.pages.home.ogTitle}">
  <meta property="og:locale" content="${ctx.c.locale}">
  <meta property="og:locale:alternate" content="${ctx.lang === 'fr' ? 'en_US' : 'fr_FR'}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${ogTitle || title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${SITE_URL}/assets/brand/og-image.png">

  <link rel="icon" href="/favicon.ico" sizes="48x48">
  <link rel="icon" href="/assets/brand/teranga-mark.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">
  <link rel="preload" href="/assets/fonts/bricolage-grotesque-latin-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/inter-latin-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${ctx.asset('/style.css')}">
  ${noindex ? '' : structuredData(ctx, { title, description, canonical, schema })}
  ${ANALYTICS.webAnalytics ? html`<script defer src="/_vercel/insights/script.js"></script>` : ''}
</head>
<body${bodyClass ? html` class="${bodyClass}"` : ''} data-page="${ctx.page}"${ANALYTICS.customEvents ? html` data-va-events="${ANALYTICS.maxEventProperties}"` : ''}>
  <a class="skip-link" href="#main">${c.skip}</a>
  ${globalHeader(ctx)}
  <main id="main" tabindex="-1">
${body}
  </main>
  ${globalFooter(ctx)}
  <script src="${ctx.asset('/main.js')}"></script>
</body>
</html>`}
`;
}
