# TERANGA-04 — Premium bilingual website experience: release report

Branch `feat/teranga-04-premium-experience` (from `master` `cf5d781`, the production commit) · production untouched.
Prepared 2026-10-23. Internal document (not deployed). Screenshots: `docs/teranga-04/`.

---

## Status

| Area | Result |
|---|---|
| Design implementation | COMPLETE |
| Routing and navigation | PASS |
| French/English parity | PASS |
| Contact and Resend | PASS (inbox receipt of the preview test to be confirmed by the owner) |
| Automated validation | PASS |
| GitHub PR | NOT OPEN (no GitHub API access in this session; compare link below) |
| Vercel Preview | READY |
| Production | UNCHANGED (`cf5d781`, `dpl_HqBUBj3EiGK53PeTEjUz27yvoveG`) |
| Recommendation | **GO** — ready for owner approval (not authorization to merge) |

## 1. Baseline (verified before any change)

| Item | Finding |
|---|---|
| Repository / production branch | `seckbara23-cmyk/Teranga-technologies`; Vercel production branch `master` (corrected by the owner since TERANGA-03); `master` = `cf5d781` (PR #3 merge) |
| Production deployment | `dpl_HqBUBj3EiGK53PeTEjUz27yvoveG` serving `cf5d781`; Resend key on Production + Preview |
| Architecture | Static HTML/CSS/vanilla JS, one Vercel function (`api/contact.js` → Resend), no build step |
| Routing | Single page with hash sections (`#services`, `#ai`, `#work`, `#work-radiora`, `#work-edusen`, `#process`, `#why`, `#faq`, `#contact`, `#svc-*`) |
| Localization | One URL; English HTML replaced at runtime by a ~440-key dictionary in `main.js` |
| **Reported FR defect** | Reproduced on production with the API mocked: success, error and field messages **kept their language after a language switch** (submit in English, switch to FR → English message stays; field errors likewise) |
| Working tree | Five untracked `Pictures/*.png` (owner's), untouched |

## 2. Architecture decision

Six pages in two languages could not stay as runtime string replacement on one URL without losing per-language canonical URLs and `hreflang`, French for no-JS visitors and crawlers, and with a large dictionary in every page view. The site is now **generated**: a dependency-free Node script (`site/build.mjs`) renders each page in English and French from shared components and per-language content into plain HTML. The output is committed, so **Vercel still serves static files with no build step**, and a test fails if the committed HTML differs from the generator output.

Kept: the stack (static + one function), the Resend function and its tests, the CSP, fonts, brand assets and screenshots. No new runtime or dev dependency, no new service.

## 3. Information architecture and routing

| English | French | Purpose |
|---|---|---|
| `/` | `/fr` | Home: hero, four capabilities, selected work, why Teranga, delivery process, CTA |
| `/services` | `/fr/services` | Six services, each with problem, deliverables, typical uses, outcome and CTA |
| `/ai-engineering` | `/fr/ai-engineering` | AI capabilities (offered vs in production), Radiora example, safeguards, where to start |
| `/work` | `/fr/work` | Radiora Medical and EduSen case studies; XP Client Academy, SunuPermis, Clinic Management System |
| `/about` | `/fr/about` | Name, principles, collaboration and ownership, location |
| `/contact` | `/fr/contact` | Form, what happens next, direct channels, FAQ |

- Clean URLs (`vercel.json` `cleanUrls`): `/services.html` → 308 → `/services`. Bilingual `404.html`.
- Header on every page: Home · Services · AI Engineering · Our Work · About · Contact (current page marked with `aria-current` and an amber rule), EN/FR switcher, "Discuss your project" CTA. Below 1241 px: accessible menu button (keyboard, Escape returns focus, current page, switcher and CTA inside).
- Language: the switcher links to the same page in the other language. Preference order: `?lang=` → saved choice → French browsers are sent from English pages to French; a shared French link stays French.
- Old links keep working: `/?lang=fr…` → 307 → `/fr…` with other parameters kept (Vercel redirect + JS for other pages); `/#services`, `/#svc-*`, `/#ai`, `/#work`, `/#work-radiora`, `/#work-edusen`, `/#faq`, `/#contact` → matching page and section; `/#process` and `/#why` stay on the home page.
- SEO: unique titles (≤ 70 chars) and descriptions per page and language; canonical = production URL of that page; `hreflang` en/fr/x-default; Open Graph locale; JSON-LD `ProfessionalService` on the home pages only; sitemap with 12 URLs and alternates; robots unchanged. Previews send `X-Robots-Tag: noindex`.

## 4. Design system — "Teranga Signature" (`style.css`)

- Tokens on the existing brand values (navy `#0B1F3A`, secondary `#13294A`, amber `#F5A524`, paper `#F3F5F8`); these match the logo, social image and email template, and are within a shade of the brief's suggested values. New `--amber-ink` (`#9A5B00`) for amber-coloured text on light surfaces (contrast).
- Typography: Bricolage Grotesque (display) and Inter (text), self-hosted; fluid scale for H1/H2/H3/lead with `clamp()`; measure limited to ~60 characters for prose; uppercase eyebrows instead of bold everywhere.
- Layout: standard container and section rhythm; alternating white, paper and ink surfaces; different compositions per page (numbered capability grid, project cards, two-column statement, timeline, service head + panel, case-study media + blocks, principle cards, FAQ split).
- Components (`site/components.mjs`): GlobalHeader, GlobalFooter, HeroSection (`homeHero`, `pageHero`), ServiceCard (`capabilityCard`), FeaturedProject, CaseStudySection (Work page blocks), SectionHeading, ProcessTimeline, ProofStatement, CTASection, ContactForm, LanguageSwitcher, plus BrowserFrame for real screenshots and the Radiora demo window.
- Motion: hover lifts and arrow nudges; entrance motion only for elements below the fold (nothing on screen is ever hidden); none with `prefers-reduced-motion`; no animation library.
- Hero visual: real assets only, the animated Radiora dictation-to-report flow layered over a real EduSen screenshot. No invented dashboard or AI imagery.

## 5. Contact and Resend

Unchanged contract: same field ids, `POST /api/contact`, validation, honeypot, rate limit, duplicate suppression, Resend notification with reference `TT-YYYYMMDD-XXXX`, submission time, language, source/UTM, Reply-To = visitor, privacy note, failure fallback (pre-filled email/WhatsApp). `api/` is unchanged in this branch.

Improved: form on its own page (first on mobile), 48 px fields, clearer required marker, "Sending…" state, `?service=` pre-selection from every service CTA, draft carried across a language switch. **FR defect fixed by design**: messages come from the page's language, and switching language loads the other page, so no message can be left in the previous language (tested in both directions).

| Check | Where | Result |
|---|---|---|
| Valid EN submission with UTM captured on another page (`/services?utm_…` → `/contact`): one notification, reference `TT-YYYYMMDD-XXXX` in the subject, sender, recipient, Reply-To = visitor, inquiry type, source, language, idempotency key | Local server + real Resend SDK → fake Resend API | ✅ |
| Double click → 1 request; identical resubmission → success shown, not resent | Same | ✅ |
| Resend rejects (403) → HTTP 502, honest error with pre-filled fallback, nothing recorded; delivered after recovery | Same | ✅ |
| FR submission → `lang: fr`, French success, notification "Language: French" | Same | ✅ |
| Validation, 503, network failure, mocked success — messages in the page's language, input kept, fallback pre-filled (EN and FR) | Local and preview | ✅ |
| Draft kept across a language switch | Local and preview | ✅ |
| **Controlled live test** (one submission): `/fr/services?utm_source=teranga04-uat` → service CTA → `/fr/contact?service=ai` (pre-selected) → submit | Preview `dpl_73FDwdTcu7o6cX6zfxFKwRtjZEke` | ✅ HTTP 200; page: "Demande envoyée. Nous nous efforçons de vous répondre sous un jour ouvré…"; 1 POST; form reset; 0 console errors. Vercel log: `Lead accepted by Resend` ref **TT-20261023-3952**, Resend id **01a16645-b381-72d9-b905-517ab14c824a**, `lang: fr`, `sourced: true`, `deployment: preview`, `fromDomain: teranga-tech.com`, `recipients: 1` |
| Inbox receipt and Resend "Delivered" | Owner | ⏳ Subject `[TEST · preview] New Teranga Technologies Inquiry — AI integration — Teranga UAT · TT-20261023-3952`, marker `UAT4-20261023T010002Z`, Reply-To `uat-teranga-04@example.com` |

**Disclosure:** the automated preview suite also sent **one unintended test email** (ref `TT-20261023-A95E`, Resend id `01a16644-a4b2-7c57-85a7-2fc59033502a`, name "Test Prospect", Reply-To `prospect@example.com`, labelled `[TEST · preview]`): a leftover submit in the "draft survives a language switch" check was not mocked in remote mode. It went only to the configured owner inbox. The harness was corrected; no other real submission was made.

## 6. Validation

| Check | Result |
|---|---|
| `npm test` (node --check ×4 + node:test) | **56/56** locally; GitHub Actions run 39881127902 on `7d6bd7c` ✅ |
| Generated pages = generator output (freshness), EN/FR content structure identical | ✅ (in `npm test`) |
| Mutation checks: CSS edited without regenerating; invalid `?service=` value | Both caught |
| html-validate 8.24 (recommended) on all 13 HTML files | **0 problems** |
| ESLint 9 recommended (ad hoc; no repo config) on `main.js` and `site/` | **0 problems** (2 pre-existing findings remain in `api/`: intentional control-character regex, unused `catch` binding) |
| TypeScript `checkJs` on `api/` and `server.js` against Resend types (ad hoc) | 0 errors |
| Production build | No build on Vercel by design; preview build `7d6bd7c` READY. The first push (`07d0969`) failed and was fixed (§9) |
| `npm audit` | 0 vulnerabilities |
| Browser suite, local (Chrome + axe-core 4.10, real Resend SDK → fake Resend API) | **31/31** |
| Browser suite, deployed preview (all submissions mocked) | **27/27** (delivery checks are local-only) |
| HTTP checks on the preview | 13 routes 200 with the right canonical and `lang`; `.html` → 308 clean URL; `/?lang=fr&utm_source=…` → 307 `/fr?…` (UTM kept); unknown path 404 (bilingual page); security headers present; `X-Robots-Tag: noindex`; sitemap 12 URLs |

Browser suite coverage: 12 pages load (language, one h1, unique titles, every image decoded); 404; header links and current page (EN/FR); header CTA; 6 service CTAs pre-select the form; language switch keeps the page and persists; `?lang=fr` keeps other parameters; French browser → French, shared French link stays French; 6 legacy hash redirects; `#process`/`#why`; mobile menu by keyboard; form validation, failures and success in both languages; draft across language switch; real delivery journeys (local); layout and axe on 12 pages × 375/768/1180/1440 px; reduced motion; entrance motion never hides on-screen content; no-JS rendering.

## 7. Accessibility and performance

**Accessibility** — axe-core 4.10.2 with WCAG 2.0/2.1/2.2 A–AA and best-practice rules: **0 violations on all 12 pages at 375, 768, 1180 and 1440 px**, locally and on the preview. Also checked on every page and width: no horizontal overflow, header never overflows (French labels included; menu below 1241 px), no control under 24 px tall, no off-screen control. Keyboard: skip link first, menu operable with Escape returning focus, visible focus rings (amber on dark surfaces), FAQ disclosure. Forms: labels, required markers, `aria-invalid` + `aria-describedby` errors, polite live region. Landmarks: no nested complementary landmarks. Images: meaningful alternative text (decorative logo empty). Reduced motion respected. Issues found and fixed during the run: amber "01–06" numerals at 2.5:1 contrast (now `--amber-ink`), services jump chips partly off-screen (now wrap), French header 19 px too wide at 1180 px (menu breakpoint raised), `<aside>` landmarks nested in sections (now plain containers).

**Performance** — Lighthouse 12.2.1 against the preview (mobile emulation unless noted):

| Page | Perf | A11y | BP* | LCP | TBT | CLS |
|---|---|---|---|---|---|---|
| `/` (mobile) | 88 → 99, 99 on re-runs | 100 | 93 | 2.2–2.4 s | 430 ms first run; 0–10 ms re-runs | 0.013 |
| `/` (desktop) | 100 | 100 | 93 | 0.5 s | 0 ms | 0.001 |
| `/services` | 96 | 100 | 93 | 2.3 s | 80 ms | 0 |
| `/work` | 98 | 100 | 93 | 2.3 s | 110 ms | 0 |
| `/contact` | 96 | 100 | 93 | 2.2 s | 70 ms | 0 |
| `/fr` | 96 | 100 | 93 | 2.3 s | 160 ms | 0.043 |

*Best Practices 93 and SEO 0 are preview artefacts: Vercel injects its feedback toolbar (blocked by the CSP → console error) and sends `noindex` on previews. Every page ships one stylesheet (43 KB, uncompressed) and one 20 KB script, down from 56 KB when `main.js` carried the ~440-key dictionary on every view; fonts are self-hosted and preloaded; images have explicit dimensions, lazy loading below the fold and WebP where available. Lighthouse notes the CSS is not minified (minor; left readable on purpose since there is no build step).

## 8. Security and secrets

- Diff reviewed: no keys, tokens or credentials; `.env.example` placeholders only; no environment variable or secret was read or changed.
- No Resend key, variable name, API host or sender address in any served HTML, CSS or JS (test + preview check).
- Not served on the preview (404): `/site/…` (generator and content source), `/server.js`, `/tests/…`, `/docs/…`, `/package.json`, `/.github/…`, `/Pictures/…`. `/api/_lib/contact.js` redirects (clean URLs) to `/api/_lib/contact`, which is 404.
- CSP unchanged (no `unsafe-inline`); generated pages contain no inline styles, handlers or executable inline scripts (tested).
- `npm audit`: 0 vulnerabilities. No new dependencies.

## 9. Delivery

| Item | Value |
|---|---|
| Baseline | `cf5d781` (production) |
| Branch | `feat/teranga-04-premium-experience` |
| Commits | `8265e3b` feat(site) redesign · `07d0969` docs · `7d6bd7c` fix(deploy) generator script name · (this commit) report and screenshots |
| CI | GitHub Actions "CI" success on `7d6bd7c` (run 39881127902); Vercel status success |
| Pull request | Not opened from this session. Open: https://github.com/seckbara23-cmyk/Teranga-technologies/compare/master...feat/teranga-04-premium-experience?expand=1 — title "TERANGA-04 — Premium bilingual website experience redesign" |
| Preview | `dpl_73FDwdTcu7o6cX6zfxFKwRtjZEke` · READY · target Preview · SHA `7d6bd7c9904edfcbc842ded5d6f38a599c2b8b2b` · https://teranga-technologies-4mj7x1u9f-seckbara23-6470s-projects.vercel.app (Vercel login or share link) |

First preview (`07d0969`) failed: Vercel ran the generator's `npm run build` script automatically while `site/` is excluded from uploads. Fixed in `7d6bd7c` (script renamed `generate`; a test guards against a `build` script returning).

## 10. Remaining issues and decisions

| # | Item | Severity | Owner |
|---|---|---|---|
| 1 | EduSen's live site is branded **ScolaTech**; the case study and link still say EduSen (open since TERANGA-01) | Medium (credibility) | Owner: choose name and link |
| 2 | Product screenshots are ~440 px wide; sharp at their display size on standard screens, soft on high-density screens | Low | Owner: provide ≥ 1200 px captures |
| 3 | Claims carried over from the approved site: "MVP typically scoped for 4–8 weeks", code-ownership wording, naming XP Client Academy / SunuPermis / Clinic Management System | Low | Owner: confirm or adjust |
| 4 | Interim logo mark | Low | Owner: official logo |
| 5 | No analytics installed (events are wired) | Low | Owner decision (see operating guide §7) |
| 6 | `/fr/` and `/fr` both serve the French home page (canonical `/fr`) | Info | — |

## Screenshots (docs/teranga-04/)

Captured from the live production site (before) and the deployed preview (after), top of each page, JPEG.

| Before (production `cf5d781`) | After (preview `7d6bd7c`) |
|---|---|
| [before-home-desktop.jpg](teranga-04/before-home-desktop.jpg) | [after-home-desktop.jpg](teranga-04/after-home-desktop.jpg) · [after-fr-home-desktop.jpg](teranga-04/after-fr-home-desktop.jpg) |
| [before-home-mobile.jpg](teranga-04/before-home-mobile.jpg) | [after-home-mobile.jpg](teranga-04/after-home-mobile.jpg) |
| — | [after-services-desktop.jpg](teranga-04/after-services-desktop.jpg) · [after-work-desktop.jpg](teranga-04/after-work-desktop.jpg) · [after-contact-mobile.jpg](teranga-04/after-contact-mobile.jpg) |

## 11. Production deployment risks

- URL change: every section of the old single page moves to its own page. Mitigated by the legacy hash and `?lang=` redirects (tested) and by the sitemap; search engines will re-index.
- Page weight per view is lower than before (no dictionary in `main.js`), but the site now has 12 URLs to keep in sync: the freshness test in CI enforces it.
- The contact page URL changes from `/#contact` to `/contact`: links in outreach material still work through the redirect.
- Rollback: Vercel Instant Rollback to `dpl_HqBUBj3EiGK53PeTEjUz27yvoveG` (`cf5d781`), then `git revert -m 1 <merge SHA>` on `master`. No environment change is involved.

## 12. Recommendation

**GO — ready for owner approval.** Every required check ran and passed on the deployed preview: routing, navigation, bilingual parity, contact and Resend (controlled live test accepted by Resend), accessibility (0 axe violations), security and secrets review, CI. No high-severity issue is open; the remaining items (§10) are owner content decisions that already exist on the live site and do not get worse with this release.

Before merging, the owner should: (1) confirm the live test email arrived (Gmail, check Spam) and shows Delivered in Resend; (2) review the preview on a phone in both languages; (3) open the pull request from the link in §9 and approve it; (4) optionally decide items 1 and 3 of §10. Merging into `master` deploys production automatically (production branch `master`).

A GO is not authorization to merge: merging and production deployment wait for the owner's explicit approval.
