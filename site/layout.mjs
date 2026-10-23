// Page shell shared by every page: <head> metadata, header, main, footer, script.

import { html, raw } from './lib/html.mjs';
import { SITE_URL, CONTACT, ANALYTICS } from './config.mjs';
import { globalHeader, globalFooter } from './components.mjs';

function jsonLd(ctx) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Teranga Technologies',
    description: ctx.c.pages.home.description,
    url: `${SITE_URL}${ctx.link('home')}`,
    logo: `${SITE_URL}/assets/brand/apple-touch-icon.png`,
    image: `${SITE_URL}/assets/brand/og-image.png`,
    telephone: '+221707157070',
    email: CONTACT.email,
    address: { '@type': 'PostalAddress', streetAddress: 'Ngor Almadies', addressLocality: 'Dakar', addressCountry: 'SN' },
    areaServed: ['Senegal', 'Africa', 'Europe', 'North America'],
    knowsLanguage: ['fr', 'en'],
    serviceType: ['SaaS Development', 'AI Integration', 'Web Application Development', 'Mobile Application Development', 'Web Design'],
  };
  // JSON in a non-executable script element is allowed by the CSP (script-src applies to executable scripts only).
  return html`<script type="application/ld+json">${raw(JSON.stringify(data, null, 2).replace(/</g, '\\u003c'))}</script>`;
}

/**
 * @param ctx  page context
 * @param opts { title, description, ogTitle?, body, bodyClass?, noindex?, alternates? }
 */
export function layout(ctx, { title, description, ogTitle, body, bodyClass, noindex = false, alternates = true }) {
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

  <link rel="icon" href="/assets/brand/teranga-mark.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">
  <link rel="preload" href="/assets/fonts/bricolage-grotesque-latin-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/assets/fonts/inter-latin-var.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${ctx.asset('/style.css')}">
  ${ctx.page === 'home' && !noindex ? jsonLd(ctx) : ''}
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
