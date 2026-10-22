# TERANGA-02 — Release verification and GO/NO-GO

Branch `release/teranga-02-stabilization` (from TERANGA-01 head `828cf5c`) · production (teranga-tech.com, `e52bdd8`) untouched.
Verification run: 2026-10-22, 21:55–23:30 UTC. Internal document (not deployed).
Companion: `docs/commercial-operating-guide.md` (lead flow, lifecycle, KPIs, setup steps).

---

## Status dashboard

| Area | Status | Evidence |
|---|---|---|
| Code readiness | 🟢 Ready | 34/34 `npm test`; browser suite 31/31 local; html-validate: title fixed, 5 ARIA-conformant notices |
| Security | 🟢 No known exploitable high/critical | `npm audit` 0; source exposure fixed; injection tests pass |
| Accessibility | 🟢 | axe-core 4.10 (WCAG 2.2 AA + best practice): 0 violations at 375/390/768/1440 px × EN/FR, local and preview |
| EN/FR parity | 🟢 | 218 keys each, 229 HTML elements match EN, French spacing checked, FR journeys pass |
| Lead capture | 🔴 **Blocked** | Vercel project has **0 environment variables**; deployed function logs `SMTP not configured`; live site returns 500 |
| GitHub | 🟡 | Branch pushed; CI green; **PR not opened** (no GitHub API access in this session) |
| Vercel preview | 🟢 | `dpl_GV8tRx3X5kPsF7HCdZJFPdK2xzs6`, READY, SHA `b19f37b` = CI-tested commit; 29/29 browser journeys; Lighthouse mobile 99 / 100 / 93, desktop 100 / 100 / 93 |
| Production | ⚪ Not deployed | Owner approval not recorded; gates below |
| Commercial readiness | 🟡 | Lead metadata, fallback, operating guide done; needs SMTP, tracker, analytics decision |

**Verdict: NO-GO** until lead delivery is configured and inbox-confirmed (gate G1). Everything else that is code-owned is release-ready.

---

## 1. Baseline (verified independently, 2026-10-22)

| Item | Finding |
|---|---|
| Stack | Static HTML/CSS/vanilla JS + one Vercel Node function (`api/contact.js`, nodemailer). No framework, no build, no TypeScript or ESLint (the TERANGA-02 brief assumed Next.js). Vercel preset "Other", Node 24.x |
| Repository | `seckbara23-cmyk/Teranga-technologies`, public, default branch **`master`** (not `main`). No branch protection, no required checks, no workflows before this sprint |
| Production | Deployment `dpl_H3pSap7rWRnkHLpbQKawwiE7mus6` from `master` `e52bdd8` (Vercel API); live HTML is byte-identical in size to `e52bdd8:index.html`. Domains: `teranga-tech.com` (verified); `www` redirects to apex |
| TERANGA-01 | `feat/teranga-01-ai-first-website` @ `828cf5c`, PR #1 open, 0 reviews, Vercel status success, mergeable. No owner decision recorded on its three gates |
| Other contributors | None since TERANGA-01 (all commits by the owner or co-authored by Claude) |
| Local state | Five untracked PNGs in `Pictures/` (duplicates of `assets/portfolio/*.png`) — owner's, left untouched |
| **Live lead capture** | **Broken.** A labelled probe (`example.com` address) to `POST https://teranga-tech.com/api/contact` returned **500 "Email service is not configured."** The live quote wizard (all primary CTAs) only calls `console.log`. The live site currently delivers no website leads |
| Vercel environment | Environment variable listing (CLI, metadata only, values never read): **0 variables, 0 hidden production variables**. The Vercel connector itself returns 403 for this endpoint |
| Exposure | `https://teranga-tech.com/server.js` served publicly (200). No secrets in it |
| Firewall / analytics | No firewall configuration exists (404). Web Analytics not enabled (`/_vercel/insights/script.js` 404) |
| Tooling limits | `git push` works; GitHub MCP connector unauthorized (401) and `gh` not installed, so PRs cannot be created or commented from this session |

## 2. TERANGA-01 release verification matrix

| TERANGA-01 claim | Re-verified how | Result |
|---|---|---|
| AI-first premium positioning | Read every EN/FR string; scanned for superlatives, guarantees, certifications, testimonials, metrics | ✅ Communicates AI-first engineering, SaaS, AI integration, workflow modernisation, web/mobile, quality/security practices, Dakar base with international delivery. No "world-leading" or guarantee language |
| Homepage answers who / problems / ideal customer / trust / services / next action | Section-by-section review | ✅ Kicker + H1; five outcome-led services; "startups, SMEs and enterprise teams"; proof strip, two case studies, process, FAQ; one consistent next action ("Request a discovery call") |
| Case-study accuracy | Product sites fetched; copy compared with `docs/case-studies.md` | ✅ No testimonials, metrics, accuracy or certification claims; "AI never diagnoses"; results "being compiled". ⚠️ **EduSen link opens a product branded ScolaTech** (18 mentions, 0 of EduSen) — gate G2 |
| EN/FR parity | Automated (`tests/site.test.js`) + browser journeys in FR | ✅ 218/218 keys, 229 elements, French typographic spaces, FR validation/success/error texts |
| Discovery-call pathway works | Local SMTP catcher + preview | ✅ Code path delivers (local); ❌ **cannot deliver on Vercel** (no SMTP variables) |
| CTAs say "Request", not "Book" | Tests + browser | ✅ (`BOOKING_URL` empty; "Book…" labels unused) |
| axe 0 violations | axe-core 4.10.2 with WCAG 2.2 AA + best-practice tags | ✅ Reproduced, stricter rule set |
| html-validate 0 problems | html-validate 8.24.2 recommended | ⚠️ Not reproduced: 6 findings. Title > 70 chars **fixed**; 5 × `aria-label` on `<ul>` kept (allowed by ARIA 1.2 for `list`; axe passes) |
| Security hardening | Code review + tests + live probes | ✅ Confirmed; new findings in §4 |
| "SMTP variables unverified" | Env listing, live probe, preview function log | ❌ Now verified **absent** |
| 53/53 e2e, 14/14 handler | Their harness is not in the repo | Replaced by a committed suite (34) and a browser harness (31) — §6 |
| Lighthouse mobile 91 / desktop 100 (local) | Lighthouse 12.2.1 against the preview | ✅ Mobile 99 / 100 / 93 / –, desktop 100 / 100 / 93 / – (Perf / A11y / BP / SEO). BP and SEO deductions are preview-only (see §5) |

## 3. Changes in TERANGA-02

| Commit | Change | Why |
|---|---|---|
| `e7e244c` fix(deploy) | `server.js` and `tests/` excluded from deployments | Dev server source was public at `/server.js` |
| `13ee39e` fix(deps) | nodemailer 6.10.1 → 10.0.16; express 4.22.1 → 4.22.3; `engines.node >= 20` | 4 advisories → 0 (classification in §4) |
| `6a27440` feat(contact) | Lead reference `TT-YYYYMMDD-XXXX` (subject + log), received time, language and source (UTM + referrer host) in every lead email | Track leads through the lifecycle without a CRM; attribute leads without analytics |
| `e33484e` fix(form) | On failure, email and WhatsApp links open pre-filled with the request; in-flight guard; `lead_fallback` event | While SMTP is missing or failing, a visitor no longer has to retype the request |
| `ed17e4c` fix(content) | "reply within 24 hours" → "we aim to reply within one business day" (EN/FR); privacy note gives a deletion contact | 24-hour promise not approved by the owner; privacy notice stated purpose only |
| `395991e` test | `npm test`: node --check + 34 node:test cases, no new dependencies | The repository had no tests |
| `a994c68`, `b19f37b` ci | GitHub Actions: `npm ci`, `npm test`, `npm audit --omit=dev --audit-level=high` on every push | No CI existed |
| `e0d2a00` fix(seo) | Page title ≤ 70 chars in EN and FR | Truncated in search results |
| (this commit) docs | This report, commercial operating guide, README | Release evidence and operations |

No redesign, no new runtime dependency, no new service.

## 4. Security findings

| # | Finding | Severity / exploitability | Action |
|---|---|---|---|
| S1 | No SMTP configuration on Vercel: every website lead fails | **Critical (business)**, not a vulnerability | Owner config — gate G1 |
| S2 | `/server.js` publicly served | Low (source disclosure, no secrets) | **Fixed**; preview returns 404 |
| S3 | nodemailer 6.10.1: 16 advisories (5 high) | Low in this code: most target unused features (raw, jsonTransport, OAuth2, DKIM, List-*); addressparser DoS reachable only via a length-bounded, validated Reply-To | **Fixed** (10.0.16, newest release > 2 weeks old; breaking changes reviewed, none affect SMTP send) |
| S4 | proxy-addr (critical), qs (moderate), body-parser (low) | Not exploitable in production: Express is used only by the local dev server, which is not deployed and does not set `trust proxy` | **Fixed** (express 4.22.3) |
| S5 | Rate limit is in-memory per serverless instance | Medium: a distributed burst could reach the SMTP account's daily sending cap | Kept as best-effort; **recommended** Vercel Firewall rate-limit rule on `POST /api/contact` (e.g. 5 requests / 10 min per IP, action deny) — applies to production immediately, so owner approval needed. Honeypot + validation remain |
| S6 | Contact address is a personal Gmail account | Low (trust, deliverability) | Recommendation: domain mailbox |
| — | Input validation, CRLF/header injection, HTML escaping, single fixed recipient, generic errors, no PII in logs, no CORS by default, CSP without `unsafe-inline`, HSTS, `frame-ancestors 'none'`, nosniff, Referrer-Policy, Permissions-Policy | Verified by tests and preview headers | No change needed |
| — | Secrets | `.env` git-ignored; only `.env.example` with placeholders; no values read during this sprint | OK |

## 5. Accessibility, performance and SEO

- **Accessibility:** 0 axe violations (WCAG 2.0/2.1/2.2 A–AA + best practice) at 375, 390, 768 and 1440 px in EN and FR; no horizontal overflow; no off-screen or < 24 px controls; skip link first; mobile menu keyboard-operable with Escape returning focus; visible focus; FAQ keyboard-operable; reduced motion shows the final demo state; full content without JavaScript; validation errors announced (`aria-invalid`, `aria-describedby`, polite live region).
- **Performance (Lighthouse 12.2.1 against the preview, Chrome headless):** mobile **99** — LCP 2.2 s, FCP 1.0 s, TBT 50 ms, CLS 0, Speed Index 1.5 s; desktop **100** — LCP 0.5 s, TBT 0 ms, CLS 0.011. Accessibility 100 on both. Best Practices 93: the only failing audits are the console error and CSP issue caused by Vercel's preview-only toolbar script (`vercel.live`), which the CSP blocks by design. SEO: every individual audit passes (title, description, canonical, hreflang, link text, crawlable anchors, image alt, HTTP status) except `is-crawlable`, because Vercel sends `noindex` on previews; Lighthouse then scores the category 0. Production has neither the toolbar nor `noindex`; re-measure after release. Self-hosted WOFF2 fonts are preloaded; images have explicit dimensions and lazy loading; WebP for case-study screenshots; HTML revalidates on every request while `main.js`/`style.css` use versioned URLs.
- **SEO:** canonical, `og:url`, `og:image`, JSON-LD, sitemap and robots all on `https://teranga-tech.com/`; previews send `X-Robots-Tag: noindex`; `*.vercel.app` production aliases are behind Vercel Authentication (not indexable). Title now ≤ 70 chars. **Known gap:** French is rendered by JavaScript on the same URL, so there is no `hreflang`; search engines mainly index English. Fix in a later phase with a static `/fr/` page (`docs/growth-assets.md` §5).

## 6. Conversion-path test report

### CTA matrix (all verified in the browser, EN and FR)

| CTA | Destination | Behaviour |
|---|---|---|
| Header "Request a call" / « Demander un appel » | `#contact` | Scrolls to form, focuses Full name |
| Hero "Request a discovery call" | `#contact` | Same; in first screen at all widths |
| Mobile menu CTA | `#contact` | Closes menu, scrolls to form |
| 5 service CTAs + AI band + 2 case-study CTAs (8) | `#contact` | Pre-select the matching service (`saas`, `ai`, `webapp`, `mobile`, `webdesign`) |
| "See our work" / hero proof links | `#work`, `#work-radiora`, `#work-edusen` | In-page |
| Visit Radiora Medical / EduSen / XP / SunuPermis / Clinic | External, new tab, `rel="noopener noreferrer"` | All 200 on 2026-10-22; EduSen shows ScolaTech (G2); SunuPermis and Clinic open on a login page |
| WhatsApp / email / phone | `wa.me`, `mailto:`, `tel:` | `wa.me` resolves to WhatsApp |

37 in-page anchors resolve. No "Book", "Get a Quote" or "Request Submitted" anywhere.

### Lead form

| Check | Result |
|---|---|
| Required fields, email format, 10-char message (client) | ✅ EN/FR messages, focus to first error |
| Server-side validation (types, lengths, allow-lists, honeypot, CRLF) | ✅ `tests/contact.test.js`, `tests/handler.test.js` |
| Rate limit | ✅ 6th request/IP → 429 + `Retry-After` (unit). Preview, invalid empty POSTs (cannot reach SMTP): 400, 400, 400, then **429 + `Retry-After: 600`** (the earlier real submissions from the same IP counted toward the 5) — per-instance limit confirmed on the deployed function |
| Double submission | ✅ Double click → exactly 1 POST and 1 email |
| Delivery (local SMTP catcher) | ✅ One message to `EMAIL_TO`, Reply-To = visitor, subject with reference, source/language/timeline present; FR request tagged French |
| Delivery (Vercel preview, real function) | ❌ 503 — function log: `[Teranga] SMTP not configured`. Page shows honest error + pre-filled fallback ✅ |
| Failure states (503, 429, network) EN/FR | ✅ No false success; input kept; button re-enabled; pre-filled email/WhatsApp |
| Privacy | ✅ Purpose + deletion contact under the form; analytics events carry no personal data or message text |
| Booking | No booking system exists; the site says "Request", and the operating guide sets the reply-and-schedule process. `BOOKING_URL` switches CTAs to "Book…" if a booking page is adopted |

### Test inventory

| Suite | Where | Result |
|---|---|---|
| `npm test` (node --check ×4 + 34 node:test cases) | Local (Windows, Node 24.11) and GitHub Actions (Ubuntu, Node 24) | 34/34 · CI run 39864842591 ✅ |
| Browser harness (playwright-core + Chrome + axe-core 4.10.2 + local SMTP), 31 journeys | Local server, branch code | 31/31 |
| Same harness against TERANGA-01 code (`828cf5c`) | Local | 23/31 — fails exactly the TERANGA-02 checks (proves the harness discriminates) |
| Browser harness, remote mode (+ real unmocked submission) | Vercel preview `b19f37b` | 29/29 (the 8 layout/axe checks run with CSP bypass only to inject axe: the deployed CSP blocks inline scripts, as intended) |
| html-validate 8.24.2 | `index.html` | 5 notices (`aria-label` on lists, ARIA-conformant) |
| npm audit | Runtime + dev | 0 vulnerabilities |

The browser harness is a release tool kept outside the repository (it needs Chrome and Playwright); the committed suite runs anywhere with Node.

## 7. GitHub evidence

| Item | Value |
|---|---|
| Repository | https://github.com/seckbara23-cmyk/Teranga-technologies |
| Branch | `release/teranga-02-stabilization` (based on `feat/teranga-01-ai-first-website` `828cf5c`, which is based on `master` `e52bdd8`) |
| CI | GitHub Actions "CI" — run 39864842591 on `b19f37b`: success (npm ci, npm test, npm audit) |
| Pull request | **Not opened** — GitHub API not available in this session. Open it here: https://github.com/seckbara23-cmyk/Teranga-technologies/compare/master...release/teranga-02-stabilization?expand=1 (it contains TERANGA-01 and TERANGA-02; close PR #1 as superseded) |
| Review boundary (TERANGA-02 only) | https://github.com/seckbara23-cmyk/Teranga-technologies/compare/feat/teranga-01-ai-first-website...release/teranga-02-stabilization |
| Merge | Not merged. `master` unprotected: enable "Require status checks (CI)" before merging |

## 8. Vercel preview verification

| Item | Value |
|---|---|
| Project | `teranga-technologies` (`prj_pFf2inKU2qMVBZM0bP4tEQeLLJGo`), team `seckbara23-6470s-projects` |
| Deployment | `dpl_GV8tRx3X5kPsF7HCdZJFPdK2xzs6`, target **Preview**, **READY** |
| URL | https://teranga-technologies-cgqruj1r1-seckbara23-6470s-projects.vercel.app (Vercel login or share link) · branch alias https://teranga-technologies-git-relea-4e48bb-seckbara23-6470s-projects.vercel.app |
| Git SHA | `b19f37b5caa091be9884b671a16ecf1fe2ebdab5` = CI-tested commit |
| Served files | `main.js` byte-identical to the commit; `index.html` identical except the preview-only Vercel toolbar script that Vercel injects (blocked by the CSP by design) |
| Headers | CSP, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy, HSTS, `X-Robots-Tag: noindex` |
| Not deployed (404) | `/server.js`, `/tests/…`, `/.github/…`, `/docs/…`, `/api/_lib/contact.js`, `/Pictures/…`, `/package.json`, `/README.md`, `/.env.example`, `/.vercelignore` |
| Served (200) | `/`, `/robots.txt`, `/sitemap.xml`, `main.js`, `style.css`, fonts, brand and portfolio assets |
| Environment variables | None exist (names checked, values never read) |
| Function logs | Each real submission logged `[Teranga] SMTP not configured…` (22:27:22 and 22:40:13 UTC); no other errors |
| Browser journeys | 29/29: EN/FR content and title, CTAs and service pre-selection, 37 anchors, validation EN/FR, real submission → 503 + honest pre-filled fallback, mocked 503/429/network EN/FR, 4 widths × EN/FR layout + axe, keyboard, language persistence, reduced motion, no-JS. 0 console errors other than the blocked preview toolbar |
| Lighthouse | Mobile 99 / 100 / 93, desktop 100 / 100 / 93 (Perf / A11y / BP); SEO n/a on a `noindex` preview |
| Rate limit | 429 + `Retry-After: 600` after 5 requests/IP on the instance |

## 9. Production GO/NO-GO checklist

| Gate | Status | Owner action |
|---|---|---|
| G1 Lead capture operational (SMTP vars in Production + Preview, inbox-confirmed test) | ❌ | Follow `docs/commercial-operating-guide.md` §1 setup, then send the delivery test |
| G2 EduSen vs ScolaTech naming and link | ❌ | Choose: "ScolaTech (formerly EduSen)" + `https://scolatech.app`, or keep EduSen with another link |
| G3 Owner sign-off on published claims: code-ownership FAQ, "MVPs in 4–8 weeks" (typical, not guaranteed), naming XP Client Academy / SunuPermis / Clinic Management System, reply target "one business day" | ❌ | Confirm or request changes |
| G4 Critical functionality passes | ✅ | — |
| G5 No known critical/high exploitable defect | ✅ | — |
| G6 CI passes | ✅ | — |
| G7 PR opened and reviewed | ❌ | Open the PR from the link in §7; review |
| G8 No unrelated changes | ✅ | Only site, API, tests, CI, docs; untracked owner files untouched |
| G9 Production env vars verified | ❌ | Part of G1 |
| G10 Preview tests pass | ✅ (delivery excepted — G1) | Re-run delivery test after G1 |
| G11 Rollback path documented | ✅ | §10 |
| G12 Exact production commit identified | ✅ | The merge commit of the PR (record its SHA on merge) |
| G13 Explicit owner approval for production | ❌ | Reply "approve production release of <SHA>" |

Optional before release (recommended, owner approval because they affect production immediately): Vercel Firewall rate-limit rule on `POST /api/contact`; enable Web Analytics; require the CI check on `master`.

## 10. Release and rollback procedure

Release (after G1–G13):
1. Merge the PR into `master` with a merge commit; note the SHA.
2. Vercel builds production automatically; wait for READY and confirm `githubCommitSha` equals the merge SHA.
3. Smoke-test https://teranga-tech.com: EN and FR, a CTA to the form, one labelled delivery test reaching the inbox, `/server.js` → 404, headers present.
4. Check Vercel logs for `/api/contact` errors.

Rollback (any time):
- **Vercel Instant Rollback** to the current production deployment `dpl_H3pSap7rWRnkHLpbQKawwiE7mus6` (`e52bdd8`): Vercel → Deployments → that deployment → "Instant Rollback", or `vercel rollback https://teranga-technologies-olusrsctw-seckbara23-6470s-projects.vercel.app`. Takes effect in seconds; no rebuild.
- Then revert the merge on `master` (`git revert -m 1 <merge SHA>`) so the next push does not redeploy the rolled-back code.
- Note: rolling back restores the old site, whose forms do not deliver leads either.
