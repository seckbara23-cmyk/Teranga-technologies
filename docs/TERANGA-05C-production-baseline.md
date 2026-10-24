# TERANGA-05C — Production baseline (TERANGA-05B verification gate)

Audience: the owner and the maintainer. Verified **2026-10-24** (14:00–14:30 UTC) before any 05C change. No production submission was made: every browser form test was intercepted and mocked, and the only API calls were ones the API rejects.

## Verdict

**Production serves the expected release.** TERANGA-05B is live and working. Three issues were found; none blocks the sprint:

| # | Finding | Severity | Resolution |
|---|---|---|---|
| 1 | `https://teranga-technologies.vercel.app/` (the bare root) answers **200**, while every other path on that host redirects (`/work?x=1` → 308 teranga-tech.com). The 05B rule `source: "/:path*"` isn't applied by Vercel to `/` | Low (the page carries `canonical` → teranga-tech.com) | Fixed in 05C: `source: "/(.*)"`, the pattern of the site's own headers rule, which production applies to `/` |
| 2 | **3 contact submissions rejected by the server** (`lead_submit_failure`, reason `rejected`): one visitor, `/contact`, service SaaS, 2026-10-24 10:00–11:00 UTC. The page passed them, the server refused them, and the visitor saw only the generic "couldn't send" message | **High** (conversion) | Fixed in 05C (conversion plan §2). Cause not determinable: the server didn't log rejections. **Owner question:** were these your tests, and did you use autofill? |
| 3 | `www.teranga-tech.com` → apex with **307** (temporary); `www` isn't a project domain | Low | Owner action (owner checklist §3) |

## Deployment identity

| Check | Result |
|---|---|
| Production deployment | `dpl_5hfXE787P3vGT2cPnRq4cChDXw7t`, READY, target production |
| Commit | `83941006e84520c4deaa6d6f8069752bcf937a58`: the merge of PR #7. Its tree is identical to the validated branch head `03e1ecc` |
| Served files vs the release | **19/19 byte-identical**: 14 pages, `sitemap.xml`, `robots.txt`, `style.css`, `main.js`, `favicon.ico` |
| Analytics | `node scripts/check-analytics.mjs https://teranga-tech.com` → OK; custom events on (2 properties) |

## HTTP checks (52, read-only; 51 pass)

| Area | Result |
|---|---|
| `http://` → `https://` | 308 |
| Trailing slash | `/services/` → 308 `/services`; `/fr/` → 308 `/fr`; `/fr/work/` → 308 `/fr/work`; `/services.html` → 308 `/services` |
| `.vercel.app` host | Non-root paths → 308 `https://teranga-tech.com/…` with the query kept. **Root → 200** (finding 1) |
| `?lang=fr` | 307 `/fr?lang=fr` (preference link; temporary is correct) |
| `www` | 307 → apex (finding 3) |
| EN/FR routes | All 14 pages 200; unknown path 404 |
| Canonical / hreflang | Self-canonical on all 14 pages; `en` and `fr` alternates present |
| Structured data | Valid JSON-LD graph on all 14 pages (Organization, WebSite, WebPage / AboutPage / ContactPage; Service ×6 on Services) |
| Indexability | No `X-Robots-Tag`; no `noindex` on indexable pages; robots.txt allows all and lists the sitemap; sitemap lists 14 URLs |
| Owner decisions | Work EN/FR link `https://scolatech.app`; no trace of the former URL; "ScolaTech (formerly / anciennement EduSen)"; "for / pour XP Client Consulting"; no week-range promise anywhere; ScolaTech screenshot served |
| Private paths | 404: `/docs/…`, `/docs/samples/…`, `/scripts/…`, `/tests/…`, `/site/…`, `/server.js`, `/package.json`, `/.env`, `/.vercelignore`, `/Pictures/…` |
| Security headers | CSP (`default-src 'self'`), `X-Frame-Options: DENY`, `nosniff`, HSTS, `Referrer-Policy`, `Permissions-Policy` |
| Contact API | `GET` → 405; invalid `POST` → 400 "A valid email address is required." (validation runs; nothing sent) |

## Functional checks (browser suite against production, every submission mocked)

**38/38**:
- 14 pages EN/FR with images; 404;
- header navigation and current page; CTA wording; service preselection;
- language switching and persistence; mobile menu by keyboard;
- form validation; failure paths (503, network, 429, 400) and confirmation with reference and focus (all mocked);
- the 8 events with their properties, and no personal data in the page or vendor queue;
- analytics failure doesn't block the form;
- reduced motion; no-JS;
- **axe WCAG 2.2 AA: 0 violations** on 14 pages × 375/768/1180/1440 px plus the confirmation state.

Headless test browsers are ignored by the Vercel script, so these runs added no page views or events.

## Server side (production function logs, last 3 days)

- No errors or warnings.
- One info line: a discovery request **accepted by Resend** on 2026-10-23 00:15 UTC (served by the TERANGA-03 deployment). Logs hold only the reference and Resend id. Whether it was a real prospect or a test is not knowable from logs, and acceptance is not proof of inbox delivery.
- The 3 rejections in finding 2 left **no log line**: before 05C the server didn't log validation rejections.

## Production analytics since activation (2026-10-23 19:30 → 2026-10-24 15:00 UTC)

| Measure | Value |
|---|---|
| Page views / visitors | 34 / 3 (desktop only; SN 2, NL 1; no external referrer) |
| Events | `service_cta_click` 3 (header 2, svc-web-applications 1) · `contact_form_start` 1 · `lead_submit_failure` 3 (rejected) · others 0 |

This is almost certainly owner and test traffic, not market demand. It is too little to draw conversion conclusions from, but enough to reveal finding 2.

## Email delivery

Not verified in production in this sprint, per the brief (no live submission). The controlled test procedure and the evidence it requires are in `docs/TERANGA-05C-owner-checklist.md` §2.
