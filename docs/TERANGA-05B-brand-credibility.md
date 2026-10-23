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
| Project references | Two case studies + three products | Labels corrected; Radiora's verified status shown |
| Testimonials, logos, figures | None | None added (nothing documented) |

## 2. The most important credibility fix: EduSen / ScolaTech

A buyer who clicks "Visit the product" on the EduSen case study lands on a product called **ScolaTech**, with no mention of EduSen or Teranga. That reads as an error, or worse. The fix is the owner's decision:

1. If ScolaTech is EduSen renamed: rename the case study "ScolaTech (formerly EduSen)", link https://scolatech.app, and ideally add a "designed by Teranga" credit on the product.
2. If they are different products: point the EduSen link to the right URL, or remove the "Visit" button until one exists.

Until then the site keeps today's wording, which describes features that match the linked page.

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
