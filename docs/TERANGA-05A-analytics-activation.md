# TERANGA-05A — Production analytics activation verification

Audience: the owner, and whoever maintains the site's measurement. Date: 2026-10-23. Scope: why the Vercel Analytics dashboard showed "Get Started" with zero visitors after Web Analytics was enabled, and what fixes it.

**Production merged: NO** (this branch) · **Production deployment changed: NO**

## 1. Root cause

The production deployment was created **before** Web Analytics was enabled, and Vercel adds the analytics routes only to deployments created afterwards.

| Fact | Evidence |
|---|---|
| Production deployment `dpl_GnMd6sZfe5NU8XnKLv4DNkGbRt1M` (`master` `ba0bac2`, PR #5) created | 2026-10-23 19:30:31 UTC (Vercel API) |
| Web Analytics enabled for the project | `webAnalytics.enabledAt` = 2026-10-23 19:33:05 UTC (Vercel project API) |
| Vercel documentation | "Enabling Web Analytics will add new routes (scoped at `/_vercel/insights/*` and `/<unique-path>/*`) after your next deployment." (vercel.com/docs/analytics/quickstart) |
| Production HTML | All 5 checked pages (`/`, `/fr`, `/contact`, `/fr/contact`, `/privacy`) carry `<script defer src="/_vercel/insights/script.js">` |
| Production script | `https://teranga-tech.com/_vercel/insights/script.js` → **404**, `text/html` (the site's own 404 page). The browser refuses it (`nosniff`), so no page view is ever sent |
| Production data | Web Analytics API, production, 2026-10-23: **no page views** (consistent with the dashboard) |
| Control: a deployment of the same files created after enabling | Preview `dpl_DUVXMCUsTeBmpAzokFmaoScUxpgE` (redeploy of the 05A preview, same tree as `ba0bac2`) → script **200** `application/javascript` (4,522 bytes, same origin, no third-party host) |

The code was not at fault. The static-HTML integration (one deferred, same-origin script; `main.js` defines the `va` queue when events are on) matches Vercel's documented setup for plain HTML. No CSP change is needed: `script-src 'self'` and `connect-src 'self'` cover `/_vercel/insights/script.js`, `/view` and `/event`.

## 2. Collection and ingestion verified (preview only, labelled test traffic)

The Vercel script deliberately ignores automated browsers (`navigator.webdriver` or a "Headless" user agent), so normal automated tests never send analytics. To verify collection, one controlled run per preview hid those markers:
- 4 page views (EN and FR);
- one service CTA click;
- the form filled with **synthetic** data, with `/api/contact` mocked, so no email was sent.

| Check | `dpl_DUVXMCUs…` (production code, events off) | `dpl_AYfYyap4…` (this branch, events on) |
|---|---|---|
| Script | 200 ×4 | 200 ×4 |
| `POST /_vercel/insights/view` | 4 × 200 | 4 × 200 |
| `POST /_vercel/insights/event` | none (events off) | 3 × 200: `service_cta_click` {service: saas, location: svc-saas}, `contact_form_start` {service: saas}, `lead_submit_success` {service: saas} |
| Beacon fields | `o` (page URL), `sv`, `r` (referrer) | the same, plus `en`/`ed` for events (≤ 2 properties) |
| Personal data in beacons (synthetic name, email, company, message, reference, phone prefix) | none | none |
| Console errors | none | none |
| Ingested (Web Analytics API, environment `preview`) | 1 visitor, 4 page views on `/`, `/services`, `/contact`, `/fr` within about 2 minutes | page views as left, plus 3 events, all `service = saas` |

In total these two runs added **8 page views and 3 events to the preview environment**. The dashboard shows Production by default, so they don't appear there; they are test traffic, not visitors.

The page URL sent with each view includes its query string. On this site that can only be `service`, `lang` or `utm_*`. Form contents and lead references never appear in a URL: the form is sent with `fetch` and the confirmation doesn't change the address. No cookie is set. The script uses localStorage only if `identify`/`group` is called, and the site never calls them.

## 3. Plan and custom events

- **Plan:** the team `seckbara23-6470s-projects` is on **Pro**, active, no trial (Vercel API `billing.plan = pro`). TERANGA-05A had assumed Hobby because the plan wasn't readable through the connector then. The baseline audit and release report keep that original statement as a historical record; this document corrects it.
- **What Pro allows** (vercel.com/docs/analytics/limits-and-pricing):
  - custom events with **2 properties** each (8 with the Web Analytics Plus add-on, $10/month);
  - **no included events**: page views and custom events are usage-billed at $0.03 per 1,000, against the Pro monthly usage credit;
  - a 12-month reporting window;
  - UTM breakdowns in the dashboard need Plus. UTM attribution of leads is already in every notification.
- **On production (`ba0bac2`): custom events off.** Pro doesn't activate them by itself: `ANALYTICS.customEvents` was `false`, so events stayed in the page.
- **On this branch: custom events on.** The 8 taxonomy events reach Vercel with their first 2 properties. The privacy page (EN/FR) adds one sentence saying a few actions are recorded without identifying the visitor and never with what they type or the request's reference.

## 4. Changes on `fix/teranga-05a-analytics-activation`

| Commit | Change |
|---|---|
| `337c3fa` | `site/config.mjs`: `customEvents: true` (still 2 properties); privacy disclosure (`site/content/en.mjs`, `fr.mjs`, `site/pages.mjs`); regenerated pages (`data-va-events="2"`); tests |
| `e8d30f7` | `scripts/check-analytics.mjs`: read-only post-deploy check that names this exact failure ("deployment created before it was enabled: redeploy"); tests |
| `b8bec68` | Docs corrected (Pro plan, redeploy after enabling, checker); this report follows |

**Tests:** `npm test` 84/84 (78 before; 6 new: 5 for the checker, 1 for the property limit; the privacy test was extended for the disclosure). CI `test` green.

**Browser suites:**
- local: 43/43;
- on the branch preview: 38/38 (every submission mocked), including EN/FR navigation, confirmation, the 8 events and their properties, no personal data in the in-page or vendor queue, analytics failure not blocking the form, and axe (WCAG 2.2 AA) with 0 violations at 4 widths.

**Checker results:**

| Target | Result |
|---|---|
| `teranga-tech.com` | **NOT OK**: script 404, redeploy |
| `dpl_DUVXMCUs…` | OK |
| `dpl_AYfYyap4…` | OK, custom events on (2 properties) |

## 5. Owner actions

Both paths below change production, so they need your decision.

**Option A — page views only, no code change (configuration-only fix):**
1. Vercel → `teranga-technologies` → Deployments → Production deployment `dpl_GnMd6s…` → ⋯ → **Redeploy**.
2. Then run `node scripts/check-analytics.mjs https://teranga-tech.com` (from this branch) or open `https://teranga-tech.com/_vercel/insights/script.js`: it must show JavaScript, not the 404 page.
3. Browse a few pages in a normal browser. Vercel → Analytics (Production) should show them within a few minutes.

**Option B — page views and conversion events:** approve and merge the pull request for `fix/teranga-05a-analytics-activation`. The merge itself creates a new production deployment, which also fixes page views. Then do steps 2–3 of option A, and check Analytics → Events after a click on "Discuss your project".

Either way, a new production deployment is what makes analytics work. No Vercel setting needs to change: Web Analytics is already enabled.

## 6. Not yet verified

Production collection can only be confirmed after one of the actions above. Until then, the production dashboard correctly shows zero. No production traffic was generated for this report.
