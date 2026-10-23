# TERANGA-05A — Release report: conversion, attribution and measurement

Audience: the owner deciding whether to merge, and whoever maintains the site next. Date: 2026-10-23. Branch: `feat/teranga-05a-conversion-measurement` (from `master` `e0c96bc`).

**Production merged: NO** · **Production deployment changed: NO**

## A. Executive summary

The website already produced leads (TERANGA-03/04). This release makes them measurable and easier to act on, without adding a framework, database, dependency or third-party tracker.

- **One clear call to action** in both languages ("Discuss your project" / "Parlons de votre projet"), and service buttons that open the form with the service already chosen.
- **A trustworthy confirmation.** It appears only after the notification has been accepted for delivery, and shows the lead reference the owner sees in the email.
- **Every lead says where it came from:** channel, campaign tags, referring site, entry page and conversion page. All of it is validated on the server and shown in the notification, with a ready-to-paste tracker row.
- **A lead process and a monthly report:**
  - statuses NEW → CONTACTED → QUALIFIED → PROPOSAL → WON/LOST (+ SPAM);
  - a private sheet;
  - a dependency-free report script with a synthetic sample.
- **Privacy-conscious measurement:** cookieless Vercel Web Analytics for page views, plus eight conversion events from one schema that cannot carry personal data. The events reach Vercel only on a plan that supports them.
- **A privacy page** in both languages.
- **Faster start-up:** home-page Total Blocking Time under mobile throttling went from 0–590 ms (baseline) to 5–28 ms. Home LCP is 2.1–2.2 s on the preview (TERANGA-04's preview: 2.16–2.38 s).

## B. Implementation

| Area | Files |
|---|---|
| Server | `api/_lib/contact.js` (attribution cleaning, channel, notification section, tracker row, Resend tag, `ref` in responses), `api/contact.js` (32 KB limit, safe parsing, Vercel client IP) |
| Site source | `site/config.mjs` (`ANALYTICS`, `NAV_PAGES`), `site/content/en.mjs` / `fr.mjs`, `site/components.mjs`, `site/pages.mjs` (privacy page), `site/layout.mjs` (analytics script) |
| Browser | `main.js` (event schema, attribution, confirmation, IntersectionObserver reveal), `style.css` |
| Generated | 14 pages (+ `privacy.html`, `fr/privacy.html`), `404.html`, `sitemap.xml` |
| Operations | `scripts/lead-report.mjs`, `docs/samples/` (synthetic), `.vercelignore` (`scripts/`) |
| Tests | `tests/contact.test.js`, `tests/handler.test.js`, `tests/site.test.js`, `tests/report.test.js` (new) |
| Docs | baseline audit, architecture, analytics taxonomy, lead operations, privacy & security, UAT checklist, this report; README and operating guide updated |

Decisions (details in `docs/TERANGA-05A-architecture.md`):
1. Keep the static generator and the single Vercel function; no persistence layer. The notification is the lead record and the private sheet is the tracker, so nothing new needs protecting.
2. Vercel Web Analytics (already on the platform, cookieless, same origin, CSP-compatible) behind build switches. Custom events stay in the page on Hobby and are forwarded on Pro.
3. The lead reference format `TT-YYYYMMDD-XXXX` is unchanged; it is now also returned to the browser.
4. No budget field: currency and ranges are still the owner's call.

**Environment configuration:** no environment variable was added or changed. The existing `RESEND_API_KEY`, `RESEND_FROM_EMAIL` and `LEAD_NOTIFICATION_EMAIL` (Production and Preview) are still required. Measurement is configured at build time in `site/config.mjs` → `ANALYTICS` (`webAnalytics: true`, `customEvents: false`, `maxEventProperties: 2`).

## C. Conversion experience

- Header, mobile menu and closing band: "Discuss your project" / "Parlons de votre projet".
- Service sections: "Discuss your SaaS project", "Discuss your AI project", "Discuss your web application", "Discuss your mobile app", "Discuss your website", "Discuss ongoing support". In French: "Parlons de votre projet SaaS" … "Parlons du suivi de votre produit".
- Work: "Discuss a similar project" / "Parlons d'un projet similaire". AI Engineering: "Discuss your AI project".
- 9 service-aware CTAs per language preselect the service; the visitor can still change it.
- Form: same fields and contract.
  - "Started" now means the first input, not focus.
  - Validation, error with pre-filled email/WhatsApp fallback, double-click protection and draft-on-language-switch are unchanged and re-tested.
- Confirmation only after a 2xx answer:
  - EN: "Thank you. Your project inquiry has been received. We aim to respond within one business day."
  - FR: "Merci. Nous avons bien reçu votre demande. Nous nous efforçons de vous répondre sous un jour ouvré."
  - Reference box; focus moves to the heading; "Send another request".
  - No booking claim and no personal data in the URL.
- Privacy page linked from every footer and from the form note.
- Evidence: `docs/teranga-05a/confirmation-en-mobile.png`, `confirmation-fr-mobile.png`, `service-cta-desktop.png`, `contact-preselected-mobile.png`, `privacy-en-desktop.png`, `privacy-fr-mobile.png`.

## D. Analytics and attribution

| Topic | Delivered |
|---|---|
| Provider | Vercel Web Analytics (page views; cookieless). **Not yet enabled on the project**: `/_vercel/insights/script.js` answers 404 until the owner enables it (release gate) |
| Events | `service_cta_click`, `case_study_click`, `contact_form_start`, `contact_form_validation_error`, `lead_submit_success`, `lead_submit_failure`, `whatsapp_click`, `email_click`. One schema, allow-listed properties with patterns, 1 s deduplication, success once per reference, failure-safe (`docs/TERANGA-05A-analytics-taxonomy.md`) |
| Where events go | Always: `window.TT.events` and the `tt:analytics` DOM event. To Vercel only when `customEvents` is on (needs Pro; Hobby has no custom events), with at most `maxEventProperties` properties |
| Attribution captured | `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, referring **host** only, entry page; conversion page, service, language, timestamp and reference are added at submission |
| Storage | sessionStorage (tab session), first-party, no cookie, no identifier; kept across the site's own language redirect |
| Validation | Server-side: string-only, markup stripped, bounded, host validated label by label, path-only pages, unknown keys dropped, channel computed by the server (`campaign` / `referral` / `direct`) |
| Source of truth | The tracker (one row per notification accepted by Resend). Events never count as leads |
| Privacy boundary | No name, email, company, message, reference, IP, URL query or free text in any event (unit and browser tests) |

## E. Lead operations

**Notification:**
- Same pipeline (Resend, idempotency key, two bounded attempts, duplicate guard, `[TEST · env]` labelling outside production).
- New: an attribution section, a tracker row whose cells cannot run as formulas, and a `channel` tag.
- Evidence: `docs/teranga-05a/notification-preview.png` (synthetic data, rendered by the real `buildEmail`).

**Delivery semantics:** see `docs/TERANGA-05A-architecture.md` §5.
- Success is shown only when Resend accepted the notification.
- 502/503 mean nothing was recorded, and the visitor gets the email/WhatsApp fallback.
- Acceptance is not inbox delivery.

**Tracker and follow-up** (`docs/TERANGA-05A-lead-operations.md`):
- statuses, targets and the private Google Sheet layout;
- columns: reference, dates, company, service, source fields, status, owner, last contact, next action, …;
- daily routine, retention and deletion.

**Reporting** (`scripts/lead-report.mjs`), from a CSV export:
- accepted leads, spam, qualification rate, funnel, open pipeline, win rate, first-reply time;
- leads/qualified per 100 visitors, form-start rate and form completion. Each figure is labelled with its system, and tracker ÷ Vercel rates are marked "not joined";
- breakdowns by channel, source, entry page, service, language and month.

Synthetic sample: `docs/samples/lead-tracker-sample.csv` → `docs/samples/lead-report-sample.md`.

## F. Validation

| Check | Result |
|---|---|
| Unit / site / report tests (`npm test`) | **78/78** (baseline 56; none removed). Every commit passes on its own (64 → 72 → 78) |
| Security tests | Injection (HTML, script, header, formula), oversized payload (413), malformed JSON, invalid URLs and hosts, malformed and forged attribution, honeypot, rate-limit bypass with a forged `X-Forwarded-For`, generic errors, no secrets in browser code, private folders not deployed |
| Browser suite, local (real Resend SDK → local fake API; nothing leaves the machine) | **43/43**, including: attribution end to end (campaign, referral host only, French redirect keeps the referrer), confirmation reference equals the email subject reference, double click → one request, resubmission → same reference and one success event, Resend rejection → no confirmation |
| Browser suite, preview `dpl_6z3njm…` (every submission mocked) | **37/37**: 14 pages EN/FR, 404, navigation, CTA wording and preselection (EN/FR), language switching and persistence, mobile menu by keyboard, validation, 503 / network / 429 / 400 paths, confirmation and focus, all 8 events and their properties, no personal data in events, simulated Pro forwarding (≤ 2 properties), privacy links, reduced motion, no-JS |
| Analytics failure | A provider that throws on every call blocks neither navigation nor the form (local browser check) |
| Accessibility (axe-core 4.10.2, WCAG 2.0/2.1/2.2 A and AA + best practice) | **0 violations**: 14 pages × 375 / 768 / 1180 / 1440 px, plus the confirmation state in EN and FR, on the preview. No horizontal overflow; controls ≥ 24 px |
| HTML validation (html-validate, recommended) | 0 errors on all 15 HTML files |
| ESLint | 1 finding, pre-existing on `master`: `no-control-regex` on the intentional control-character filter in `clean()` |
| CI (GitHub Actions `test`) | success on `c7757d3` and `59d7bfb` |

**Preview HTTP checks** (`dpl_93zt8J…`; the served site is the same on `dpl_6z3njm…` except `main.js`):

| Request | Result |
|---|---|
| `/privacy`, `/fr/privacy` | 200 |
| `/scripts/lead-report.mjs`, `/docs/…`, `/docs/samples/…`, `/site/config.mjs`, `/tests/…` | 404 (not deployed) |
| API `GET` | 405 |
| API invalid email | 400, field message, input not echoed |
| API 40 KB body | 413 "Request too large." |
| API honeypot | 400 |
| API malformed JSON | 400 with an empty body, from Vercel's runtime before the function runs. Identical on production today; our "Invalid JSON." message applies to text bodies |
| Security headers | CSP, `X-Frame-Options`, `Referrer-Policy` unchanged |
| Function logs (preview, 2 h) | No entries: no error, and no submission reached Resend |

**Lighthouse 12.2.1** (mobile unless stated; preview `dpl_6z3njm…` vs production baseline from `docs/TERANGA-05A-baseline-audit.md`):

| Page | Perf | A11y | BP | SEO | LCP | TBT | CLS | Transfer |
|---|---|---|---|---|---|---|---|---|
| `/` baseline (4 runs) | 81 · 95 · 99 · 99 | 100 | 100 | 100 | 2.6 s | 590 · 160 · 90 · 0 ms | — | 169 KB |
| `/` preview (6 runs) | 96 · 97 · 97 · 97 · 97 · 99 | 100 | 93* | 0* | 2.1–2.2 s | 12 · 6 · 16 · 5 · 18 · 28 ms | 0.000 | 174 KB† |
| `/` desktop baseline → preview | 100 → 100 | 100 | 100 → 93* | 100 → 0* | 0.5 s | 40 → 0 ms | 0.000 | 169 → 174 KB† |
| `/contact` baseline → preview (3 runs) | 99 → 99 · 99 · 99 | 100 | 100 → 93* | 100 → 0* | 1.8 → 2.1–2.2 s‡ | 70 → 25 · 17 · 7 ms | 0.000 → 0.001 | 145 → 150 KB† |
| `/fr/contact` baseline → preview (3 runs) | 98 → 99 · 97 · 97 | 100 | 100 → 93* | 100 → 0* | 1.8 → 2.1–2.2 s‡ | 50 → 34 · 54 · 0 ms | 0.000 → 0.001 | 145 → 151 KB† |
| `/privacy` (new) | 99 | 100 | 93* | 0* | 2.2 s | 0 ms | 0.000 | 149 KB |

\* Preview-only conditions, also present on the TERANGA-04 preview, which then scored BP 100 / SEO 100 in production:
- **SEO 0:** Vercel's `x-robots-tag: noindex` on previews. That also confirms previews are not indexed.
- **BP 93:** console errors from Vercel's preview toolbar (blocked by the site's CSP) and from the analytics script's 404 (the gate).

A `/contact` run with those two URLs blocked scores **BP 100** with a clean console.

† Of the +5 KB, about 2.6 KB is the code itself:
- `main.js` +1.9 KB gzipped (event schema, attribution, confirmation);
- `style.css` +0.3 KB;
- page +0.3 KB.

The rest is the 404 page served for the analytics script until Web Analytics is enabled.

‡ Preview-environment offset, see below.

**LCP on the contact pages** is 2.12–2.18 s on the preview (3 runs each) vs 1.76–1.78 s on production today. This is not run-to-run variance. Investigated:
- It is not the analytics 404: with that request blocked, LCP is unchanged at 2.12 s.
- It is a preview-environment offset: the same TERANGA-04 code measured **2.24 s on its preview** and 1.78 s in production.

Like for like (preview vs preview), TERANGA-05A is equal or better: contact 2.24 → 2.12–2.16 s, home 2.16–2.38 → 2.1–2.2 s. Post-merge check: run Lighthouse on production `/contact` and expect about 1.8 s.

**Performance regression investigated and fixed.** The first preview (`dpl_93zt8J…`) still showed a 116–248 ms `main.js` task on the home page, so the first fix (batching layout reads) had not worked. Lighthouse's breakdown showed only 14–51 ms of scripting; the rest was the page's first layout, forced inside the script by `getBoundingClientRect()`. Commit `59d7bfb` removed all layout reads (IntersectionObserver sorts the elements). `main.js` then dropped below Lighthouse's reporting threshold and TBT fell to 5–28 ms.

**Not verified in this release:**
- No live email was sent from the preview: the brief asks for mocks and no live send was authorised. The new notification format went through the real Resend SDK to a local fake API, and the template was rendered for review. Inbox delivery of the new format is the owner's UAT step D (one labelled preview test) and step H (after merge).
- Vercel Web Analytics page views and events in the dashboard: not possible until Web Analytics is enabled.

## G. GitHub

| | |
|---|---|
| Branch | `feat/teranga-05a-conversion-measurement` (pushed; not merged; not deleted) |
| Commits | `6595baa` feat(api): validated lead attribution, reference in responses, size limit · `2592ff0` feat(site): standard CTAs, confirmation with lead reference, privacy page, event schema · `7cd09f6` feat(ops): lead tracker workflow and dependency-free monthly report · `c7757d3` docs: baseline audit, architecture, privacy and security review, UAT checklist · `59d7bfb` perf(site): IntersectionObserver reveal, no layout reads · then report-rate and documentation commits (see the PR) |
| Commit groups | Conversion experience → `2592ff0`. Attribution and analytics → `6595baa` (server) + `2592ff0` (browser; it shares `main.js` and the templates with the conversion work, so it is one commit). Lead operations and reporting → `7cd09f6` + follow-up. Tests, docs and evidence → docs commits (tests travel with the code they cover, so every commit passes) |
| Pull request | Not opened automatically: no GitHub CLI and the GitHub connector's token is rejected. Compare link: https://github.com/seckbara23-cmyk/Teranga-technologies/compare/master...feat/teranga-05a-conversion-measurement?expand=1 — title "TERANGA-05A — Conversion, attribution and measurement foundation" |
| CI | `test` and Vercel checks successful on the pushed heads checked |

## H. Vercel

| | |
|---|---|
| Project | `teranga-technologies` |
| Fully validated preview | `dpl_6z3njmAirpAwecnto9x4DcMXsGC3`, READY, commit `59d7bfb4697aa318b5706ec38673944f39280523` (= branch head at the time), target: preview, `iad1` |
| Earlier preview | `dpl_93zt8JvdwLxMx1uBta1xA4taDthf` (`c7757d3`), READY: first validation and the HTTP checks |
| Branch alias | `teranga-technologies-git-feat-167ac8-seckbara23-6470s-projects.vercel.app` (always the latest branch deployment) |
| Access | Previews are protected by Vercel Authentication: open them while signed in to Vercel, or use a share link generated from the deployment. Share links are not stored in the repository |
| Production | Unchanged: `dpl_4sAfZkoKuQq4N1KF4o1iPrG5G4jH`, commit `e0c96bc` (TERANGA-04), serving `main.js?v=0a2bb86aab`; `/privacy` answers 404 there |
| Environment variables | Not changed |

Commits after `59d7bfb` change only documentation, tests, the report script and the synthetic samples. None of these are deployed (`.vercelignore`), so the served site is unchanged. Their preview is checked for READY and SHA match in the PR description.

## I. Risks, limitations and owner actions

| # | Item | Owner action |
|---|---|---|
| 1 | **Web Analytics not enabled** → the analytics script answers 404 (console error; BP would drop in production) | Before merging: Vercel → project → Analytics → Enable; redeploy the preview; confirm the script answers 200. Or ask for `webAnalytics: false` |
| 2 | Hobby plan has no custom events → events stay in the page | Decide whether Pro is worth it; then set `customEvents: true` |
| 3 | Consent: cookieless analytics and session-only attribution, disclosed; no banner | Legal review if EU traffic matters (`docs/TERANGA-05A-privacy-security.md` §2); options documented |
| 4 | Privacy page content (retention practice, processors, entity name, CDP declaration) | Review in UAT §C |
| 5 | New notification format not yet seen in a real inbox | UAT §D: one labelled preview test, or the production check after merge |
| 6 | Rate limit and duplicate guard are per instance | Optional Vercel Firewall rule on `POST /api/contact` |
| 7 | Attribution is self-reported by browsers; ad blockers hide some page views | Accepted; leads are counted from the tracker |
| 8 | Budget field not added | Decide currency and ranges if wanted |
| 9 | Pull request not opened by tooling | Open it from the compare link with the provided description |

**Rollback.** Nothing to roll back while unmerged. After a merge:
1. Vercel → Deployments → `dpl_4sAfZkoKuQq4N1KF4o1iPrG5G4jH` → Promote / Instant Rollback (seconds, no rebuild).
2. Or revert the merge commit on `master`.

There are no data migrations or environment changes. The only client state (sessionStorage `tt-src`, `tt-hop`) is harmless to the previous version.

## J. Final decision

**GO for owner review.** All acceptance criteria that can be verified before merge pass:
- scope implemented;
- lead submission still works;
- EN/FR parity;
- bounded attribution;
- events follow the schema with no personal data;
- the tracker is the source of truth;
- security, regression and accessibility checks pass;
- the preview is READY at the matching commit;
- production is unchanged;
- the manual PR action is documented;
- UAT checklist ready.

**Merge is conditional on gate 1** (enable Web Analytics, or switch the script off) and on the owner's UAT.

**Production merged: NO**
**Production deployment changed: NO**
