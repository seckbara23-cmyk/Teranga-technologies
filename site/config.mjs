// Site-wide settings for the generator.

export const SITE_URL = 'https://teranga-tech.com';

// There is no scheduling integration: discovery-call CTAs open the contact form and the team
// replies to schedule. If a booking page (e.g. Cal.com) is adopted, set its URL here and rebuild:
// the header and hero CTAs then link to it directly.
export const BOOKING_URL = '';

// Measurement (docs/TERANGA-05A-architecture.md, docs/TERANGA-05A-analytics-activation.md).
// - webAnalytics: adds the Vercel Web Analytics script (cookieless page views) to every page.
//   Vercel serves /_vercel/insights/* only on deployments created after Web Analytics was enabled
//   for the project (2026-10-23 19:33 UTC); an older deployment answers 404 for the script.
//   Check a deployment with: node scripts/check-analytics.mjs <url>
// - customEvents: also forward the conversion events to Vercel. The team is on Pro (checked
//   2026-10-23): custom events are available with 2 properties per event (8 with Web Analytics
//   Plus), and each page view or event is billed as usage. When off, events stay in the page
//   (window.TT.events and the "tt:analytics" DOM event) for verification only.
export const ANALYTICS = {
  webAnalytics: true,
  customEvents: true,
  maxEventProperties: 2,
};

// Search engine ownership (docs/TERANGA-05B-seo-implementation.md). DNS verification is preferred
// and needs nothing here. For the "HTML tag" method, paste the content value that Google Search
// Console (google-site-verification) or Bing Webmaster Tools (msvalidate.01) shows, then regenerate.
export const SEARCH_VERIFICATION = {
  google: '',
  bing: '',
};

export const LANGS = ['en', 'fr'];
// Pages in the main navigation, then pages linked from the footer only.
export const NAV_PAGES = ['home', 'services', 'ai-engineering', 'work', 'about', 'contact'];
export const PAGES = [...NAV_PAGES, 'privacy'];

export const CONTACT = {
  email: 'seckbara23@gmail.com',
  whatsapp: 'https://wa.me/221707157070',
  phoneHref: 'tel:+221707157070',
  phoneDisplay: ['+221', '70', '715', '7070'].join(String.fromCharCode(0xa0)), // non-breaking spaces
};

export const PRODUCTS = {
  radiora:  { url: 'https://radiora.vercel.app', image: 'radiora-medical', width: 436, height: 282, webp: true },
  edusen:   { url: 'https://senegal-school-management-system.vercel.app', image: 'edusen', width: 436, height: 269, webp: true },
  xp:       { url: 'https://www.xpclient-academy.com', image: 'xp-client-academy', width: 445, height: 295, webp: false },
  sunu:     { url: 'https://sunu-permis.vercel.app', image: 'sunupermis', width: 439, height: 279, webp: false },
  clinic:   { url: 'https://clinic-health-management-system.vercel.app', image: 'clinic-management-system', width: 446, height: 272, webp: false },
};

/** URL path of a page in a language: /, /services, /fr, /fr/services … */
export function pathFor(lang, page, hash) {
  const p = page === 'home' ? '' : `/${page}`;
  const base = lang === 'fr' ? `/fr${p}` : (p || '/');
  return hash ? `${base}#${hash}` : base;
}

/** File written for a page: index.html, services.html, fr/index.html, fr/services.html … */
export function fileFor(lang, page) {
  const name = page === 'home' ? 'index' : page;
  return `${lang === 'fr' ? 'fr/' : ''}${name}.html`;
}
