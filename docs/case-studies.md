# Case studies — EduSen and Radiora Medical

Internal working document. **Not deployed** (`docs/` is excluded in `.vercelignore`).

The website shows only what could be verified on 2026-10-22 from each product's public home page. Everything else below is a placeholder for the owner to fill in **with evidence**. Nothing in the `[OWNER TO VERIFY]` slots may be published until it is confirmed and, where a client is involved, approved in writing.

Rules:
- Demonstrated features (what the product does) and measured outcomes (what changed for a client) are kept separate. The site never mixes them.
- No estimated or projected figures in the outcome slots. Only measured numbers, with the measurement period and method.
- No regulatory, certification or compliance claims (health-data hosting, data-protection approvals, medical-device status) unless a document proves it.
- No client names, logos or quotes without written permission.

---

## 1. Radiora Medical

**Sector:** Healthcare, AI SaaS
**Public URL:** https://radiora.vercel.app (French interface; footer reads "Conçu par Teranga Tech", © Radiora Medical)
**Positioning on the site:** AI-assisted radiology reporting for clinics and imaging centres in Senegal and West Africa.

### Demonstrated features — verified on the public page (2026-10-22)
- Dictation from a computer, a phone (scan a QR code, no app to install) or an imported audio file.
- AI structures free dictation into report sections (Indication, Technique, Résultats, Conclusion) in real time.
- Spoken corrections; free editing before signing.
- Export to PDF or Word; secure, traceable transmission (as stated on the page).
- Per-establishment data isolation and a complete audit trail.
- Templates ("Modèles"), report list, draft status, "Relire et signer" step.
- Explicit human-oversight principle: the AI assists, never diagnoses, never validates or signs; only the radiologist validates and signs.
- 30-day free trial without a card (stated on the page).

### Claims from the previous Teranga site that are NOT visible on the public page
Do not re-publish until confirmed in the live product:
- "Patient explanations" — [OWNER TO VERIFY]
- "Translation" — [OWNER TO VERIFY]
- Broader role system beyond the radiologist (e.g., secretary, admin) — [OWNER TO VERIFY]

### Owner-verification slots
| Field | Value | Evidence / source |
|---|---|---|
| Relationship (Teranga's own product, or built for a client?) | [OWNER TO VERIFY] | |
| Teranga's role (design, build, hosting, ongoing support) | [OWNER TO VERIFY] | |
| Technology stack (public-safe summary) | [OWNER TO VERIFY] | |
| Build timeline (first version to launch) | [OWNER TO VERIFY] | |
| Sites / establishments live | [OWNER TO VERIFY] | |
| Median time from end of dictation to signed report | [OWNER TO VERIFY — measured, with period] | |
| Reports produced per month | [OWNER TO VERIFY] | |
| Share of AI-structured sections accepted without edits | [OWNER TO VERIFY] | |
| Client quote (with written permission) | [OWNER TO VERIFY] | |
| Regulatory / data-protection status | **Do not publish** unless documented | |

### Suggested measurement plan (so outcomes can be published later)
1. Log timestamps: dictation end, draft ready, signed. Report the median and the 90th percentile over a fixed month.
2. Compare with a pre-Radiora baseline measured the same way at the same site (not an estimate).
3. Track edit rate per section (characters changed after AI structuring) as a quality signal.
4. Get the clinic's written approval for any figure or quote before publishing.

### Website copy slot
Replace the "Results" paragraph in `index.html` (comment `OWNER-VERIFY (Radiora)`) and the `case.results.pending` keys in `main.js` only when at least one measured, approved outcome exists. Keep separate EN and FR wording.

---

## 2. EduSen

**Sector:** Education, SaaS
**Public URL:** https://senegal-school-management-system.vercel.app (French interface, locale fr_SN)
**Positioning on the site:** School management SaaS designed for private schools in Senegal.

### Demonstrated features — verified on the public page (2026-10-22)
- Student records with admission numbers; "find a record in seconds".
- Daily digital attendance per class, family notifications, attendance reports.
- Tuition tracking, payment recording and digital receipts.
- Grade entry by subject, automatic averages, end-of-term report cards.
- Messages and alerts to families (absences, results, events).
- Real-time admin dashboard (enrolments, attendance, payments).
- Strict data isolation between schools, robust authentication, logging of every access.
- French interface aligned with Senegalese school conventions.
- Note: the page's dashboard mock-up marks Teachers, Classes and Attendance views as "Bientôt" (coming soon), and invites schools to "join the first establishments" — i.e., early adoption. **The site therefore says "built for schools", not "used by schools".**

### Claims from the previous Teranga site that are NOT visible on the public page
- Parent / teacher / student portals — [OWNER TO VERIFY]
- Exams module — [OWNER TO VERIFY]
- Admissions workflow — [OWNER TO VERIFY]
- Finance beyond tuition tracking — [OWNER TO VERIFY]

### Owner-verification slots
| Field | Value | Evidence / source |
|---|---|---|
| Relationship (Teranga's own product, or built for a client?) | [OWNER TO VERIFY] | |
| Teranga's role | [OWNER TO VERIFY] | |
| Technology stack (public-safe summary) | [OWNER TO VERIFY] | |
| Build timeline | [OWNER TO VERIFY] | |
| Schools onboarded / students managed | [OWNER TO VERIFY] | |
| Time to produce term report cards, before vs after | [OWNER TO VERIFY — measured] | |
| Tuition collection visibility (e.g., days to reconcile) | [OWNER TO VERIFY — measured] | |
| School quote (with written permission) | [OWNER TO VERIFY] | |

---

## 3. Other products kept on the site ("Also built by Teranga")
XP Client Academy, SunuPermis and the Clinic Management System remain listed with their original descriptions and links. Confirm that each can be named publicly (client confidentiality, government context for SunuPermis) — [OWNER TO VERIFY]. Higher-resolution screenshots (at least 1200 px wide) would also improve the case-study images; the current ones are about 440 px wide.
