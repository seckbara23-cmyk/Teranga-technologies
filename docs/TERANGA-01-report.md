# TERANGA-01 — Premium AI-first website transformation: delivery report

Branch `feat/teranga-01-ai-first-website` · prepared 2026-10-22 · production (teranga-tech.com, commit `e52bdd8`) untouched.
Internal document (not deployed).

---

## A. Executive summary and baseline audit

The site now positions Teranga as an AI-first engineering partner for funded startups, scaling SMEs and enterprise teams, with a working discovery-call pathway, truthful case studies for Radiora Medical and EduSen, full EN/FR parity and clean accessibility results.

The most important finding was that **the site's main conversion path did not work**. Every primary button ("Get a Quote", "Get a Free Quote", "Start a Project", all five "Request This Service") opened a 6-step quote wizard whose submit handler only wrote to the browser console and then showed "Request Submitted!". Those leads never reached anyone. Only the secondary contact form at the bottom of the page sent email.

**Baseline (production code `e52bdd8`, audited locally — production serves this exact commit)**

| Area | Finding | Impact |
|---|---|---|
| Conversion | Quote wizard (all primary CTAs) never submitted; showed a false success message | Critical — silent lead loss |
| Brand / trust | Header logo and favicon were a stock image carrying a visible **Picxy watermark** | High — credibility and licensing risk |
| Brand / trust | About photo was a stock image with alt text "Teranga Technologies team working in Dakar" | High — misleading |
| Mobile UX | Header overflowed by 102 px at 390 px wide (187 px on tablet): the FR switch and menu button sat off-screen | High — mobile visitors could not open the menu or switch language |
| SEO | Canonical, Open Graph URL and schema pointed to `terangatech.com`; the live domain is `teranga-tech.com`. No social image, no robots.txt, no sitemap | Medium |
| Accessibility (axe) | 3 serious rule violations: focusable content inside `aria-hidden` dialog, colour contrast (3 nodes), label/name mismatch on language buttons (2) | Medium |
| Lighthouse (mobile) | Performance 83, Accessibility 92, Best practices 96, SEO 100; LCP 2.8 s, TBT 350 ms | — |
| Security | API sent `Access-Control-Allow-Origin: *` by default; email HTML built from user input with only `<>` stripped; deprecated `X-XSS-Protection` header | Low–medium |
| Positioning | "Startup-friendly, flexible pricing", budgets starting below 500,000 FCFA, generic "we build websites" message; no AI positioning | High for the stated goal |
| Analytics | None | Medium — no conversion visibility |
| i18n | EN/FR switch worked but ignored browser language; French content exists only after JavaScript runs | Medium (see F) |

Note: Google Fonts requests failed inside the audit sandbox (network allowlist), which inflated baseline console errors. That is an environment artefact, not a production bug; the new site self-hosts its fonts anyway.

## B. Positioning and copy, before and after

| | Before | After |
|---|---|---|
| Promise | "We Build Digital Products That Grow Your Business" | "Intelligent software that accelerates growth and automates operations." / « Des logiciels intelligents qui accélèrent votre croissance et automatisent vos opérations. » |
| Audience | "startups and SMEs" | Funded startups, scaling SMEs, enterprise teams (kicker line above the headline) |
| Proof | None above the fold | Live, animated example of Radiora's dictation-to-structured-report flow with the radiologist sign-off, plus links to both case studies |
| Primary CTA | "Get a Free Quote" (broken) | "Book a discovery call" / « Réserver un appel découverte » (working) |
| Price framing | "Flexible pricing", FCFA budget brackets | No price signals; FAQ explains estimate-after-discovery and phased plans |
| AI | Not mentioned | Dedicated section with five principles, each labelled **"How we work"** (method) or **"Shipped in Radiora / EduSen"** (demonstrated) |
| Work | Six equal cards | Two in-depth case studies + "Also built" list (XP Client Academy, SunuPermis, Clinic Management System kept with their links) |

Five services were rewritten with a benefit-led headline, short description, three use cases and a specific CTA that pre-selects the service in the form: SaaS development, AI integration (highlighted), Web applications, Mobile applications, Web design. Maintenance and support is kept as an after-launch note and a form option. French copy was written natively (French typographic spacing, guillemets, "vous").

Truthfulness rules applied: no invented clients, metrics, testimonials, certifications or adoption claims. Two first-draft labels were corrected during review because they implied adoption ("SaaS running in schools" → "SaaS built for schools"; "AI live in healthcare" → "A live healthcare AI product"). EduSen's own site invites schools to "join the first establishments", so the site does not claim it is in use. Case-study "Results" read "Measured results are being compiled" until real figures exist.

## C. Files changed and architecture decisions

| File | Change |
|---|---|
| `index.html` | New information architecture: hero + demo, credibility strip, services, AI engineering, selected work, process, why Teranga, FAQ, discovery-call contact, footer. Skip link, landmarks, `aria-*`, corrected SEO/OG/JSON-LD |
| `style.css` | Rewritten. Brand navy + amber preserved; Bricolage Grotesque (display) + Inter (text), self-hosted |
| `main.js` | Rewritten. 216-key EN/FR dictionary, language detection (`?lang=` → saved → browser → EN), accessible mobile menu, one-time hero animation (respects reduced motion), discovery form with inline validation, analytics bridge, optional `BOOKING_URL` |
| `api/_lib/contact.js` (new) | Shared validation, HTML escaping, email building, SMTP send — used by both the Vercel function and `server.js` |
| `api/contact.js`, `server.js` | Thin wrappers over the shared module; no wildcard CORS; `Cache-Control: no-store`; local rate limit configurable (`CONTACT_RATE_LIMIT`, default 5) |
| `vercel.json` | Added Content-Security-Policy and Permissions-Policy; removed deprecated `X-XSS-Protection`; caching for `/assets/` |
| `assets/brand/*` (new) | Interim SVG logo mark, 180 px touch icon, 1200×630 social image |
| `assets/fonts/*` (new) | Variable WOFF2 fonts + OFL licences (≈144 KB) |
| `assets/portfolio/*.webp` (new) | WebP versions of the two case-study screenshots (≈11 KB each vs ≈63 KB PNG) |
| `robots.txt`, `sitemap.xml`, `.vercelignore` (new) | Crawl files; `docs/` excluded from deployment so sales templates and plans are never public |
| `README.md` | Updated for the new structure, content editing and env vars |
| `docs/*` (new) | This report, case studies, growth assets, AI enablement roadmap |

Decisions:
1. **Replaced the non-functional 6-step wizard with one discovery form** wired to the existing endpoint. Shorter, works, matches the "book a call" goal. Budget question dropped (see F).
2. **Backward-compatible API.** The endpoint still accepts the old form's service labels, so a visitor with a cached old page can still submit.
3. **No framework, no build step, no new runtime dependencies.** The existing static + serverless architecture was kept.
4. **Self-hosted fonts** remove a third-party request, help performance and privacy, and allow a strict CSP.
5. **Original images kept** in `Pictures/` (no longer referenced) rather than deleted; the owner should decide (see F).
6. **Cache-busting** (`?v=20261022`) on CSS/JS, because the old 1-day cache could pair new HTML with old JavaScript.

## D. Validation results

All runs on 2026-10-22 against the branch, served locally (static server for audits; Express server + local SMTP catcher for end-to-end tests).

| Check | Before | After |
|---|---|---|
| Lighthouse mobile (Perf / A11y / BP / SEO) | 83 / 92 / 96 / 100 | **92 / 100 / 100 / 100** (LCP 2.5 s, TBT 260 ms, CLS 0) |
| Lighthouse desktop | — | **100 / 100 / 100 / 100** (LCP 0.6 s) |
| axe-core violations | 3 rules (serious) | **0** |
| Horizontal overflow (320, 390, 820, 1100, 1440 px; EN and FR) | 102 px @390, 187 px @820 | **0 at every width** |
| Console errors / failed requests | see note in A | **0 / 0** |
| html-validate (recommended rules) | not run | **0 problems** (after fixing 6 phone-number spacing warnings) |
| JS syntax (`node --check`, 4 files) | — | **pass** |
| EN/FR completeness (211 keys used) | — | **0 missing in EN, 0 missing in FR, 0 HTML/EN drift, 0 raw keys, no breaking space before French ? ! : ;** |
| Language selection | — | **pass**: `fr-FR` browser → FR; `?lang=en` overrides; choice persists on reload |
| End-to-end behaviour | — | **40/40 pass** (below) |
| Vercel function handler | — | **6/6 pass**: valid 200, string body 200, bad JSON 400, GET 405, OPTIONS 204, missing SMTP 500; no CORS header by default |

End-to-end checks (40/40): API rejects bad email, unknown service, short message, honeypot and invalid timeline; still accepts the old payload; HTML email escapes `<script>`; service CTAs pre-select the form and focus the first field; empty submit flags all four required fields with announced messages and focuses the first; success message and form reset; **email actually delivered** to `EMAIL_TO` with subject "[Teranga] Discovery call request — SaaS development — Acme SA", visitor as Reply-To and the timeline included; French validation and French failure message with email/WhatsApp fallback; input kept and button re-enabled after a failure; mobile menu opens with keyboard, label switches, Escape closes and returns focus, links close it; first Tab hits the skip link; header CTA reachable by keyboard; FAQ opens with keyboard; visible focus outline; reduced motion shows the final demo state; demo plays; language switch mid-animation shows the complete French report; content fully visible without JavaScript; all in-page anchors resolve; all external links use `rel="noopener"`.

Not verified here: the live SMTP settings on Vercel (the Vercel connector refused access to environment variables), real-device testing, and behaviour behind Vercel's CDN with the new CSP. These belong to preview validation.

## E. Git, push, PR and preview status

- Branch: `feat/teranga-01-ai-first-website`, created from `master` at `e52bdd8` (master has not moved since).
- Commits: `ea9c437` fix(contact), `3ddbfdf` feat(site), `9596154` chore(deploy), `a6ea417` docs, plus this status update.
- **Push: done** after the Claude GitHub App was installed (first attempt was refused with HTTP 403).
- **Pull request: #1 open** — https://github.com/seckbara23-cmyk/Teranga-technologies/pull/1 (into `master`, not merged).
- **Vercel preview: READY** — deployment `dpl_ZJiRY6ZcGiSgKP1L5FvMK85pREKQ` (commit `a6ea417`), https://teranga-technologies-n2qthk2ds-seckbara23-6470s-projects.vercel.app (Vercel login required, or a share link).
- Preview checks: `/` 200 with the new page; Content-Security-Policy, Permissions-Policy, X-Frame-Options, nosniff and HSTS present; `/docs/growth-assets.md` 404 (internal docs not deployed); `/api/_lib/contact.js` 404 (source not exposed); `GET /api/contact` 405 JSON with `Cache-Control: no-store` (function deployed and running); `/sitemap.xml` 200; `/assets/…` served with the 30-day cache header.
- Not checked on the preview: a real form submission (needs a browser; depends on SMTP variables being set for the Preview environment).
- Expected on previews only: Vercel injects its feedback-toolbar script (`vercel.live`), which the new CSP blocks. Production is unaffected unless the toolbar is enabled there.
- Nothing was merged, force-pushed or deployed to production. No environment variables were read or changed.

## F. Open decisions and risks

1. **Merge approval.** PR #1 is open. Review the Vercel preview on a phone (EN and FR), submit a real request, then approve the merge to put the site live.
2. **Logo.** The interim SVG mark replaces a watermarked stock image. Supply the official logo. Consider removing `Pictures/Logo Teranga` (watermarked) and `Pictures/Pic1.jpg` (stock photo, licence unknown) from the repository.
3. **Contact email.** A Gmail address on a premium B2B site weakens trust. Recommended: `contact@teranga-tech.com` (or similar) once a mailbox exists, then update the page, JSON-LD and `EMAIL_TO`.
4. **SMTP on Vercel.** Confirm `EMAIL_HOST/USER/PASS/TO` are set for Production and Preview. Without them the form shows the email/WhatsApp fallback.
5. **Booking link.** If you use Calendly or Cal.com, set `BOOKING_URL` in `main.js`.
6. **Claims to confirm before merge:** the FAQ answer on code ownership, the "reply within 24 hours" promise (carried over from the old site), permission to name XP Client Academy, SunuPermis and the Clinic Management System, and whether Radiora and EduSen are Teranga's own products or client builds. Details are in `docs/case-studies.md`.
7. **Case-study outcomes** stay as "being compiled" until measured figures exist.
8. **Budget qualification.** The old wizard asked for FCFA budget brackets. The new form does not ask about budget. Decide whether to add an optional range, and in which currency.
9. **French SEO.** French content is rendered by JavaScript on the same URL, so search engines mainly index English. Next phase: static `/fr/` page with `hreflang`.
10. **Analytics.** Conversion events are wired but nothing is installed. Choose a tool (e.g. Vercel Web Analytics; check which plan supports custom events).
11. **Claude Partner Network.** The "Developer" and "Architect" learning paths exist only in Anthropic's Partner Academy. Decide whether to apply (see `docs/ai-enablement-roadmap.md`).
12. **Screenshots** of Radiora and EduSen are about 440 px wide. Higher-resolution captures (≥1200 px) would sharpen the case studies.
13. Unrelated, found during the first check: a duplicate Vercel project (`teranga-broadcast-platform`) fails on every push of Teranga Broadcast.

## G. Recommended next phase

1. **Release (days 1–3):** validate the Vercel preview on real phones (EN and FR), submit a real request → owner approval → merge PR #1.
2. **Proof (weeks 1–4):** fill the measured outcomes and permissions in `docs/case-studies.md`; replace the logo; switch to a domain email; add higher-resolution screenshots.
3. **Reach (weeks 2–6):** start outreach with `docs/growth-assets.md` using `?lang=fr` links; install analytics and track `lead_submitted` by source.
4. **Search (weeks 4–8):** bilingual URL structure (`/en/`, `/fr/`, `hreflang`), then the first pillar page from the SEO cluster.
5. **Capability (days 1–90):** run `docs/ai-enablement-roadmap.md` and turn the three AI offers into demos with scorecards.
