# Teranga Technologies — Website

Marketing site for Teranga Technologies (teranga-tech.com): a single bilingual (EN/FR) page with a discovery-call form. Static HTML/CSS/JS, one serverless function for the form, deployed on Vercel. No build step.

## Structure

```
├── index.html            # The page (English text is the default and the no-JS fallback)
├── style.css             # All styles (brand tokens at the top)
├── main.js               # EN/FR dictionary, language switch, menu, hero demo, form
├── api/
│   ├── contact.js        # Vercel function: POST /api/contact
│   └── _lib/contact.js   # Shared validation + email (also used by server.js)
├── server.js             # Local Express server (static files + /api/contact + /api/health)
├── assets/
│   ├── brand/            # Interim logo mark (SVG), touch icon, social share image
│   ├── fonts/            # Self-hosted Bricolage Grotesque + Inter (SIL OFL)
│   └── portfolio/        # Product screenshots (PNG + WebP)
├── Pictures/             # Original image files (no longer referenced by the page; see docs report)
├── docs/                 # Internal documents — excluded from deployment by .vercelignore
├── robots.txt, sitemap.xml
└── vercel.json           # Function settings, security headers, caching
```

## Run locally

```bash
npm install
cp .env.example .env      # fill in SMTP settings
npm start                 # http://localhost:3000
```

## Environment variables

| Variable | Purpose |
|---|---|
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS` | SMTP account used to send form submissions |
| `EMAIL_TO` | Inbox that receives requests (default `seckbara23@gmail.com`) |
| `ALLOWED_ORIGIN` | Optional. Only needed if another domain must call the API cross-origin |
| `CONTACT_RATE_LIMIT` | Local server only: requests per IP per 15 min (default 5) |

## Editing content

- All visible text lives in `main.js` under `i18n.en` and `i18n.fr`, keyed by the `data-i18n` attribute in `index.html`. When you change English text, change it in **both** `index.html` and `i18n.en` (the HTML copy is what search engines and no-JS visitors see).
- Attributes are translated with `data-i18n-attr="aria-label:key;alt:key"`.
- Language order: `?lang=fr|en` in the URL → the visitor's saved choice → browser language → English.
- Booking link: set `BOOKING_URL` at the top of `main.js` (e.g. a Calendly or Cal.com page) to make every "Book a discovery call" button open it directly instead of the form.
- After changing `style.css` or `main.js`, bump the `?v=` query in `index.html` so returning visitors get the new files.

## API

| Method | Path | Description |
|---|---|---|
| POST | `/api/contact` | Discovery-call request. JSON: `name`, `email`, `service`, `message` (required); `company`, `timeline`, `phone`, `subject`, `lang` (optional); `website` is a honeypot. |
| GET | `/api/health` | Health check (local server only) |

`service` accepts `saas`, `ai`, `webapp`, `mobile`, `webdesign`, `support`, `other` (and the labels sent by the previous version of the site).

## Analytics

`main.js` sends conversion events (`cta_click`, `form_start`, `form_invalid`, `lead_submitted`, `lead_failed`, `language_switch`) to Vercel Web Analytics, Plausible or a Google Tag Manager `dataLayer` if one of them is installed; otherwise they are ignored.
