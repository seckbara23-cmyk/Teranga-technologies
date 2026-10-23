# TERANGA-05B — Proof register

Audience: the owner, and anyone editing the website's copy. Every material marketing claim on teranga-tech.com, with its evidence and status.

Verification date: **2026-10-23**, from public pages fetched on that day unless noted. Update this register whenever a claim is added or changed. `tests/site.test.js` checks that every product linked on the Work page appears here.

**Status legend:**
- **Verified**: public evidence seen on the date above.
- **Owner-provided**: the owner's statement; not independently verifiable from public sources.
- **Owner decision**: must be confirmed, changed or removed by the owner.
- **Changed in 05B**: wording corrected in this release.

## 1. Company identity

| Claim (where) | Evidence | Status |
|---|---|---|
| Name "Teranga Technologies" (everywhere, structured data) | In use since TERANGA-01; credited as "Teranga Technologies" on xpclient-academy.com and "Teranga Tech" on radiora.vercel.app. No registration number or legal form is published | Owner-provided. **Owner decision:** confirm the registered legal name before adding any legal details |
| Office "Ngor Almadies, Dakar, Senegal" (footer, About, Privacy) | Owner-provided since TERANGA-01; not independently verified | Owner-provided. Structured data now states only Dakar, SN (no street address). **Owner decision:** confirm it is current and should stay public |
| Phone / WhatsApp +221 70 715 70 70 (footer, contact) | Owner-provided; the `wa.me` link resolves | Owner-provided |
| Email seckbara23@gmail.com (footer, contact, privacy) | Receives the lead notifications (TERANGA-03 onward) | In use. Domain mailbox not available: see `docs/TERANGA-05B-brand-credibility.md` §3 |
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
| Version-controlled code, automated checks, documented releases (Home "Why Teranga") | Demonstrated on this website's own repository (GitHub, CI, 90 tests, release reports) | Verified for this project; owner confirms it is standard practice |
| Written scope, milestones and estimate before any build (process, contact "next steps") | Owner-provided process | Owner-provided |
| Clean handover and documentation (Home, About, FAQ) | Owner-provided; this repository is documented | Owner-provided |
| "A focused MVP is typically scoped for 4–8 weeks" (Services → SaaS; FAQ) | No public evidence; hedged ("typically scoped", "confirmed once the scope is agreed"). Carried over from TERANGA-04 | **Owner decision** (open since TERANGA-04): confirm or remove |
| "You own the custom code … once the project is paid" (About, FAQ) | Contractual statement | **Owner decision:** confirm that it matches the contract template |
| "We aim to respond within one business day" (CTA band, contact, confirmation) | A target, not a guarantee; tracked in the lead tracker (TERANGA-05A) | Owner-provided target |
| Wave, Orange Money, WhatsApp integrations (Services → Web applications) | Offered capability; no public example of a delivered integration | **Owner decision:** confirm past delivery or reword to "can integrate" |
| iOS and Android apps (Services → Mobile) | Offered capability; no native app in the public portfolio (Radiora's phone dictation is web-based) | **Owner decision:** confirm capability |

## 4. Portfolio

| Project | Relationship | Public access (2026-10-23) | Credit to Teranga | Claims on the site | Status |
|---|---|---|---|---|---|
| **Radiora Medical** — https://radiora.vercel.app | Not documented (Teranga's own product, or built for the separate "Radiora Medical" brand?) | Live: marketing and app pages; "30 jours d'essai · sans carte bancaire" | Footer: "Conçu par Teranga Tech", "© 2026 Radiora Medical" | All features verified on the live product: dictation from computer, phone or audio; AI structuring into Indication / Technique / Résultats / Conclusion; editing; templates; "Relire et signer"; "Isolation des données par établissement"; "Historique d'audit"; "L'IA ne pose pas de diagnostic, ne valide et ne signe jamais". "A live product with a public 30-day free trial" | Verified. **Owner decision:** state the relationship. Outcomes: none published |
| **EduSen** — https://senegal-school-management-system.vercel.app | Not documented | Live, but **now branded ScolaTech** (title, `og:url` https://scolatech.app; mock-up still shows `app.edus.sn`) | None on the page | Features match ScolaTech's page: "Isolation stricte des données entre établissements, authentification robuste et journalisation de chaque accès"; modules marked "Bientôt"; "Rejoignez les premiers établissements sénégalais" (early adoption) | **Owner decision (blocker for credibility, open since TERANGA-04):** rename to "ScolaTech (formerly EduSen)" and link https://scolatech.app, or explain the relationship |
| **XP Client Academy** — https://www.xpclient-academy.com | **Client project**: "© 2025 XP Client Consulting" | Live public site | "Plateforme conçue par Teranga Technologies" | Courses, quizzes, certificates, training for individuals and companies: verified | Verified. **Owner decision:** written permission to name the client and show the screenshot |
| **SunuPermis** — https://sunu-permis.vercel.app | Not documented | Sign-in page only | None | Driving-licence administration features: not publicly verifiable | Owner-provided. **Owner decision:** confirm it may be named (possible public-sector context) |
| **Clinic Management System** — https://clinic-health-management-system.vercel.app | Not documented | Sign-in page only ("CHMS — Système de Gestion Clinique") | None | Patient records, appointments, consultations, billing, documents: not publicly verifiable | Owner-provided. **Owner decision:** confirm it may be named |

Screenshots: all five are captures of the public pages listed above. Marketing authorisation is **not documented** for any of them; owner decision, needed most for XP Client Academy (a third party's brand).

What the site deliberately does not claim:
- no client names other than the products themselves;
- no logos, testimonials, ratings or user counts;
- no revenue or time-saved figures;
- no certifications or regulatory status (e.g. medical-device status for Radiora).

The Work page says "Quantitative outcomes are not yet published" for both case studies.

## 5. AI Engineering labels

| Label (AI Engineering page) | Before 05B | Now | Evidence |
|---|---|---|---|
| AI-assisted reporting; human approval | "In production: Radiora Medical" | "Live in Radiora Medical" | Live product with a public trial; review-and-sign step and human-oversight statement verified |
| Privacy, access control, auditability | "In production: Radiora Medical and EduSen" | "Built into Radiora Medical and EduSen" | Isolation and audit features stated on both public pages. "In production" overstated EduSen/ScolaTech, which is in early adoption |
| Capabilities intro | "…runs in one of our own products" | "…runs in a product we built" | Ownership of the products is not documented; "built" is credited publicly for Radiora |

## 6. Structured data

| Property | Value | Evidence |
|---|---|---|
| Organization name, url, logo | Teranga Technologies, https://teranga-tech.com/, the site's own icon | Site |
| email, telephone | As in the footer | Visible on every page (test-enforced) |
| address | addressLocality Dakar, addressCountry SN only | Footer office line |
| knowsLanguage | fr, en | Site |
| Service ×6 (Services page) | Name and headline of each visible section | Test-enforced: the name is the section heading |
| Not included | Street address, opening hours, ratings, reviews, founders, awards, social profiles (`sameAs`), FAQ markup | Not verified, or not visible |
