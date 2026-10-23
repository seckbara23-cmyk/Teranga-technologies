# Commercial operating guide — website leads

Internal document. **Not deployed** (`docs/` is excluded in `.vercelignore`).
Prepared in TERANGA-02, updated for Resend in TERANGA-03 (2026-10-22). Owner of lead follow-up: **Bara Seck** (backup: [OWNER TO NAME]).

This guide describes how a prospect inquiry from teranga-tech.com reaches Teranga and what happens next. It uses only what already exists: the website form, the inbox it delivers to, WhatsApp and a spreadsheet. No CRM, database or paid tool is required.

---

## 1. The lead flow as built

```
Visitor ── "Discuss your project" / service CTA ──► form on /contact (or /fr/contact)
   │
   ├─ POST /api/contact (Vercel function) ── validate ── rate limit ── Resend API ──► LEAD_NOTIFICATION_EMAIL
   │       From:     Teranga Technologies <notifications@teranga-tech.com>   (RESEND_FROM_EMAIL)
   │       To:       seckbara23@gmail.com                                    (LEAD_NOTIFICATION_EMAIL)
   │       Reply-To: the prospect, so "Reply" answers them directly
   │       Subject:  New Teranga Technologies Inquiry — <service> — <company or name> · TT-YYYYMMDD-XXXX
   │
   └─ if sending fails (Resend not configured, domain not verified, provider down, rate limit, network):
          the page says so, keeps the text, and offers email and WhatsApp links
          that open with the request already filled in.

Direct channels on the page: WhatsApp +221 70 715 7070, seckbara23@gmail.com, phone.
```

**Where inquiries arrive:** the Gmail inbox `seckbara23@gmail.com`, from `notifications@teranga-tech.com`. Nothing is stored on the website; the inbox is the record (plus the tracker in §6).

**How to reply:** press Reply. The reply goes to the prospect's address (Reply-To), not to `notifications@`, which cannot receive mail. Reply from the address you want the client to keep using.

**Subjects** (the inquiry type is also a Resend tag `inquiry_type` and the "Inquiry type" / "Submitted from" lines in the body):

| Subject starts with | Comes from |
|---|---|
| `New Teranga Technologies Inquiry —` | The site's discovery-call form (every CTA on the current site) |
| `New Teranga Technologies Contact Message —` | The previous site's contact form, still accepted from pages cached in visitors' browsers; will disappear on its own |
| `[TEST · preview]`, `[TEST · local]` | A submission made on a Vercel preview or a developer machine, with a "not a real lead" banner. Never log these in the tracker |

There is no separate quotation form: the previous site's 6-step quote wizard never sent anything (it only wrote to the browser console) and was replaced by the discovery form in TERANGA-01. A quote request arrives as a discovery request whose message asks for a quote. If you want a distinct "Request a quote" option with a budget range, decide the currency and ranges first (see `docs/TERANGA-03-resend-release.md` §7).

Gmail filters: `subject:("New Teranga Technologies Inquiry")` → label `Leads/Discovery`; `subject:("New Teranga Technologies Contact Message")` → `Leads/Contact`; `subject:("[TEST")` from `notifications@teranga-tech.com` → `Leads/Test`.

Each notification email contains:

| Field | Use |
|---|---|
| Inquiry type | Discovery call request or Contact message |
| Reference `TT-YYYYMMDD-XXXX` | Unique ID for the tracker; also in the Vercel log line for that delivery, next to the Resend email id |
| Received (UTC) | Start of the response-time clock |
| Name, email, company (optional), phone (old form only) | Who to answer |
| Service, timeline (optional) | First qualification signal |
| Site language | Reply in that language |
| Attribution (as reported by the visitor's browser) | Channel (campaign, referral, direct), `utm_*` tags, referring site, entry page and conversion page; absent values left out |
| Lead tracker row | One tab-separated line to paste into the tracker (TERANGA-05A, see §6) |
| Subject (old form only), message | The request in the prospect's words |

Fields the prospect did not fill in are left out, never invented. The form does not ask for budget; budget is discussed on the discovery call.

### How delivery failures are detected

| Where | What to look for |
|---|---|
| The visitor's screen | On any failure the visitor sees "We couldn't send your request…" with pre-filled email/WhatsApp links, so the lead can still reach you directly |
| Vercel → project → Logs (filter `/api/contact`) | `Lead accepted by Resend` (with `ref`, Resend `id`, `deployment`, `fromDomain`, `recipients`, `attempts`) = handed to Resend. `Lead email failed` (with the Resend error name, e.g. `validation_error` 403 = sender domain not verified, `timeout` = Resend did not answer within 4 s twice) or `Lead email not configured: missing …` = not sent |
| Resend → Emails | Status of each message: Delivered, Bounced, Complained, Delayed. **"Accepted by Resend" is not proof of inbox delivery; "Delivered" in Resend plus the message in Gmail is** |
| Gmail | Check Spam during the first weeks; mark the first notification "Not spam" |
| Monthly test (§9) | A labelled test request must arrive end to end |

### Current status (verified 2026-10-22, 23:45 UTC)

- Code: Resend integration on branch `feat/teranga-03-resend-leads`, not yet in production.
- Resend: owner reports `teranga-tech.com` **verified** (region EU West / Ireland). Its records are in Vercel DNS and resolve publicly: DKIM TXT `resend._domainkey`, CNAME `send` (return path, MX + SPF behind it) and CNAME `rsend`. No DMARC record yet.
- Vercel: `RESEND_API_KEY` set for **Preview only** (Sensitive); `RESEND_FROM_EMAIL` and `LEAD_NOTIFICATION_EMAIL` for Production and Preview. **Production still needs `RESEND_API_KEY`** before release.
- Production still serves the pre-TERANGA-01 site (`e52bdd8`) because the Vercel production branch is `main`: see `docs/TERANGA-03-resend-release.md` §2.

### One-time setup (owner, about 20 minutes plus DNS propagation)

1. **Resend account** at resend.com (sign up with the address you want for account alerts). The free plan is enough for website leads; check current limits on resend.com/pricing.
2. **Add the domain:** Resend → Domains → Add domain → `teranga-tech.com`. Choose the region once (it cannot be changed later); `us-east-1` sits next to the Vercel function region (`iad1`).
3. **DNS records:** Resend then shows the exact records to create (typically a DKIM TXT record and, for the bounce/return path, an MX and an SPF TXT record on a `send` sub-name). Copy them **exactly as Resend shows them**: do not retype values from this guide. Add them in Vercel → Domains → `teranga-tech.com` → DNS Records. The zone has no MX or TXT records today, so nothing must be replaced or merged. (Alternatively, send the record list from the Resend screen and they can be added through the Vercel connector after your approval.)
4. **Verify:** Resend → the domain → Verify. Wait until the status is **Verified** (minutes to a few hours).
5. **API key:** Resend → API Keys → Create → permission **Sending access**, domain `teranga-tech.com`. Copy it once.
6. **Vercel:** Settings → Environment Variables → add `RESEND_API_KEY` for **Production and Preview**, type **Sensitive** (Preview is done; Production remains, at release time). Never put the key in the code, in a public/client-side variable, in chat or in email. Do **not** set `RESEND_BASE_URL` (test-only).
7. **Redeploy the preview** of the TERANGA-03 pull request (environment changes apply only to new deployments).
8. **Delivery test:** open the preview link, submit the form with the message `TERANGA-03 delivery test`, then confirm (a) the confirmation with its reference on the page, (b) the email in Gmail (check Spam) from `notifications@teranga-tech.com` with Reply-To set to the address you typed, (c) Resend → Emails shows it as **Delivered**, (d) Vercel → Logs shows `Lead accepted by Resend` with the same `ref`.
9. **Recommended (optional) DMARC record**, once SPF and DKIM pass: TXT `_dmarc` = `v=DMARC1; p=none; rua=mailto:seckbara23@gmail.com`. It only asks receivers for reports; tighten the policy later.

### Changing the recipient later (business mailbox)

When a mailbox such as `contact@teranga-tech.com` exists (it needs MX records from a mail provider; they live alongside Resend's `send` records without conflict):
1. Vercel → Environment Variables → edit `LEAD_NOTIFICATION_EMAIL` (Production and Preview). Up to five addresses, comma-separated, are accepted (for example the business mailbox plus a backup).
2. Redeploy, then send a labelled test.
3. If the public address should change too, update `CONTACT` in `site/config.mjs` and the privacy text in `site/content/*.mjs`, the fallback links in `main.js`, then run `npm run generate` (cache keys update automatically).

No code change is needed to change the recipient.

---

## 2. Lead lifecycle

Statuses since TERANGA-05A: **NEW → CONTACTED → QUALIFIED → PROPOSAL → WON / LOST**, plus **SPAM**. Definitions, entry criteria and targets: `docs/TERANGA-05A-lead-operations.md` §2. Earlier names map as REVIEWED → CONTACTED, and DISCOVERY → QUALIFIED with a discovery date.

The public site says "We aim to respond within one business day". That is a target, not a guarantee. A firm promise (for example "within 24 hours") should only go back on the site once the owner decides it can be kept every week, including during travel and holidays.

---

## 3. Qualification criteria

A lead is **QUALIFIED** when the first reply or the message shows at least four of these:

1. **Need we sell:** SaaS, AI integration, web app, mobile app, web design, or maintenance of something we built or can take over.
2. **A business problem, not just a feature list:** who uses it, what it replaces, what improves.
3. **A decision-maker or a direct line to one** (founder, director, head of operations, product owner).
4. **A timeline:** "as soon as possible" or "within 1–3 / 3–6 months" on the form, or a stated date.
5. **Willingness to pay for professional work** (asked on the call; never assumed from the sector or country).
6. **Language and time zone we can serve** (French or English; Dakar UTC+0).

Disqualify (mark LOST with the reason): spam, job or internship requests, requests for free work, resale of our services, anything illegal or unethical, regulated medical or financial claims we cannot support.

---

## 4. Discovery-call checklist (30 minutes)

Before the call
- [ ] Re-read the request and the source; look at the prospect's website and LinkedIn.
- [ ] Pick the most relevant proof: Radiora Medical (AI with human oversight), EduSen (multi-tenant SaaS), or the "Also built" products.
- [ ] Prepare three questions about the outcome (time saved, revenue, error rate, users), constraints (deadline, existing systems, data) and decision process.
- [ ] Send a calendar invite with a video link and a three-line agenda, in the prospect's language.

During the call
- [ ] Outcome and how they will measure it.
- [ ] Users, current process, systems to integrate (payments such as Wave or Orange Money, WhatsApp, existing databases).
- [ ] Data sensitivity (health, education, personal data) and who must approve.
- [ ] Timeline, budget range, who decides and how.
- [ ] Agree the next step and its date before hanging up.

After the call
- [ ] Notes, next step and discovery date in the tracker the same day (status QUALIFIED).
- [ ] Decide: proposal (PROPOSAL), a paid scoping sprint (see `docs/growth-assets.md` §4.1), or polite decline (LOST, reason).

## 5. Proposal handoff

A proposal contains: the outcome in the client's words, scope and what is out of scope, milestones with a demo at each, assumptions, the estimate and payment schedule, code ownership as set out in the contract, support after launch, and an expiry date. Package outlines are in `docs/growth-assets.md` §4. Never quote fixed prices or guarantee results on the website or in outreach; quote only in a written proposal after discovery.

---

## 6. Lead tracker (minimum viable)

One private Google Sheet, one row per lead, pasted from the "Lead tracker row" at the bottom of each notification. Columns, set-up, daily routine, retention and deletion: `docs/TERANGA-05A-lead-operations.md` §3–§7. Names and email addresses stay in the inbox; the row links to them by reference.

If lead volume grows beyond what a sheet handles (roughly more than 30 open leads), choose a CRM then. Do not add one before it is needed.

---

## 7. Conversion measurement

Since TERANGA-05A:
- **Leads:** the tracker (one row per notification accepted by Resend), reported monthly with `scripts/lead-report.mjs` (`docs/TERANGA-05A-lead-operations.md` §5).
- **Attribution:** every notification states its channel, campaign tags, referring site and entry page. Tag every outreach link, e.g. `https://teranga-tech.com/fr?utm_source=linkedin&utm_medium=social&utm_campaign=saas-q4`.
- **Page views and visitors:** Vercel Web Analytics. The script is in the pages (`ANALYTICS.webAnalytics` in `site/config.mjs`); **enable Web Analytics in Vercel → project → Analytics** before releasing, or the script answers 404.
- **Conversion events:** `service_cta_click`, `case_study_click`, `contact_form_start`, `contact_form_validation_error`, `lead_submit_success`, `lead_submit_failure`, `whatsapp_click`, `email_click` (`docs/TERANGA-05A-analytics-taxonomy.md`). They reach Vercel only on a plan with custom events (Pro) and with `ANALYTICS.customEvents` on.

Count a conversion once, from the tracker. Do not count clicks, form starts or events as leads.

---

## 8. KPIs and the first 30 days

No historical figures exist: the live site's main form never delivered a request, so every baseline below starts at zero on release day.

| KPI | Definition | Source |
|---|---|---|
| Inquiries | Website requests (form + fallback) per week | Tracker |
| Qualified inquiries | Leads reaching QUALIFIED per week | Tracker |
| Inquiry conversion rate | Inquiries ÷ unique visitors | Tracker + analytics |
| Lead response time | Median of (First reply (UTC) − Submitted (UTC)), in hours | Tracker, `scripts/lead-report.mjs` |
| Discovery conversations | Calls held per month | Tracker |
| Proposal requests | Leads reaching PROPOSAL per month | Tracker |
| Proposal-to-client conversion | WON ÷ proposals decided (WON + LOST after proposal) | Tracker |

30-day plan
- **Day 0 (release day):** Resend domain verified, API key set, delivery tested end to end; tracker created; analytics decision taken.
- **Week 1:** answer every lead within one business day; tag every outreach link with UTM parameters; record every lead, including WhatsApp ones that mention the site.
- **Weeks 2–3:** weekly 15-minute review: inquiries, qualified, response time, sources. Fix the biggest leak (for example slow replies or unqualified sources).
- **Day 30:** first baseline: inquiries, qualification rate, median response time, calls, proposals and the top two sources. Decide the targets for the next 60 days from these numbers, not before.

---

## 9. Weekly website health check (10 minutes)

- [ ] Vercel: latest production deployment is READY and is the expected commit.
- [ ] Vercel → Logs / Errors for `/api/contact`: no `Lead email failed` or `Lead email not configured` lines.
- [ ] Resend → Emails: last week's notifications show Delivered (none Bounced or Complained); Resend → Domains: `teranga-tech.com` still Verified.
- [ ] Inbox: last week's leads all have a tracker row and a first reply.
- [ ] Once a month, submit a labelled test (`Monthly delivery test`) and confirm it arrives; delete it from the tracker.
- [ ] Open teranga-tech.com on a phone in EN and FR; the form and WhatsApp link work.
- [ ] Portfolio links still open the right products (Radiora Medical, EduSen/ScolaTech, XP Client Academy, SunuPermis, Clinic Management System).
- [ ] GitHub Actions CI is green on `master`; `npm audit` step passing.
