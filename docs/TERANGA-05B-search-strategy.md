# TERANGA-05B — Search strategy and keyword map

Audience: the owner and whoever writes for the site. Goal: qualified inbound inquiries from buyers who already need software, not traffic volume.

**No keyword data was available for this work:** no Search Console data, no keyword tool. Every term below is a **qualitative hypothesis** from the service offering, the audiences and how buyers phrase needs. There are no search volumes, rankings or difficulty scores. Validate with Search Console queries once the site is verified (§5).

## 1. Audiences and what they search for

| Audience | Situation | Likely intent | Language |
|---|---|---|---|
| Funded startups | Need an MVP or a first product team | "SaaS development company", "MVP development", "développement MVP" | EN, FR |
| Growing SMEs (Senegal, francophone West Africa) | Operations on spreadsheets, manual steps | "logiciel de gestion sur mesure", "application web sur mesure Dakar", "automatisation des processus" | Mostly FR |
| Established organisations | Modernise workflows, add AI without risk | "AI integration services", "intégration IA entreprise", "modernisation de logiciels" | FR, EN |
| International companies | Reliable engineering partner in Senegal / West Africa | "software development company Senegal", "software engineers Dakar", "West Africa software development partner" | EN |

Navigational brand searches ("Teranga Technologies", "Teranga Tech") are served by the home page and the consistent name in structured data.

## 2. Keyword-to-page map

Titles and descriptions below are the implemented ones (EN / FR). Characters: titles ≤ 70, descriptions 80–170 (test-enforced).

### Home (`/`, `/fr`)

| | |
|---|---|
| Intent | Brand plus "who can build my software in Dakar / Senegal" |
| Main topic | Custom software and AI engineering, Dakar |
| Supporting terms | custom software development Dakar · software development company Senegal · SaaS platforms · AI integration · logiciels sur mesure · entreprise de développement logiciel Dakar · intégration de l'IA |
| Audience | All four segments (new "Who we work with" section) |
| Title | EN "Teranga Technologies — Custom software & AI engineering in Dakar"; FR "Teranga Technologies — logiciels sur mesure et IA à Dakar" |
| Description | EN "Custom software, SaaS platforms and AI integration for startups, growing SMEs and established organisations. Engineered in Dakar, Senegal, in French or English."; FR equivalent |
| CTA | Discuss your project / Parlons de votre projet |
| Internal links | Capabilities → Services sections; audience cards → SaaS, Web applications, AI Engineering, About; Work → case studies |

### Services (`/services`, `/fr/services`)

| | |
|---|---|
| Intent | Commercial: "which services, how they work" |
| Main topic | Software development services |
| Supporting terms | SaaS development · AI integration and automation · custom web application development · mobile app development · website design and development · software maintenance · legacy system modernisation · développement logiciel sur mesure · développement d'applications web · développement d'applications mobiles · maintenance applicative |
| Title | EN "Software development services — SaaS, AI, web & mobile \| Teranga"; FR "Développement logiciel sur mesure : SaaS, IA, web, mobile \| Teranga" |
| Description | EN "Custom software development from Dakar: SaaS products, AI integration and automation, web and mobile applications, websites and ongoing support." |
| On-page | Each section heading now contains the service name (e.g. "SaaS development. Launch a SaaS product…"); one `Service` node per section in structured data; "Modernising a legacy system one workflow at a time" and "Automating repetitive back-office steps" added as typical uses |
| CTA | Service-specific CTAs that preselect the service (unchanged) |
| Internal links | AI section → AI Engineering; case studies → matching service CTA |

### AI Engineering (`/ai-engineering`, `/fr/ai-engineering`)

| | |
|---|---|
| Intent | Commercial and informational: "how to use AI in my business safely" |
| Main topic | AI integration and business process automation |
| Supporting terms | AI integration services · AI automation for business · document processing AI · AI-assisted reporting · human-in-the-loop · intégration de l'IA en entreprise · automatisation des processus métier · traitement automatique de documents |
| Title | EN "AI integration and process automation for businesses \| Teranga"; FR "Intégration de l'IA et automatisation des processus \| Teranga" |
| CTA | Discuss your AI project / Parlons de votre projet IA (preselects AI) |
| Internal links | Radiora example → Work#radiora |

### Work (`/work`, `/fr/work`)

| | |
|---|---|
| Intent | Validation: "have they built something like mine?" |
| Main topic | Software and AI case studies |
| Supporting terms | software case studies · AI healthcare software · school management software Senegal · logiciel de gestion scolaire · compte rendu radiologique IA |
| Title | EN "Our work — software and AI case studies \| Teranga Technologies"; FR "Réalisations — études de cas logiciels et IA \| Teranga Technologies" |
| CTA | Discuss a similar project (preselects the matching service) |

### About (`/about`, `/fr/about`)

| | |
|---|---|
| Intent | Trust: "who are they, where, how do they work" |
| Supporting terms | software engineering partner Dakar · Senegal software company · partenaire d'ingénierie logicielle |
| Title | EN "About Teranga Technologies — software engineering partner in Dakar"; FR unchanged |

### Contact (`/contact`, `/fr/contact`)

Unchanged ("request a discovery call" / "demander un appel découverte"): high-intent visitors arrive here from CTAs, and its job is conversion, not discovery.

### Privacy

Indexable for transparency; no keyword targeting.

## 3. What not to do

- No pages per city or keyword with near-duplicate text ("software company Thiès", "… Abidjan"). Thin pages hurt quality signals.
- No keyword lists in footers or hidden text.
- No claims written to rank ("best", "leading", "n°1"); a test blocks several of these.

## 4. Next content opportunities (owner decision; each needs real material)

1. **Case studies with measured outcomes:** the strongest possible page for "built something like mine". Needs client permission and numbers (`docs/case-studies.md` has a measurement plan).
2. **One service page per main offer** (SaaS development, AI integration) once there is enough specific, non-duplicated material for each: process, deliverables, examples, FAQs.
3. **Practical articles from real work** (e.g. "How we keep AI drafts under human control in radiology reporting"), only where the content is first-hand.
4. **French-first content for West African SMEs** (e.g. integrating Wave / Orange Money payments), after confirming delivered experience (proof register §3).

## 5. Measuring it (once Search Console is set up)

- Search Console → Performance: queries and pages per language. Check whether the hypotheses in §1 actually bring impressions, then rewrite titles toward the queries that do.
- Leads, the source of truth (TERANGA-05A tracker): channel and entry page per lead. Organic search shows up as "referral" from google.* / bing.* hosts.
- Review monthly with the lead report. Judge by qualified leads, not clicks.
