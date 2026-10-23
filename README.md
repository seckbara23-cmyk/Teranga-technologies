# Teranga Technologies — Website

Marketing site for Teranga Technologies (teranga-tech.com): six pages plus a privacy page, in English and French, with a discovery-call form. Static HTML/CSS/JS generated from one source by a small dependency-free script, one serverless function for the form, deployed on Vercel. Vercel runs no build: the generated HTML is committed.

## Pages

| English | French | Content |
|---|---|---|
| `/` | `/fr` | Home: hero, capabilities, selected work, why Teranga, process, call to action |
| `/services` | `/fr/services` | Six services: problem, deliverables, typical uses, outcome |
| `/ai-engineering` | `/fr/ai-engineering` | AI capabilities, safeguards, the Radiora example |
| `/work` | `/fr/work` | Radiora Medical and EduSen case studies, three more products |
| `/about` | `/fr/about` | Name, principles, collaboration, location |
| `/contact` | `/fr/contact` | Discovery-call form, next steps, direct contacts, FAQ |
| `/privacy` | `/fr/privacy` | What the form and analytics collect, processors, storage, retention, rights (linked from the footer and the form) |

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
│   └── config.mjs        # Site URL, contact details, product links, BOOKING_URL, ANALYTICS switches
├── index.html, services.html, ai-engineering.html, work.html, about.html, contact.html, privacy.html
├── fr/                   # French pages (generated)
├── 404.html, sitemap.xml # Generated
├── style.css             # "Teranga Signature" design system (tokens at the top)
├── main.js               # Language, legacy links, menu, hero demo, form, attribution, events, motion
├── api/
│   ├── contact.js        # Vercel function: POST /api/contact
│   └── _lib/contact.js   # Shared validation + Resend notification (also used by server.js)
├── server.js             # Local Express server (same clean URLs, /api/contact, /api/health)
├── scripts/lead-report.mjs # Monthly lead report from a tracker export — not deployed
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
| POST | `/api/contact` | Discovery-call request. JSON: `name`, `email`, `service`, `message` (required); `type`, `company`, `timeline`, `phone`, `subject`, `lang`, `page`, `source` (optional); `website` is a honeypot. Body ≤ 32 KB (else 413). Success: `200 {"message", "ref"}` |
| GET | `/api/health` | Health check (local server only) |

`service` accepts `saas`, `ai`, `webapp`, `mobile`, `webdesign`, `support`, `other` (and the labels sent by the previous version of the site). `type` is `discovery` (the site form) or `contact` (the previous site's contact form; inferred from its legacy service labels when absent); anything else is a 400.

## Measurement and attribution

- **Leads** are counted from the notifications (one per request accepted by Resend), recorded in a private tracker and reported with `node scripts/lead-report.mjs <export.csv> [--from] [--to] [--visitors]`. See `docs/TERANGA-05A-lead-operations.md`.
- **Attribution:** the page keeps the visit's `utm_*` tags, the referring site's host and the entry page for the tab session and sends them with the form. The server re-validates them, computes the channel (campaign / referral / direct) and adds an attribution section and a ready-to-paste tracker row to the notification.
- **Analytics:** `ANALYTICS` in `site/config.mjs`. `webAnalytics` adds the cookieless Vercel Web Analytics script to every page; enable Web Analytics in the Vercel project first, or the script answers 404. `customEvents` (Pro plan) also forwards the conversion events. Events are defined once in `main.js` (`EVENTS`), carry no personal data and are listed in `docs/TERANGA-05A-analytics-taxonomy.md`. In any case they are available in the page as `window.TT.events`.
- Design and data flow: `docs/TERANGA-05A-architecture.md`; privacy and security review: `docs/TERANGA-05A-privacy-security.md`.

## Tests

```bash
npm test     # node --check on the scripts + node:test suite in tests/ (no extra dependencies),
             # including a check that the committed pages match `npm run generate`
```

GitHub Actions (`.github/workflows/ci.yml`) runs `npm ci`, `npm test` and `npm audit --omit=dev --audit-level=high` on every push.
