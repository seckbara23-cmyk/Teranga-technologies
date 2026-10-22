# TERANGA-01 — Release readiness and GO/NO-GO

Branch `feat/teranga-01-ai-first-website` · PR #1 (open, not merged) · production (teranga-tech.com, `e52bdd8`) untouched.
Final validation pass: 2026-10-22, 17:00–17:15 UTC. Internal document (not deployed). First-pass delivery report (baseline audit, positioning, files changed): `docs/TERANGA-01-report.md`.

---

## Status dashboard

| Item | Status |
|---|---|
| Branch | `feat/teranga-01-ai-first-website`, based on `master` `e52bdd8` (master unchanged) |
| Latest code commit | `44960a0` (reports are committed on top of it) |
| Pull request | #1 open → `master`: https://github.com/seckbara23-cmyk/Teranga-technologies/pull/1 |
| CI | No GitHub Actions in the repo. Vercel status **success**; "Vercel Preview Comments" check **success** (commit `44960a0`) |
| Preview | **READY** — `dpl_G3cznDXZUH9pBt1WkM985abu69d1`, https://teranga-technologies-aaeit4j1g-seckbara23-6470s-projects.vercel.app (Vercel login or share link) |
| End-to-end tests (local, same code) | **53/53 pass** |
| Serverless handler tests | **14/14 pass** |
| Responsive + accessibility (375, 390, 768, 1440 px × EN/FR) | **8/8 pass** — 0 overflow, 0 off-screen controls, 0 axe violations, 0 console errors |
| EN/FR parity | **pass** — 218 keys each, 0 missing, 0 HTML/EN drift |
| HTML validation / JS syntax | **0 problems** / **4/4 files pass** |
| Lighthouse (local, same code) | mobile **91 / 100 / 100 / 100**, desktop **100 / 100 / 100 / 100** |
| Lighthouse against the preview | **Not run** — this workspace cannot load vercel.app and PageSpeed Insights could not fetch the protected preview |
| Real email delivery | **Not confirmed** — no submission has reached the preview yet; needs an owner test with inbox confirmation |
| Recommendation | **NO-GO today → GO once the 3 gates below are cleared** |

## GO / NO-GO

**Recommendation: NO-GO for production now; GO as soon as these three gates are cleared.** The code, tests, accessibility, security fixes and preview build are release-quality. What is missing is evidence and decisions only the owner can provide.

Release gates (blockers):
1. **Inbox-confirmed delivery.** Submit one request on the preview and confirm it arrives. Until then, it is unknown whether the SMTP variables exist for Preview and Production. If they are missing, the form does not lie: it shows an error with the email and WhatsApp fallback. But leads would not arrive by email.
2. **EduSen vs ScolaTech.** The "Visit EduSen" link opens a product now branded **ScolaTech** (`scolatech.app`); "EduSen" no longer appears there. Choose the name and link (see `docs/case-studies.md`).
3. **Owner sign-off on published claims:** the code-ownership FAQ answer, the "reply within 24 hours" promise, and permission to name XP Client Academy, SunuPermis and the Clinic Management System.

**Exact next action:** open the preview share link on your phone, submit the form with the message `TERANGA-01 delivery test`, check the inbox set in `EMAIL_TO`, then send: (a) received yes/no, (b) EduSen or ScolaTech, (c) sign-off on the three claims. I will then confirm the attempt in the Vercel logs, apply the naming choice, re-run the suite on a fresh preview and hand back for the merge.

---

## A. Summary

The site repositions Teranga Technologies as an AI-first engineering partner for funded startups, scaling SMEs and enterprise teams. It has a working discovery-request pathway, truthful case studies, full EN/FR parity and clean accessibility results.

The most important finding of the original audit stands: on the live site, **every primary button opened a 6-step quote wizard that never submitted**. It only logged to the browser console and then showed "Request Submitted!". This branch removes that wizard entirely.

Baseline problems fixed (details in the first-pass report):
- **Lead capture:** false-success quote wizard.
- **Brand trust:** a watermarked Picxy stock image used as the logo and favicon; a stock photo captioned as the team.
- **Mobile:** header overflow that hid the menu and FR buttons.
- **SEO:** canonical, Open Graph and schema pointed to the wrong domain (`terangatech.com`).
- **Accessibility:** 3 axe violations.
- **API:** wildcard CORS and weak HTML escaping in the notification email.

## B. Changes in the final validation pass

| Commit | Change | Why |
|---|---|---|
| `76adee1` | Rate limit on the Vercel function (5 requests / 10 min per IP per instance, 429 + `Retry-After`); generic 503 when email is not configured; zero accepted recipients treated as failure; one log line per delivery attempt (service, accepted/rejected counts, SMTP status, no personal data) | The serverless endpoint had no rate limit at all (only the local dev server did); the old "not configured" message disclosed setup state; logs make delivery verifiable |
| `4b19ec1` | CTAs now read **"Request a discovery call" / "Demander un appel découverte"** (header: "Request a call" / "Demander un appel"); they switch to "Book…" only if `BOOKING_URL` is set | There is no scheduling integration: the button opens a request form and the team replies to schedule. "Book" overstated it |
| `8609ed7` | `Pictures/` excluded from deployments (`.vercelignore`); files kept in the repo | It holds a watermarked stock image and a stock photo of unknown licence that were still publicly served even though the site no longer uses them |
| `44960a0` | XP Client Academy link → `https://www.xpclient-academy.com` | The old vercel.app link opened the product's admin login; the product's own canonical URL is its public home page |

No redesign and no new features.

## C. Validation evidence

All local runs use the exact branch code, served locally: static server for audits; the Express server plus a local SMTP catcher for end-to-end tests. The serverless handler was tested directly.

### C1. End-to-end (53/53 pass)
- **API contract:** rejects bad email, unknown service, short message, honeypot, invalid timeline; accepts the previous site's payload (legacy service labels).
- **Injection:** the HTML email escapes `<script>`. A name, company and subject containing `\r\nBcc:` / `\nCc:` produce **no Bcc or Cc header and only one recipient** (`owner@…`), and the subject stays on one line. Emails containing a line break or `>, extra@…` are rejected (400).
- **CTA truthfulness:** every CTA says "Request…"; no "Book", "Get a Quote" or "Get a Free Quote" anywhere on the page; French CTAs say "Demander un appel (découverte)".
- **Old wizard removed:** the served `main.js` contains no wizard code, no `console.log` and no quote dialog.
- **No false success:** with the server answering 429, 503 or failing at network level, the page never shows "Request sent". It shows the error with email and WhatsApp fallback.
- **Happy path:** service CTAs pre-select the form and focus the first field; empty submit flags all four required fields with announced messages; **email delivered to the catcher at `EMAIL_TO`** with subject "[Teranga] Discovery call request — SaaS development — Acme SA", the visitor as Reply-To and the timeline included; form resets.
- **French:** French browser gets French; French validation and failure messages; input kept and button re-enabled after a failure.
- **Navigation and accessibility:** mobile menu via keyboard (open, label switch, Escape returns focus, links close it); skip link first; header CTA reachable by keyboard; FAQ opens with keyboard; visible focus.
- **Motion and fallback:** reduced motion shows the final demo; switching language mid-animation shows the complete French report; content fully visible without JavaScript.
- **Links:** all anchors resolve; all external links have `rel="noopener"`.

### C2. Serverless handler `api/contact.js` (14/14 pass)
- Valid request → 200; no CORS header by default; `Cache-Control: no-store`.
- JSON string body accepted; malformed JSON → 400; GET → 405 with `Allow`; OPTIONS → 204.
- Old cached-page payloads accepted (EN "Website Development", FR "Création de site web").
- Same IP: requests 1–5 → 200, 6th → **429** with `Retry-After: 600`; another IP is unaffected.
- Missing SMTP → **503 "Unable to send your request…"**, with no mention of configuration.
- SMTP unreachable → 502 with a generic message.
- Log lines contain service, counts and SMTP status, and no email addresses (checked: 0 lines with "@").

### C3. Responsive + accessibility, EN and FR
| Width | EN | FR |
|---|---|---|
| 375 px | pass | pass |
| 390 px | pass | pass |
| 768 px | pass | pass |
| 1440 px | pass | pass |

Each run: 0 px horizontal overflow, 0 interactive elements off-screen, 0 axe-core violations, 0 console errors, no control under 24 px tall, primary CTA in the first screen. Below 1081 px the navigation collapses to a menu button.

### C4. Other checks
- **EN/FR parity:** 211 keys used, 218 defined in both dictionaries, 0 missing, 0 HTML/EN drift, no raw keys, French spacing before ? ! : ; correct; language from `?lang=` → saved → browser.
- **html-validate:** 0 problems. **`node --check`:** `main.js`, `api/contact.js`, `api/_lib/contact.js`, `server.js` pass. `vercel.json` is valid JSON.
- **Lighthouse (local):** mobile 91 / 100 / 100 / 100 (LCP 2.5 s, TBT 250 ms, CLS 0); desktop 100 / 100 / 100 / 100 (LCP 0.5 s). Baseline mobile was 83 / 92 / 96 / 100.
- **Lighthouse against the preview: not run.** This workspace's network cannot reach vercel.app, and PageSpeed Insights returned an error for the protected preview URL. Run it from a phone at https://pagespeed.web.dev with the share link.

### C5. Preview checks (deployment `dpl_G3cznDXZUH9pBt1WkM985abu69d1`, commit `44960a0`)
| Request | Result |
|---|---|
| `/` | 200, new page; CSP, Permissions-Policy, X-Frame-Options DENY, nosniff, Referrer-Policy, HSTS present; `x-robots-tag: noindex` (Vercel default on previews) |
| `/robots.txt`, `/sitemap.xml` | 200; sitemap lists `https://teranga-tech.com/` |
| `/docs/…` | 404 (internal documents not deployed) |
| `/api/_lib/contact.js` | 404 (server source not exposed) |
| `/Pictures/Logo%20Teranga` | 404 (unlicensed images no longer served) |
| `GET /api/contact` | 405 JSON, `Cache-Control: no-store` (function deployed and running; checked on the previous preview of the same function) |
| Preview runtime logs, last 40 min | No `/api/contact` POSTs yet → **delivery not yet exercised on Vercel** |

The canonical domain was confirmed earlier in the Vercel project settings: `teranga-tech.com` is attached and verified.

## D. Security review

| Area | Finding | Action |
|---|---|---|
| Rate limiting | Serverless endpoint had none (pre-existing on the live site) | **Fixed (best-effort):** per-IP limit in the function. Per-instance only; **recommended:** a Vercel Firewall rate-limit rule on `POST /api/contact`. It applies to production immediately, so it needs owner approval |
| Input validation | Required fields, lengths, email format, service and timeline allow-lists, honeypot | Verified by tests |
| Email header injection | CR/LF stripped from all single-line fields; email regex rejects whitespace and `<>"'`; one fixed recipient; Nodemailer encodes headers | Verified: no Bcc/Cc, one recipient |
| HTML injection in email | All values HTML-escaped | Verified |
| CSP | `default-src 'self'`, no inline scripts or styles, `frame-ancestors 'none'`, `form-action 'self'` | Verified on the preview. Vercel's preview-only feedback toolbar (`vercel.live`) is blocked by design; production is unaffected |
| CORS | API sends no CORS headers unless `ALLOWED_ORIGIN` is set; static files carry Vercel's default `*` (public assets, no credentials) | OK |
| Environment variables | Names documented in README; values never read; the Vercel connector refused to list them (403) | Owner to confirm `EMAIL_HOST/PORT/SECURE/USER/PASS/TO` for Production **and** Preview |
| Error handling | Generic public messages (400/405/429/502/503); details only in server logs, without personal data | Verified |
| Secrets in repo | `.env` ignored; only `.env.example` with placeholders | OK |

## E. Old quote wizard and cached clients

- The wizard and its `console.log` submission no longer exist in any served file (`main.js` checked), and no element opens it.
- HTML is served with `max-age=0, must-revalidate`, so returning visitors get the new page. The new page loads `main.js?v=2026102202`, so an old cached `main.js` (previously cached for 1 day) cannot be paired with the new HTML.
- The old site's bottom contact form payload, in English or French, is still accepted by the new API (tested).
- **Residual risk:** a browser tab left open on the old page since before the release still runs the old wizard, which never contacted the server and cannot be fixed remotely. It goes away on reload.

## F. Content, links, brand and licensing

| Item | Status |
|---|---|
| Canonical / OG / schema domain | `https://teranga-tech.com/` (verified domain on Vercel) |
| Radiora Medical link | 200, public French home page ("Radiora Medical") |
| EduSen link | 200, but the product is now branded **ScolaTech** (`scolatech.app`) → **gate 2** |
| XP Client Academy | Fixed → `www.xpclient-academy.com` (public home page) |
| SunuPermis, Clinic Management System | 200, but both open on a login page (no public landing page found). Acceptable for an "Also built" list; owner may prefer to unlink |
| Fonts | Inter and Bricolage Grotesque, SIL Open Font License, licence files included |
| Logo mark, social image | Original work created for this project (interim mark until the official logo) |
| Case-study screenshots | Screenshots of Teranga's own products |
| `Pictures/Logo Teranga` (Picxy watermark), `Pictures/Pic1.jpg` (stock) | Not used; **no longer deployed**; still in the repository until the owner deletes them or confirms rights |

## G. Remaining risks (non-blocking)

1. Rate limiting is per serverless instance; add the Vercel Firewall rule for a global limit (owner approval).
2. The contact address is a Gmail account; a domain address would build trust.
3. French content is rendered by JavaScript on the same URL; search engines mainly index English. Next phase: `/fr/` with `hreflang`.
4. No analytics installed; conversion events are wired and ready.
5. Case-study results show "being compiled" until measured figures exist.
6. Interim logo until the official one is supplied; case-study screenshots are about 440 px wide.
7. Lighthouse against the live preview still to be run (see C4).
8. Unrelated: the duplicate Vercel project `teranga-broadcast-platform` fails on every Teranga Broadcast push.

## H. Commit history on the branch

`ea9c437` fix(contact) shared handler · `3ddbfdf` feat(site) repositioning · `9596154` chore(deploy) headers · `a6ea417` docs · `2e4c21f`, `85c9b15` docs(report) · `76adee1` fix(contact) rate limit and generic errors · `4b19ec1` fix(site) request wording · `8609ed7` chore(deploy) exclude unlicensed images · `44960a0` fix(portfolio) XP link · plus the readiness report.
