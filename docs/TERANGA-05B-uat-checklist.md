# TERANGA-05B — Owner acceptance checklist

Audience: the owner, before approving the merge. About 25 minutes on the preview link from the pull request or release report. No form submission is needed: nothing in this release touches the contact form or Resend.

## A. Positioning and copy (EN and FR)

- [ ] Home: the new "Who we work with" / "Avec qui nous travaillons" section (below "Why Teranga") describes your four kinds of buyers accurately.
- [ ] Home hero: the line under the headline and the note below the buttons read naturally to you in both languages.
- [ ] Footer tagline (every page) is acceptable in both languages.
- [ ] Services: each section heading shows the service name above the headline, as before. Two new typical uses: "Modernising a legacy system…" (Web applications) and "Automating repetitive back-office steps…" (AI).
- [ ] AI Engineering: labels now read "Live in Radiora Medical" / "Built into Radiora Medical and EduSen". Correct?
- [ ] Work: "Status and results"; Radiora's status mentions the public 30-day free trial. Correct?

## B. Search results appearance

Titles and descriptions as they may appear in Google (Google can rewrite them):

- [ ] Home: "Teranga Technologies — Custom software & AI engineering in Dakar" / "Teranga Technologies — logiciels sur mesure et IA à Dakar"
- [ ] Services, AI Engineering, Work, About: see `docs/TERANGA-05B-search-strategy.md` §2. Read them and flag anything you would not say to a client: ______________

## C. Proof register decisions (`docs/TERANGA-05B-proof-register.md`)

- [ ] **EduSen / ScolaTech:** rename, relink or explain (brand credibility §2): ______________
- [ ] Relationship for each product: Radiora (own product or client?), EduSen, SunuPermis, CHMS: ______________
- [ ] Permission to name XP Client Academy (a client) and show its screenshot: ______________
- [ ] "MVP typically 4–8 weeks": keep / change / remove: ______________
- [ ] Code ownership wording matches your contract: yes / no
- [ ] Wave / Orange Money / WhatsApp integrations and native iOS/Android apps: delivered before? (keep or reword): ______________
- [ ] Office line "Ngor Almadies, Dakar" is current and should stay public: yes / no

## D. Technical (preview)

- [ ] On a phone: Home, Services, Work in both languages look as before apart from the new section.
- [ ] Browser tab shows the Teranga icon.

## E. After merging (5 minutes)

- [ ] `https://teranga-tech.com/services/` redirects to `https://teranga-tech.com/services`.
- [ ] `https://teranga-technologies.vercel.app/` redirects to `https://teranga-tech.com/`.
- [ ] `node scripts/check-analytics.mjs https://teranga-tech.com` prints OK; Vercel Analytics still shows page views and events.
- [ ] Google Rich Results Test (search.google.com/test/rich-results) on `https://teranga-tech.com/` and `/services`: valid, no errors.

## F. Owner actions outside the website (`docs/TERANGA-05B-brand-credibility.md` §4)

- [ ] Vercel → Domains: `www.teranga-tech.com` as a 308 redirect to `teranga-tech.com`.
- [ ] Google Search Console: Domain property (DNS TXT), submit the sitemap.
- [ ] Bing Webmaster Tools: import from Search Console.
- [ ] LinkedIn company page with the same name, URL and location.
- [ ] Domain mailbox decision (keep Gmail until a mailbox is set up and tested).

Approved by: ______________ Date: ______________
