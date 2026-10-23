# TERANGA-05B — Brand credibility and professional identity

Audience: the owner. What a high-value buyer sees when checking whether Teranga Technologies is a credible partner, what was improved, and the decisions only the owner can take. Evidence for each claim: `docs/TERANGA-05B-proof-register.md`.

## 1. Trust signals today

| Signal | State | 05B change |
|---|---|---|
| Consistent company name | "Teranga Technologies" on every page and in structured data; "Teranga Tech" in product credits | Structured data uses one organisation identity on every page |
| Location | Dakar, Senegal; office line "Ngor Almadies" | Structured data now says Dakar, SN only (no street address published as one) |
| Contact | WhatsApp, phone, Gmail address, contact form with a reference number on submission | Unchanged (see §3 for the email) |
| Clear offer | Six services with problem, deliverables, typical uses and outcome | Service names are now section headings; modernisation and back-office automation added as typical uses |
| Who it is for | Startups, SMEs, enterprise teams (one line) | New "Who we work with" section for four buyer segments, each with its specific need |
| About page | Name story, principles, collaboration terms, location | Title clarified ("software engineering partner in Dakar") |
| Delivery approach | 4-step process, written scope, demos, handover | Unchanged; it is the strongest credibility content and is now linked from the audience cards |
| Privacy | Bilingual privacy page (TERANGA-05A) | Unchanged |
| Project references | Two case studies + three products | Labels corrected; Radiora's verified status shown; **ScolaTech (formerly EduSen)** named, linked and pictured as it is today; XP Client Academy attributed to XP Client Consulting |
| Delivery timelines | "MVP typically 4–8 weeks" (Services, FAQ) | **Removed** (owner decision D3): scope-dependent wording, milestones and plan set during discovery |
| Testimonials, logos, figures | None | None added (nothing documented) |

## 2. Resolved: EduSen → ScolaTech (owner decision D1, lineage verified)

Before: a buyer who clicked "Visit the product" on the EduSen case study landed on a product called **ScolaTech**, with no mention of EduSen.

The owner approved the label "ScolaTech (formerly EduSen)" on condition that the lineage is verified. It is verified (proof register §4.1):
- same Vercel project and Git repository;
- the public commit `aec8d08` renamed the app manifest from "EduSen" to "ScolaTech" on 2026-06-09;
- the same hero copy appears before and after the rename;
- the former URL serves the identical deployment.

Implemented in EN and FR:

| Item | EN | FR |
|---|---|---|
| Name | "ScolaTech (formerly EduSen)" | "ScolaTech (anciennement EduSen)" |
| Applies to | Home card, Work case study heading, Work metadata, AI Engineering label ("Built into Radiora Medical and ScolaTech") | Same |
| Link | https://scolatech.app (the product's canonical domain) | Same |
| Screenshot | New capture of scolatech.app (the old one showed the EduSen brand) | Same |

The case study still presents it as a product Teranga designed and built, in early adoption, with no outcomes. It isn't presented as a client engagement: the repository shows it's an operated SaaS product.

Still worth doing (owner): add a "Designed by Teranga Technologies" credit on scolatech.app, as Radiora and XP already do. It turns the link into a verifiable reference for buyers.

## 2a. XP Client Academy (owner decision D2)

The owner confirmed permission to name and display XP Client Academy. On the Work page it now reads "Designed and built for XP Client Consulting: a customer-experience learning platform with courses, quizzes, certificates and training for individuals and companies". The FR text is equivalent.

- The brand and business belong to XP Client Consulting. Teranga is the design and build partner, which the client's own site credits ("Plateforme conçue par Teranga Technologies").
- No outcomes, testimonials, student numbers or revenue are claimed; D2 authorises none.

## 2b. Owner decisions still open

| Item | Current public wording | What would close it |
|---|---|---|
| Radiora Medical: ownership and marketing relationship | "A product we built" (supported by credit, repository and hosting) | State whether Radiora Medical is Teranga's own brand or a separate company's, and confirm marketing permission |
| SunuPermis: ownership and permission | Listed under "Also built by Teranga" with a sign-in link | Confirm permission to name it (possible public-sector context) |
| Clinic Management System: ownership and permission | Same | Same |
| Code ownership (About, FAQ) | "Ownership is set out in the contract. Our standard approach: …" | Confirm it matches the contract template |
| Wave / Orange Money / WhatsApp | "Payments and messaging such as Wave, Orange Money or WhatsApp" (built in ScolaTech) | Confirm live use, or keep as a capability statement (current) |
| Native iOS / Android | Changed to "installable mobile apps (PWA) … on iOS and Android" (no native work in public repositories) | Evidence of a delivered native app, to restore native wording |
| Office "Ngor Almadies, Dakar" | Published (footer, About, Privacy) | Confirm it is current and should stay public |
| Domain mailbox | Gmail address kept | §3 checklist |
| Search Console, Bing | Not set up | §4 |
| `www` redirect | Vercel default 307 | §4: 308 in Vercel → Domains |

## 3. Public email address

**Recommendation: keep `seckbara23@gmail.com` until a domain mailbox is proven to work.** A `contact@teranga-tech.com` address would look more professional, but today the domain **cannot receive mail**:

| Check (2026-10-23) | Result |
|---|---|
| MX records for teranga-tech.com | **None** (DNS on Vercel) |
| SPF on the apex | None (Resend's SPF is on `send.teranga-tech.com`, for its return path only) |
| DKIM | `resend._domainkey` only: Resend sending, not a mailbox |
| DMARC | None |

Resend's verified sending domain proves that the site can **send** notifications from `notifications@teranga-tech.com`. It doesn't prove that anyone can **receive** mail at the domain.

Owner checklist before any public change:
1. Choose a mailbox provider (e.g. Google Workspace or Zoho Mail) and create `contact@teranga-tech.com`, controlled by the owner.
2. Add the provider's MX records, plus its SPF include in a single apex `v=spf1 … ~all` record. Resend's records are on sub-names (`send`, `rsend`, `resend._domainkey`) and don't conflict.
3. Enable the provider's DKIM; then add `_dmarc` TXT `v=DMARC1; p=none; rua=mailto:<owner address>` and tighten it later.
4. Test inbound from an outside address, and outbound to Gmail and Outlook (check the headers for SPF/DKIM pass).
5. Approve the switch.

Then update `CONTACT.email` in `site/config.mjs`, the fallback links in `main.js`, the privacy text and `LEAD_NOTIFICATION_EMAIL` in Vercel (both environments), and regenerate. One change, one release.

## 4. Search engines and profiles (owner actions; nothing was created)

**Google Search Console**
1. search.google.com/search-console → Add property → **Domain** → `teranga-tech.com`.
2. Copy the TXT record shown. Add it in Vercel → Domains → teranga-tech.com → DNS Records (name `@`, type TXT). Then click Verify.
3. Sitemaps → submit `https://teranga-tech.com/sitemap.xml`.
4. URL inspection → request indexing for `/` and `/fr`.
5. After 2–4 weeks: Performance report by query and page. Compare with `docs/TERANGA-05B-search-strategy.md`.

Alternative without DNS:
1. Use the "URL prefix" property with the HTML tag method.
2. Paste the token into `SEARCH_VERIFICATION.google` in `site/config.mjs`.
3. Regenerate, and release.

**Bing Webmaster Tools**
1. bing.com/webmasters → **Import from Google Search Console** (simplest once Google is verified), or add the site with its `msvalidate.01` token in `SEARCH_VERIFICATION.bing`.
2. Submit the sitemap.

**Domains**

In Vercel → Domains, add `www.teranga-tech.com` to the project as a **redirect to teranga-tech.com with status 308** (permanent).

**LinkedIn company page**

Create or claim "Teranga Technologies" with:
- the same name;
- the website URL;
- Dakar, Senegal as location;
- the same one-line description as the site.

When it's live, add its URL as `sameAs` in the structured data (a single line in `site/layout.mjs`).

**Directories** (only legitimate ones, with the same name, address line, phone and URL everywhere):
- Google Business Profile, only if customers can visit the Dakar office. It requires a real, verifiable address; otherwise skip;
- Clutch or GoodFirms, if you want reviews; they verify client references, so add them only with real clients' consent;
- Senegalese professional and chamber-of-commerce directories, if you are registered.

**Product credits**

Ask each product owner for a "Designed and built by Teranga Technologies" link back to teranga-tech.com: Radiora and XP already credit Teranga. Credible backlinks from live products are the most legitimate authority signal available.

## 5. Not published, on purpose

No registration number, legal form, certifications, partnerships, client logos, testimonials, ratings or figures. None is documented. Add any of them only with the document or written permission behind it, and record it in the proof register.
