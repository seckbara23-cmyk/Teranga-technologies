# TERANGA-05B — Release report: bilingual SEO, search authority and brand credibility

Audience: the owner deciding whether to merge. Date: 2026-10-23. Branch `feat/teranga-05b-seo-authority` from `master` `1a5438b`.

**Production merged: NO** · **Production deployment changed: NO**

## Revision 1 — owner decisions (2026-10-23, PR #7)

The owner reviewed the proof register and took three decisions. They are recorded in `docs/TERANGA-05B-proof-register.md` §0 and implemented on the same branch and PR (#7).

| Decision | Evidence / condition | Implemented |
|---|---|---|
| **D1** "ScolaTech (formerly EduSen)", if the lineage is verified | **Verified** from four independent sources (proof register §4.1): <br>1. this repository's 2026-06-03 EduSen link and screenshot; <br>2. byte-identical builds on `scolatech.app` and the former URL, with the same hero copy; <br>3. one Vercel project and one Git repository serving both domains (`scolatech.app` attached 2026-06-09); <br>4. public commit `aec8d08` (2026-06-09) renaming the app manifest `"EduSen"` → `"ScolaTech"` | EN "ScolaTech (formerly EduSen)", FR "ScolaTech (anciennement EduSen)" on the home card, Work case study, Work metadata and AI label. Link → https://scolatech.app. New screenshot of the current ScolaTech page; alt text updated. The old EduSen screenshot was removed. Internal key `edusen` / `/work#edusen` kept for link and analytics stability. Presented as a product Teranga designed and built (an operated SaaS), not a client |
| **D2** Permission to name and display XP Client Academy | Client site: "© 2025 XP Client Consulting", "Plateforme conçue par Teranga Technologies" | Work card: "Designed and built for XP Client Consulting: …" / "Conçue et développée pour XP Client Consulting : …". No new claims |
| **D3** Remove the fixed 4–8 week MVP estimate | — | Services → SaaS and the FAQ, EN/FR: timelines depend on scope, integrations, technical complexity and readiness; milestones and a realistic plan are set during discovery. A test blocks any fixed duration (the contact form's own start-date options excepted) |

Also changed, as a conservative wording for an unsupported claim: Services → Mobile "iOS and Android apps" became "Installable mobile apps (PWA) … on iOS and Android". None of the 9 public repositories uses a native mobile toolchain; ScolaTech ships an installable web app.

New evidence for an open claim: the public ScolaTech repository contains Wave + Orange Money payment adapters (`bbb62a6`) and a WhatsApp (Meta Cloud) provider (`3845bce`). The capability wording stays; live use is unverified.

**Validation of the revision:**

| Check | Result |
|---|---|
| `npm test` | **93/93** (90 + 3 new tests: ScolaTech naming, links, screenshot identity and recorded lineage; no fixed delivery duration; XP attribution and no native-app claim). Each new commit passes on its own. CI `test` green on `72b9a5d` |
| Browser suite, preview `dpl_HJ87nCx2whfJZuUJsX7d8ax2yFTv` | **38/38** (every submission mocked): EN/FR pages and images, navigation, CTA preselection, form paths, 8 events without personal data, mobile menu, axe WCAG 2.2 AA with **0 violations** on 14 pages × 4 widths plus the confirmation state |
| Browser suite, local | **43/43** (incl. attribution through the real Resend SDK to a fake API) |
| Preview HTTP | `/work`, `/fr/work` link `https://scolatech.app`, with no trace of the former URL. New images 200; old `edusen.png` 404. Labels present EN/FR; no week counts. Trailing-slash 308, private folders 404, `X-Robots-Tag: noindex`, analytics check OK |
| Lighthouse (preview, mobile) | Home 98 · 98, Work 97 · 98, FR Work 98. A11y/BP 100. SEO fails only `is-crawlable` (preview noindex). CLS 0. Home 175 → 192 KB (+17 KB: the 2× ScolaTech screenshot) |
| HTML validation / lint | 0 errors / only the pre-existing `no-control-regex` finding |
| Structured data | Local tests pass. The external Schema.org validator refused automated requests during the revision (HTTP 405 and a robot page). The only structured-data change is the Work page description text; the same graph validated with 0 errors and 0 warnings earlier today |
| Production | Unchanged: `dpl_B5nEVpgRkUYBeRo8f6keCjb73vwY` (`1a5438b`) still serves the pre-05B site |

**Remaining owner decisions** (unchanged by D1–D3; none is misleading as currently worded):
- Radiora Medical brand ownership and marketing relationship;
- SunuPermis and CHMS ownership and permission to name them;
- code-ownership wording versus the contract;
- live use of the Wave / Orange Money / WhatsApp integrations;
- native mobile (to restore native wording);
- the Ngor Almadies office line;
- the domain mailbox;
- Search Console and Bing;
- `www` → 308.

Product credits: Radiora and XP credit Teranga; ScolaTech, SunuPermis and CHMS don't yet.

**Verdict after revision 1: GO for the owner's production decision.**
- The one credibility blocker (EduSen/ScolaTech) is resolved with verified evidence.
- The open items are either already in production unchanged or now worded more conservatively.
- Every check passes.

Merging remains the owner's decision.

## A. Executive summary

The site was already technically sound: Lighthouse SEO 100 and Accessibility 100 on production. This release works on what decides qualified inbound demand.

- **Being found for what Teranga sells.** Titles, descriptions and headings now name custom software, SaaS, AI integration, process automation, modernisation and Dakar/Senegal, in English and French. Before, they mostly named formats ("Services — SaaS, AI, web…") or product names.
- **Speaking to the four buyers.** A new "Who we work with" section addresses each buyer by their need, with a link to the relevant service:
  - funded startups;
  - growing SMEs;
  - established organisations modernising;
  - international companies seeking a partner in Senegal or West Africa.
- **One clean identity for search engines:**
  - the duplicate `.vercel.app` site and the trailing-slash duplicates now redirect permanently to the canonical URLs;
  - every page carries truthful structured data (Organization, WebSite, WebPage, plus the six Services); the Schema.org validator reports 0 errors and 0 warnings;
  - a real favicon for search results.
- **Claims match the evidence.** A proof register lists every marketing claim with its evidence. Two overstated labels ("In production: … EduSen") were corrected.

Nothing was invented: no clients, figures, testimonials, certifications or keyword volumes.

## B. Baseline audit (`docs/TERANGA-05B-baseline-audit.md`)

| Verified issue | Severity | Resolution |
|---|---|---|
| `teranga-technologies.vercel.app` served the full site (200, no `noindex`) | Medium | 308 to teranga-tech.com (`vercel.json`) |
| `/services/`, `/fr/` etc. answered 200 (duplicates) | Low–medium | `trailingSlash: false` → 308 |
| `www` → apex with 307 (temporary) | Low | **Owner**: add www as a 308 redirect in Vercel → Domains |
| `/favicon.ico` 404 | Low | Added |
| Thin keyword coverage in titles and descriptions | High (relevance) | Rewritten from the keyword map |
| Service names not in the Services headings | Medium | Now inside each `<h2>` |
| Structured data only on Home, LocalBusiness type, neighbourhood as street address, unstated areas served | Medium | Replaced on every page |
| "In production: … EduSen" while EduSen/ScolaTech is in early adoption | Medium (trust) | "Built into Radiora Medical and EduSen" |
| **EduSen link shows ScolaTech** | High (trust) | **Resolved in revision 1** (D1, lineage verified): "ScolaTech (formerly EduSen)", linked to scolatech.app |
| No Search Console / Bing verification found | High (visibility) | **Owner** checklist; optional tag slots added |
| No MX/SPF/DMARC: domain cannot receive mail | — | Gmail kept; mailbox checklist |

Already correct and left unchanged:
- production indexable; previews `noindex` + login;
- robots.txt and sitemap with reciprocal alternates;
- self-referencing canonical and `hreflang` (en, fr, x-default → en);
- one H1 per page with no skipped levels;
- unique, bounded titles and descriptions;
- HTTPS and HSTS;
- the bilingual 404.

## C. Technical SEO (`docs/TERANGA-05B-seo-implementation.md`)

- **Metadata:** new titles and descriptions for Home, Services, AI Engineering, Work and About (EN/FR); Home `og:title`; Contact and Privacy unchanged. Open Graph and Twitter tags follow the page metadata.
- **Canonical and language alternates:** unchanged. French pages self-canonical, never pointed to English; covered by existing tests plus the new sitemap-equals-canonicals test.
- **Sitemap and robots:** unchanged content (14 canonical URLs with alternates). Tests now assert the sitemap lists exactly the canonical URLs, and robots allows everything with the sitemap.
- **Redirects:** trailing slash and `.vercel.app` host, both 308.
  - Verified on the preview: `/services/`, `/fr/`, `/fr/services/` → 308 to the slash-less URL, query kept.
  - The host rule does not capture preview hosts (preview `/` → 200).
- **Structured data:**
  - Organization, WebSite and WebPage/AboutPage/ContactPage on every indexable page; Service ×6 on Services; none on the 404.
  - Only visible facts. No street address, ratings, reviews, founders, awards, `sameAs`, FAQ or Breadcrumb markup (reasons in the implementation doc).
  - Schema.org validator: 0 errors, 0 warnings on 6 sampled pages (EN/FR).
- **Search verification:** `SEARCH_VERIFICATION` in `site/config.mjs` (empty); DNS verification preferred.

## D. Search strategy (`docs/TERANGA-05B-search-strategy.md`)

- **Audiences:** funded startups; growing SMEs (largely French-speaking, Senegal and francophone West Africa); established organisations modernising or adding AI; international companies looking for a partner in Senegal or West Africa.
- **Page map:**

| Page | Topic |
|---|---|
| Home | Custom software and AI engineering, Dakar (brand and "who builds software in Senegal") |
| Services | Software development services |
| AI Engineering | AI integration and business process automation |
| Work | Case studies |
| About | Engineering partner in Dakar |
| Contact | Conversion, unchanged |

- **Status:** all terms are qualitative hypotheses. No keyword data was available, and none was invented. Validate with Search Console queries after verification.
- **Next opportunities** (each needs real material): case studies with measured outcomes, dedicated SaaS and AI service pages, first-hand articles, French-first content for West African SMEs.

## E. Premium credibility (`docs/TERANGA-05B-proof-register.md`, `docs/TERANGA-05B-brand-credibility.md`)

**Positioning:**
- the hero line no longer says "operate smarter and grow": it now names custom software, SaaS and AI-powered workflows with "secure, maintainable and reliable after launch";
- the footer tagline names the audiences;
- the services lead says "custom software development";
- "modernising a legacy system" and "automating back-office steps" are now listed as uses.

**Evidence verified on 2026-10-23:**

| Product | What was verified |
|---|---|
| Radiora Medical | Every feature on the Work page, on the live product; the public 30-day free trial; the "Conçu par Teranga Tech" credit |
| XP Client Academy | Features, the "Plateforme conçue par Teranga Technologies" credit, and its client relationship (© XP Client Consulting) |
| EduSen / ScolaTech | Features match the ScolaTech page; in early adoption |
| SunuPermis, CHMS | Sign-in pages only, so their features can't be verified publicly |

**Case-study format:** context, problem, what we built, engineering decisions, oversight / audience, **status and results** (now stating verified status), CTA. Nothing that can't be substantiated was added.

**Contact identity:** the Gmail address stays. `teranga-tech.com` has no MX, SPF or DMARC, so a domain address would not receive mail. The step-by-step checklist is in the brand doc §3.

## F. Performance and accessibility

Lighthouse 12.2.1, mobile unless stated. Production (`1a5438b`) vs preview (`86a7e5b`); preview runs block only Vercel's preview toolbar.

| Page | Perf prod → prev | A11y | BP prod → prev | SEO prod → prev | LCP prod → prev | TBT prod → prev | CLS prod → prev |
|---|---|---|---|---|---|---|---|
| `/` (2 runs) | 96 · 98 → 96 · 96 | 100 → 100 | 100 → 100 | 100 → 0* | 2.06 · 1.90 → 2.29 · 2.29 s | 192 · 36 → 31 · 102 ms | 0.013 · 0 → 0 · 0 |
| `/` desktop | 100 → 100 | 100 | 100 → 100 | 100 → 0* | 0.44 → 0.51 s | 0 → 0 | 0 → 0 |
| `/fr` | 98 → 97 | 100 | 100 → 100 | 100 → 0* | 1.88 → 2.22 s | 23 → 37 ms | 0 → 0 |
| `/services` | 98 → 97 | 100 | 100 → 100 | 100 → 0* | 1.87 → 2.19 s | 7 → 13 ms | 0 → 0 |
| `/fr/services` | 97 → 97 | 100 | 100 → 100 | 100 → 0* | 2.03 → 2.15 s | 43 → 0 ms | 0 → 0 |
| `/ai-engineering` (4 preview runs) | 100 · 97 → 99 · 97 · 99 · 96 | 100 | 100 → 100 | 100 → 0* | 1.84 · 1.97 → 2.15–2.22 s | 0 → 0 | 0 → 0.029 · 0 · 0.017 · 0† |
| `/work` | 97 → 97 | 100 | 100 → 100 | 100 → 0* | 1.88 → 2.17 s | 0 → 0 | 0 → 0 |
| `/about` (4 preview runs) | 99 · 98 → 99 · 99 · 99 · 96 | 100 | 100 → 100 | 100 → 0* | 1.87 · 1.78 → 2.13–2.31 s | 48 → 0 ms | 0 → 0.027 · 0 · 0 · 0† |
| `/contact` | 97 → 98 | 100 | 100 → 100 | 100 → 0* | 1.80 → 2.25 s | 92 → 61 ms | 0 → 0 |

\* The only failing SEO audit on the preview is `is-crawlable`: Vercel's `X-Robots-Tag: noindex` on previews, which is the intended protection. Every other SEO audit passes.

LCP is 0.2–0.4 s higher on the preview. That's the preview-environment offset measured in TERANGA-05A: the same code was 2.24 s on the 04 preview and 1.78 s in production.

† Intermittent CLS on the preview, investigated:
- a captured load shows the hero H1 re-wrapping when the display font arrives late (`font-display: swap`, unchanged since TERANGA-04);
- the 05B changes on these pages are only the `<title>` (About) and label text (AI Engineering);
- across 9 throttled and 30 unthrottled browser loads (About and AI Engineering, production and preview), it appeared once (preview `/about`);
- production showed the same effect in the baseline (home, 0.013).

So it's a pre-existing, timing-dependent font swap, more frequent on the colder preview cache, and well under the 0.1 "good" threshold. **Follow-up:** a metric-matched fallback font (`size-adjust` / `ascent-override`) would remove it.

Size: home 174 → 175 KB (structured data and the new section); favicon 1.8 KB.

**Accessibility and UX** (browser suite, preview, every submission mocked): **38/38**.
- 14 pages EN/FR; 404; navigation and current page; CTA wording; service preselection on 9 CTAs per language; language switching; mobile menu by keyboard;
- form validation, failure paths and confirmation with focus management;
- the 8 analytics events and their properties, with no personal data in the page or vendor queue; analytics failure doesn't block the form;
- reduced motion; no-JS;
- axe-core WCAG 2.0/2.1/2.2 A/AA + best practice: **0 violations on 14 pages × 375/768/1180/1440 px plus the confirmation state**.

Locally: **43/43**, including attribution end to end through the real Resend SDK to a local fake API.

## G. Security and privacy

- **API unchanged** (`api/` untouched). Preview check: invalid input → 400 with a field message. The full contact and handler suites pass (injection, size limit, rate limit, duplicates, Resend outcomes).
- **Analytics:** `main.js` unchanged; `check-analytics` OK on the preview (script 200, custom events on, 2 properties).
- **Private files:** `/docs/…`, `/scripts/…` answer 404 on the preview; a new test forbids links to `docs/`, `tests/`, `scripts/`, `site/` and `Pictures/` from pages and the sitemap.
- **Escaping:** verification tags are escaped (test); JSON-LD escapes `<`.
- **Unresolved:** the pre-existing `no-control-regex` lint finding in `clean()` (intentional sanitiser).

## H. GitHub

| | |
|---|---|
| Branch | `feat/teranga-05b-seo-authority` (pushed; not merged) |
| Commits | `546448d` feat(seo): canonical-host redirects, structured data on every page, favicon · `07f362e` feat(content): buyer segments, keyword-led metadata and evidence-based labels · `86a7e5b` docs: baseline audit, search strategy, SEO implementation, credibility, UAT · then this report |
| Tests | 84 → **90** (none removed or weakened; the old home-only structured-data assertion was replaced by stricter checks). Each commit passes on its own (89 → 90 → 90) |
| CI | `test` and Vercel checks successful on `86a7e5b` |
| PR | Not opened automatically (no GitHub CLI; the GitHub connector's token is rejected). Compare link: https://github.com/seckbara23-cmyk/Teranga-technologies/compare/master...feat/teranga-05b-seo-authority?expand=1 — title "TERANGA-05B — Bilingual SEO, search authority and brand credibility" |

## I. Vercel

| | |
|---|---|
| Validated preview | `dpl_8JDxqVdXCiyaz2N2ksqLSon9DFhR`, READY, commit `86a7e5b5c7c0e25d91b6d2b585029535360d8777` (= branch head when validated), target preview |
| Branch alias | latest branch deployment; previews behind Vercel Authentication (share link given in the PR conversation, not stored here) |
| Production | Unchanged: `dpl_B5nEVpgRkUYBeRo8f6keCjb73vwY`, `master` `1a5438b` |
| Environment variables | Not changed |

This report's own commit changes only `docs/` (not deployed). Its preview is checked for READY and SHA in the PR description.

## J. Owner decisions

1. **EduSen / ScolaTech:** rename and relink, or explain (biggest credibility issue).
2. Relationship and marketing permission for each product, especially **XP Client Academy** (a client brand).
3. "MVP typically 4–8 weeks"; code-ownership wording; Wave/Orange Money and native mobile claims (proof register §3).
4. Office line "Ngor Almadies": confirm it stays public.
5. **Search Console** (Domain property via DNS TXT), sitemap submission, **Bing** import.
6. **`www` → 308** in Vercel → Domains.
7. **LinkedIn company page** (then add `sameAs`).
8. Domain mailbox (keep Gmail until set up and tested).
9. Optional follow-up: metric-matched fallback fonts (removes the intermittent font-swap shift).

## K. Release verdict

**CONDITIONAL GO.** Technically ready to merge:
- all tests, the browser suites, accessibility and structured-data validation pass;
- production is unchanged and preview protections are intact;
- the verified improvements are listed in §B–§C.

The condition is the owner's review of the new copy (UAT §A–B) and acceptance that the EduSen/ScolaTech mismatch stays visible until decided (UAT §C). The mismatch predates this release, and no claim was added that would make it worse.

| Verified improvements | Unverified assumptions | Remaining blockers |
|---|---|---|
| Duplicate URLs redirect; structured data valid on every page; keyword-led metadata; service names in headings; buyer segments addressed; corrected labels; favicon; 90 tests | Search demand for the mapped terms (no data); ownership of the portfolio products and office address (owner statements); ranking effect of any change (none promised) | None technical. Business: EduSen/ScolaTech naming and product permissions (owner) |

**Production merged: NO** · **Production deployment changed: NO**
