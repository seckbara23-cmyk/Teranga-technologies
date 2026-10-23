# Teranga Technologies — Website

Marketing site for Teranga Technologies (teranga-tech.com): six pages in English and French with a discovery-call form. Static HTML/CSS/JS generated from one source by a small dependency-free script, one serverless function for the form, deployed on Vercel. Vercel runs no build: the generated HTML is committed.

## Pages

| English | French | Content |
|---|---|---|
| `/` | `/fr` | Home: hero, capabilities, selected work, why Teranga, process, call to action |
| `/services` | `/fr/services` | Six services: problem, deliverables, typical uses, outcome |
| `/ai-engineering` | `/fr/ai-engineering` | AI capabilities, safeguards, the Radiora example |
| `/work` | `/fr/work` | Radiora Medical and EduSen case studies, three more products |
| `/about` | `/fr/about` | Name, principles, collaboration, location |
| `/contact` | `/fr/contact` | Discovery-call form, next steps, direct contacts, FAQ |

`404.html` is a bilingual not-found page. Links from the previous one-page site keep working: `/?lang=fr` redirects to `/fr` (vercel.json and main.js), and `/#services`, `/#work-radiora`, `/#contact`, `/#faq` … are sent to the matching page by `main.js`.

## Structure

```
├── site/                 # Page generator (not deployed)
│   ├── build.mjs         # npm run generate → *.html, fr/*.html, 404.html, sitemap.xml
│   ├── content/en.mjs    # All English copy
│   ├── content/fr.mjs    # All French copy (same structure, checked by tests)
│   ├── components.mjs    # Header, footer, hero, cards, timeline, CTA, contact form …
│   ├── pages.mjs         # Page compositions
│   ├── layout.mjs        # <head> metadata (canonical, hreflang, Open Graph, JSON-LD)
│   └── config.mjs        # Site URL, contact details, product links, BOOKING_URL
├── index.html, services.html, ai-engineering.html, work.html, about.html, contact.html
├── fr/                   # French pages (generated)
├── 404.html, sitemap.xml # Generated
├── style.css             # "Teranga Signature" design system (tokens at the top)
├── main.js               # Language preference, legacy links, menu, hero demo, form, motion
├── api/
│   ├── contact.js        # Vercel function: POST /api/contact
│   └── _lib/contact.js   # Shared validation + Resend notification (also used by server.js)
├── server.js             # Local Express server (same clean URLs, /api/contact, /api/health)
├── assets/
│   ├── brand/            # Interim logo mark (SVG), touch icon, social share image
│   ├── fonts/            # Self-hosted Bricolage Grotesque + Inter (SIL OFL)
│   └── portfolio/        # Product screenshots (PNG + WebP)
├── Pictures/             # Original image files: unused and excluded from deploys (.vercelignore)
├── docs/                 # Internal documents — excluded from deployment
├── tests/                # node:test suite (npm test) — not deployed
├── .github/workflows/    # CI — not deployed
├── robots.txt
└── vercel.json           # cleanUrls, ?lang=fr redirect, function settings, security headers, caching
```

## Run locally

```bash
npm install
cp .env.example .env      # fill in the Resend settings
npm run generate             # regenerate the pages after editing site/, style.css or main.js
npm start                 # http://localhost:3000
```

## Environment variables

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key with sending access (Vercel type **Sensitive**). Server-side only |
| `RESEND_FROM_EMAIL` | Sender on a domain verified in Resend: `Teranga Technologies <notifications@teranga-tech.com>` |
| `LEAD_NOTIFICATION_EMAIL` | Inbox that receives requests (`seckbara23@gmail.com`); up to five addresses, comma-separated |
| `ALLOWED_ORIGIN` | Optional. Only needed if another domain must call the API cross-origin |
| `CONTACT_RATE_LIMIT` | Requests per IP before a 429 (default 5): per 10 min per instance on Vercel, per 15 min on the local server |

Set the three Resend variables in Vercel for **Production and Preview**, then redeploy. If any is missing or malformed, the API answers a generic 503, logs which variable is wrong (never its value), and visitors see the error with the pre-filled email/WhatsApp fallback. Do not set `RESEND_BASE_URL` outside tests. Setup, DNS and delivery test: `docs/commercial-operating-guide.md` §1.

Delivery: the API returns success only after Resend accepts the message (an email id). Acceptance is not inbox delivery; check Resend → Emails for Delivered/Bounced. Each submission uses its own Resend idempotency key (safe retries on 429/5xx), and an identical request repeated within 10 minutes is not sent twice.

## Editing content

- Text lives in `site/content/en.mjs` and `site/content/fr.mjs`; layout and components in `site/`. Run `npm run generate` and commit the regenerated HTML. `npm test` fails if the committed pages differ from the generator output, or if the two languages drift apart in structure.
- Write French with ordinary spaces: the build adds non-breaking spaces before ? ! : ; and inside « ».
- Internal links are written as `{ page, hash }` and resolved per language (`/services#saas`, `/fr/services#saas`).
- The CSS and JS URLs carry a content hash (`?v=…`) computed by the build, so returning visitors always get the current files.
- Language: each page exists in both languages. Order of preference: `?lang=fr|en` → the visitor's saved choice (set by the EN/FR switcher) → French browsers are sent to French pages; a shared French link always stays French.
- Booking link: there is no scheduling integration, so CTAs open the contact form ("Discuss your project"). If `BOOKING_URL` in `site/config.mjs` is set to a booking page and the site rebuilt, the header and hero CTAs say "Book a discovery call" and open it.
- Service CTAs link to `/contact?service=<id>`, which pre-selects the service in the form.

## API

| Method | Path | Description |
|---|---|---|
| POST | `/api/contact` | Discovery-call request. JSON: `name`, `email`, `service`, `message` (required); `type`, `company`, `timeline`, `phone`, `subject`, `lang`, `source` (optional); `website` is a honeypot. |
| GET | `/api/health` | Health check (local server only) |

`service` accepts `saas`, `ai`, `webapp`, `mobile`, `webdesign`, `support`, `other` (and the labels sent by the previous version of the site). `type` is `discovery` (the site form) or `contact` (the previous site's contact form; inferred from its legacy service labels when absent); anything else is a 400.

## Analytics

`main.js` sends conversion events (`cta_click`, `form_start`, `form_invalid`, `lead_submitted`, `lead_failed`, `lead_fallback`, `language_switch`) to Vercel Web Analytics, Plausible or a Google Tag Manager `dataLayer` if one of them is installed; otherwise they are ignored. No analytics script is installed yet (see `docs/commercial-operating-guide.md` §7).

Every lead email carries a reference (`TT-YYYYMMDD-XXXX`, also in the subject and the Vercel log line), the received time, the site language and the source (`utm_source`, `utm_medium`, `utm_campaign` and referring site, captured by the page for the visit).

## Tests

```bash
npm test     # node --check on the scripts + node:test suite in tests/ (no extra dependencies),
             # including a check that the committed pages match `npm run generate`
```

GitHub Actions (`.github/workflows/ci.yml`) runs `npm ci`, `npm test` and `npm audit --omit=dev --audit-level=high` on every push.
