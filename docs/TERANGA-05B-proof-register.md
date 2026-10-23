# TERANGA-05B — Proof register

Audience: the owner, and anyone editing the website's copy. Every material marketing claim on teranga-tech.com, with its evidence and status.

Verification date: **2026-10-23**, from public pages, public repositories and the owner's Vercel project records read on that day, unless noted. Update this register whenever a claim is added or changed. `tests/site.test.js` checks that every product linked on the Work page appears here and that the ScolaTech lineage is recorded.

**Status legend:**
- **Verified**: evidence seen on the date above.
- **Owner-approved**: the owner explicitly approved it (decision recorded in §0).
- **Owner-provided**: the owner's statement; not independently verifiable.
- **Owner decision**: must be confirmed, changed or removed by the owner.
- **Changed in 05B**: wording corrected in this release.

## 0. Owner decisions recorded (2026-10-23)

| # | Decision | What it covers | What it does not cover | Implemented |
|---|---|---|---|---|
| D1 | Publish "**ScolaTech (formerly EduSen)**", provided the lineage is verified | Product name EN/FR, URL, description, screenshot, alt text | Ownership of the brand, client relationships, usage figures | Yes. Lineage **verified** (§4.1) |
| D2 | **Permission to name and display XP Client Academy** | Naming XP Client Academy / XP Client Consulting; the existing screenshot and description | Any new claim: outcomes, testimonials, student numbers, revenue, conversion | Yes. Attribution "Designed and built for XP Client Consulting" |
| D3 | **Remove the fixed 4–8 week MVP estimate** | Services → SaaS outcome; FAQ "How long does an MVP take?" | — | Yes. Scope-dependent wording, EN/FR (§3) |

These decisions don't approve anything else in this register. Every other "Owner decision" below stays open.

## 1. Company identity

| Claim (where) | Evidence | Status |
|---|---|---|
| Name "Teranga Technologies" (everywhere, structured data) | In use since TERANGA-01; credited as "Teranga Technologies" on xpclient-academy.com and "Teranga Tech" on radiora.vercel.app. No registration number or legal form is published | Owner-provided. **Owner decision:** confirm the registered legal name before adding any legal details |
| Office "Ngor Almadies, Dakar, Senegal" (footer, About, Privacy) | Owner-provided since TERANGA-01; not independently verified | Owner-provided. Structured data states only Dakar, SN (no street address). **Owner decision (open):** confirm it is current and should stay public |
| Phone / WhatsApp +221 70 715 70 70 (footer, contact) | Owner-provided; the `wa.me` link resolves | Owner-provided |
| Email seckbara23@gmail.com (footer, contact, privacy) | Receives the lead notifications (TERANGA-03 onward) | In use. **Open:** domain mailbox not available (brand credibility §3) |
| "Designed and engineered in Dakar, Senegal" (footer) | Owner-provided | Owner-provided |
| Dakar on UTC+0 all year (About, FAQ, audience card) | Senegal uses GMT with no daylight saving | Verified (public fact) |
| French and English delivery | Site and all documents are bilingual; owner-provided for client work | Owner-provided |

## 2. Positioning and audiences

| Claim (where) | Evidence | Status |
|---|---|---|
| "AI-first software engineering"; "Custom software & AI engineering" (titles, hero) | Positioning statement, supported by the AI Engineering page and the live Radiora Medical product | Verified as capability; positioning |
| "For funded startups, growing SMEs, established organisations and international teams" (hero note, "Who we work with") | Target audiences, written as needs ("You need…"). Not a claim of existing clients in each segment | Changed in 05B (new section). Not a client claim |
| "Engineering partner in Senegal or West Africa" (audience card) | Location fact; no claim of a West African client base | Verified (location) |

## 3. Delivery and engineering practice

| Claim (where) | Evidence | Status |
|---|---|---|
| Version-controlled code, automated checks, documented releases (Home "Why Teranga") | Demonstrated on this website's repository (GitHub, CI, 93 tests, release reports) and in the public repositories of the portfolio products | Verified for these projects; owner confirms it is standard practice |
| Written scope, milestones and estimate before any build (process, contact "next steps") | Owner-provided process | Owner-provided |
| Clean handover and documentation (Home, About, FAQ) | Owner-provided; this repository is documented | Owner-provided |
| ~~"A focused MVP is typically scoped for 4–8 weeks"~~ | **Removed (D3).** Now (Services → SaaS): "Delivery timelines depend on scope, integrations, technical complexity and readiness: we set milestones and a realistic delivery plan during discovery." FR: "Les délais dépendent du périmètre fonctionnel, des intégrations, de la complexité technique et de l'état de préparation du projet : nous définissons les étapes et un calendrier réaliste lors du cadrage." The FAQ answer says the same, plus "confirm it in writing" | Owner-approved, changed. A test blocks any fixed delivery duration |
| "You own the custom code … once the project is paid" (About, FAQ) | Contractual statement, worded conditionally ("Ownership is set out in the contract") | **Owner decision (open):** confirm that it matches the contract template |
| "We aim to respond within one business day" (CTA band, contact, confirmation) | A target, not a guarantee; tracked in the lead tracker (TERANGA-05A) | Owner-provided target |
| Wave, Orange Money, WhatsApp integrations (Services → Web applications, "What we deliver") | **Build evidence:** the public ScolaTech repository's deployed history includes "Phase 7.2 Wave + Orange Money provider adapters" (`bbb62a6`) and "Phase 9D.4 WhatsApp (Meta Cloud) providers" (`3845bce`). Production use with live transactions is not evidenced ("Phase 7 hardening before live payments") | Supported as built capability. **Owner decision (open):** confirm live use before claiming production integrations |
| ~~"iOS and Android apps"~~ (Services → Mobile) | **No public evidence of native development:** none of the 9 public repositories uses a native mobile toolchain (all Next.js / web). ScolaTech ships an installable web app (manifest + install prompt). Wording changed to "Installable mobile apps (PWA) for customers or field teams, on iOS and Android" / "Applications mobiles installables (PWA) … sur iOS et Android" | Changed in 05B (conservative). **Owner decision (open):** restore "native iOS and Android" only with evidence of a delivered native app |

## 4. Portfolio

| Project | Relationship | Public access (2026-10-23) | Credit and build evidence | Claims on the site | Status |
|---|---|---|---|---|---|
| **Radiora Medical** — https://radiora.vercel.app | Not documented (Teranga's own product, or built for the separate "Radiora Medical" brand?) | Live: marketing and app pages; "30 jours d'essai · sans carte bancaire" | Footer: "Conçu par Teranga Tech", "© 2026 Radiora Medical". Public repo `seckbara23-cmyk/Radiora` ("AI Radiology assistant"); deployed from the owner's Vercel team (project `radiora`) | All features verified on the live product: dictation from computer, phone or audio; AI structuring into Indication / Technique / Résultats / Conclusion; editing; templates; "Relire et signer"; "Isolation des données par établissement"; "Historique d'audit"; "L'IA ne pose pas de diagnostic, ne valide et ne signe jamais". "A live product with a public 30-day free trial" | Built by Teranga: verified. **Owner decision (open):** ownership and marketing relationship of the Radiora Medical brand. Outcomes: none published |
| **ScolaTech (formerly EduSen)** — https://scolatech.app | Product operated by the owner (its repository includes "internal billing of schools for their EduSen subscription"): a SaaS product, **not a client engagement** | Live marketing page; app behind sign-in; "Rejoignez les premiers établissements sénégalais" (early adoption); some modules "Bientôt" | No public credit on the product. Public repo `seckbara23-cmyk/Senegal-School-Management-System`; owner's Vercel project `senegal-school-management-system`, which serves both `scolatech.app` and the former URL | Features match the live page: "Isolation stricte des données entre établissements, authentification robuste et journalisation de chaque accès"; early adoption; no outcomes published | **Lineage verified** (§4.1). Named per D1. Legal ownership of the brand: not documented |
| **XP Client Academy** — https://www.xpclient-academy.com | **Client project**: "© 2025 XP Client Consulting" | Live public site | "Plateforme conçue par Teranga Technologies" | "Designed and built for XP Client Consulting": courses, quizzes, certificates, training for individuals and companies (verified on the site) | **Owner-approved (D2):** permission to name and display. Teranga = design and build partner; the brand and business belong to XP Client Consulting. No outcomes, testimonials or figures claimed |
| **SunuPermis** — https://sunu-permis.vercel.app | Not documented | Sign-in page only | No credit on the page. Public repo `seckbara23-cmyk/SunuPermis` ("Driver License Test Platform"); owner's Vercel project `sunu-permis` | Driving-licence administration features: not publicly verifiable on the live product | Built by Teranga: supported by repository and hosting. **Owner decision (open):** ownership and permission to name it (possible public-sector context) |
| **Clinic Management System** — https://clinic-health-management-system.vercel.app | Not documented | Sign-in page only ("CHMS — Système de Gestion Clinique") | No credit on the page. Public repo `seckbara23-cmyk/Clinic-Health-Management-System`; owner's Vercel project `clinic-health-management-system` | Patient records, appointments, consultations, billing, documents: not publicly verifiable on the live product | Built by Teranga: supported by repository and hosting. **Owner decision (open):** ownership and permission to name it |

### 4.1 ScolaTech (formerly EduSen) — Lineage verified

The question: is ScolaTech demonstrably the renamed or successor product of EduSen? **Yes.** The evidence comes from four independent sources:

| # | Evidence | Source |
|---|---|---|
| 1 | The website's EduSen link was added by the owner on **2026-06-03** (commit `0e6f55c`) pointing to `https://senegal-school-management-system.vercel.app`. The screenshot captured the same day (`e52bdd8`) shows that page branded **EduSen**: "La gestion scolaire moderne pour les établissements sénégalais", "Conçu pour les écoles du Sénégal", "Données sécurisées · Accès mobile · Interface en français" | This repository's history |
| 2 | Today both `https://scolatech.app` and the former URL return **byte-identical HTML** (same build). The page carries the same hero copy as the 2026-06-03 EduSen screenshot, now branded **ScolaTech**, and still shows the old domain `app.edus.sn` in its mock-up | Live pages, 2026-10-23 |
| 3 | Both domains belong to **one Vercel project** in the owner's team (`senegal-school-management-system`, created 2026-05-24), deployed from **one Git repository**, `seckbara23-cmyk/Senegal-School-Management-System`. `scolatech.app` was attached on **2026-06-09 21:57 UTC** | Owner's Vercel project records (read-only) |
| 4 | In the **public** repository, commit **`aec8d08`** (2026-06-09 22:47 UTC, "Update ScolaTech PWA metadata and docs") changed `public/manifest.json` from `"name": "EduSen"` to `"name": "ScolaTech"`, and also the README, app title and install prompt. Earlier commits still say EduSen (2026-06-08 `00332e8` "Abonnement EduSen"; 2026-06-09 21:27 `5fd7154` "Installer EduSen") | Public GitHub repository |

**Conclusion:**
- ScolaTech is EduSen renamed on 2026-06-09: same codebase, same hosting project, continuous history.
- Canonical URL: `https://scolatech.app` (the product's `og:url` and its custom domain). The former `.vercel.app` URL still works but is not the official address, so the site now links `scolatech.app`.
- The screenshot was replaced by a current capture of `scolatech.app`.

**Uncertainty:** the legal owner of the ScolaTech brand (the owner personally or a company) isn't documented. The site says "products we designed and built", which the evidence supports, and doesn't claim brand ownership.

**Kept for stability:** the internal key `edusen` (the URL fragment `/work#edusen`, the analytics `project` value, the legacy-link map). It isn't visible text, and changing it would break existing links and split analytics history.

**Screenshots:**
- ScolaTech: replaced on 2026-10-23 with a capture of its public home page (`assets/portfolio/scolatech.*`).
- XP Client Academy: covered by D2.
- Radiora, SunuPermis, CHMS: authorisation not documented (owner decisions above).

What the site deliberately does not claim:
- no client names other than the products themselves and XP Client Consulting (D2);
- no logos, testimonials, ratings or user counts;
- no revenue or time-saved figures;
- no certifications or regulatory status (e.g. medical-device status for Radiora).

The Work page says "Quantitative outcomes are not yet published" for both case studies.

## 5. AI Engineering labels

| Label (AI Engineering page) | Before 05B | Now | Evidence |
|---|---|---|---|
| AI-assisted reporting; human approval | "In production: Radiora Medical" | "Live in Radiora Medical" | Live product with a public trial; review-and-sign step and human-oversight statement verified |
| Privacy, access control, auditability | "In production: Radiora Medical and EduSen" | "Built into Radiora Medical and ScolaTech" | Isolation and audit features stated on both public pages. "In production" overstated ScolaTech, which is in early adoption |
| Capabilities intro | "…runs in one of our own products" | "…runs in a product we built" | "Built" is supported for every product (credits, repositories, hosting); ownership is not documented for all |

## 6. Structured data

| Property | Value | Evidence |
|---|---|---|
| Organization name, url, logo | Teranga Technologies, https://teranga-tech.com/, the site's own icon | Site |
| email, telephone | As in the footer | Visible on every page (test-enforced) |
| address | addressLocality Dakar, addressCountry SN only | Footer office line |
| knowsLanguage | fr, en | Site |
| Service ×6 (Services page) | Name and headline of each visible section | Test-enforced: the name is the section heading |
| Products | No product nodes (no `SoftwareApplication` etc.): the portfolio is described in visible text only | — |
| Not included | Street address, opening hours, ratings, reviews, founders, awards, social profiles (`sameAs`), FAQ markup | Not verified, or not visible |
