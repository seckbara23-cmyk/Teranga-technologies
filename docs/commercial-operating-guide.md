# Commercial operating guide — website leads

Internal document. **Not deployed** (`docs/` is excluded in `.vercelignore`).
Prepared in TERANGA-02 (2026-10-22). Owner of lead follow-up: **Bara Seck** (backup: [OWNER TO NAME]).

This guide describes how a prospect inquiry from teranga-tech.com reaches Teranga and what happens next. It uses only what already exists: the website form, the inbox it delivers to, WhatsApp and a spreadsheet. No CRM, database or paid tool is required.

---

## 1. The lead flow as built

```
Visitor ── "Request a discovery call" / service CTA ──► form (#contact)
   │
   ├─ POST /api/contact (Vercel function) ── validate ── SMTP ──► inbox set in EMAIL_TO
   │       email subject: [Teranga] Discovery call request — <service> — <company or name> · TT-YYYYMMDD-XXXX
   │       Reply-To: the prospect, so "Reply" answers them directly
   │
   └─ if sending fails (email not configured, provider down, rate limit, network):
          the page says so, keeps the text, and offers email and WhatsApp links
          that open with the request already filled in.

Direct channels on the page: WhatsApp +221 70 715 7070, seckbara23@gmail.com, phone.
```

Each notification email contains:

| Field | Use |
|---|---|
| Reference `TT-YYYYMMDD-XXXX` | Unique ID for the tracker; also in the Vercel log line for that delivery |
| Received (UTC) | Start of the response-time clock |
| Name, email, company (optional) | Who to answer |
| Service, timeline (optional) | First qualification signal |
| Site language | Reply in that language |
| Source | `utm_source / utm_medium / utm_campaign` and referring site, or "Direct or unknown" |
| Message | The problem in the prospect's words |

The form does not ask for budget. Budget is discussed on the discovery call.

### Current status (verified 2026-10-22)

**Email delivery is not operational yet.** The Vercel project has no environment variables, so `/api/contact` cannot send email. On today's live site the contact form returns an error; on the new site the visitor sees the honest error with the pre-filled email/WhatsApp fallback. Until the variables below are set, every website lead depends on the visitor taking that extra step.

### One-time setup (owner, about 10 minutes)

1. On the Google account that will send the notifications, turn on 2-Step Verification, then create an **App password** (Google Account → Security → App passwords). Never use the normal account password.
2. In Vercel → project **teranga-technologies** → Settings → Environment Variables, add each variable for **Production** and **Preview** (mark `EMAIL_PASS` as Sensitive):

   | Variable | Value |
   |---|---|
   | `EMAIL_HOST` | `smtp.gmail.com` |
   | `EMAIL_PORT` | `465` |
   | `EMAIL_SECURE` | `true` |
   | `EMAIL_USER` | the sending Gmail address |
   | `EMAIL_PASS` | the app password |
   | `EMAIL_TO` | the inbox that should receive leads |

3. Redeploy the preview (environment changes apply only to new deployments).
4. **Delivery test:** open the preview link, submit the form with the message `TERANGA-02 delivery test`, and confirm the email arrives in `EMAIL_TO` (check spam too). Note the reference in the subject.
5. In Vercel → Logs, find `[Teranga] Discovery request handed to SMTP` with the same `ref` and `"accepted":1`. That proves the provider accepted it; the inbox proves it arrived.

Later: a domain mailbox (for example `contact@teranga-tech.com`) builds more trust than a Gmail address on a B2B site. When it exists, update the page, the JSON-LD, the fallback links and `EMAIL_TO` together.

---

## 2. Lead lifecycle

| Status | Meaning | Enters when | Owner action | Internal target |
|---|---|---|---|---|
| **NEW** | Received, not yet read | Notification email or WhatsApp/email message arrives | Add a tracker row (reference, received time, source) | Same business day |
| **REVIEWED** | Read and answered | First reply sent | Reply in the prospect's language: thank, ask 1–2 clarifying questions, propose 2–3 call slots (Dakar time, UTC+0) | First reply within **one business day** of Received |
| **QUALIFIED** | Worth a discovery call | Meets the criteria in section 3 | Confirm call time, send agenda | — |
| **DISCOVERY** | Call held | Discovery call done | Write notes in the tracker within 24 h of the call; decide proposal or not | — |
| **PROPOSAL** | Written scope and estimate sent | Proposal sent | Follow up after 3–5 business days, then weekly up to 3 times | Proposal within 5 business days of the call |
| **WON** | Signed or deposit received | Contract signed | Kick-off; move to delivery | — |
| **LOST** | Closed without a deal | Prospect declines, goes silent after 3 follow-ups, or is disqualified | Record the reason (price, timing, scope, no reply, not a fit, spam) | — |

The public site says "We aim to reply within one business day". That is a target, not a guarantee. A firm promise (for example "within 24 hours") should only go back on the site once the owner decides it can be kept every week, including during travel and holidays.

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
- [ ] Notes and next step in the tracker the same day; status DISCOVERY.
- [ ] Decide: proposal (PROPOSAL), a paid scoping sprint (see `docs/growth-assets.md` §4.1), or polite decline (LOST, reason).

## 5. Proposal handoff

A proposal contains: the outcome in the client's words, scope and what is out of scope, milestones with a demo at each, assumptions, the estimate and payment schedule, code ownership as set out in the contract, support after launch, and an expiry date. Package outlines are in `docs/growth-assets.md` §4. Never quote fixed prices or guarantee results on the website or in outreach; quote only in a written proposal after discovery.

---

## 6. Lead tracker (minimum viable)

One Google Sheet (or Excel file) with restricted access, one row per lead:

`Ref · Received (UTC) · Name · Company · Email · Service · Timeline · Language · Source · Status · First reply at · Discovery date · Proposal date · Estimated value · Outcome · Lost reason · Next action · Next action date · Notes`

- Copy the first nine columns from the notification email; all of them are in its plain-text part.
- Use Gmail labels with the same status names if you prefer to work from the inbox; the sheet stays the record for KPIs.
- Privacy: the site tells visitors their details are used only to reply and that they can ask for deletion by email. Honour deletion requests in the inbox and the sheet within a week, and delete rows for leads LOST more than 12 months ago unless there is an ongoing relationship.

If lead volume grows beyond what a sheet handles (roughly more than 30 open leads), choose a CRM then. Do not add one before it is needed.

---

## 7. Conversion measurement

What already works without any analytics tool:
- **Every lead email states its source** (campaign tags or referring site). Use tagged links in outreach, for example `https://teranga-tech.com/?lang=fr&utm_source=linkedin&utm_medium=social&utm_campaign=saas-q4`.
- The tracker gives qualified leads, calls, proposals and wins.

What needs an analytics tool (owner decision): page views, visitors by source and the click-level events already wired in `main.js`:

| Event | When | Data sent (never personal data or message text) |
|---|---|---|
| `cta_click` | Any CTA, including WhatsApp, email and phone links | CTA location, service |
| `form_start` | First focus in the form (once per form) | — |
| `form_invalid` | Submit blocked by validation | Field names only |
| `lead_submitted` | Server confirmed the request | Service |
| `lead_failed` | Sending failed | HTTP status or error type |
| `lead_fallback` | Visitor used the pre-filled email/WhatsApp fallback | Channel |
| `language_switch` | EN/FR button | Language |

Recommended option: **Vercel Web Analytics** (cookieless, same-origin script, works with the site's Content-Security-Policy). Steps: enable it in the Vercel project → Analytics, then add `<script defer src="/_vercel/insights/script.js"></script>` before `main.js` in `index.html`. Do not add the script before enabling it (it would 404). Custom events may require a paid plan; confirm in the dashboard before relying on them. Page views, referrers and UTM parameters are enough to compute the inquiry conversion rate.

Count a conversion once: `lead_submitted` (server confirmed) plus tracker rows from fallback emails/WhatsApp. Do not count `form_start` or `cta_click` as conversions.

---

## 8. KPIs and the first 30 days

No historical figures exist: the live site's main form never delivered a request, so every baseline below starts at zero on release day.

| KPI | Definition | Source |
|---|---|---|
| Inquiries | Website requests (form + fallback) per week | Tracker |
| Qualified inquiries | Leads reaching QUALIFIED per week | Tracker |
| Inquiry conversion rate | Inquiries ÷ unique visitors | Tracker + analytics |
| Lead response time | Median of (First reply at − Received) in business hours | Tracker |
| Discovery conversations | Calls held per month | Tracker |
| Proposal requests | Leads reaching PROPOSAL per month | Tracker |
| Proposal-to-client conversion | WON ÷ proposals decided (WON + LOST after proposal) | Tracker |

30-day plan
- **Day 0 (release day):** SMTP configured and inbox-tested; tracker created; analytics decision taken.
- **Week 1:** answer every lead within one business day; tag every outreach link with UTM parameters; record every lead, including WhatsApp ones that mention the site.
- **Weeks 2–3:** weekly 15-minute review: inquiries, qualified, response time, sources. Fix the biggest leak (for example slow replies or unqualified sources).
- **Day 30:** first baseline: inquiries, qualification rate, median response time, calls, proposals and the top two sources. Decide the targets for the next 60 days from these numbers, not before.

---

## 9. Weekly website health check (10 minutes)

- [ ] Vercel: latest production deployment is READY and is the expected commit.
- [ ] Vercel → Logs / Errors for `/api/contact`: no `Mail send error` or `SMTP not configured` lines.
- [ ] Inbox: last week's leads all have a tracker row and a first reply.
- [ ] Once a month, submit a labelled test (`Monthly delivery test`) and confirm it arrives; delete it from the tracker.
- [ ] Open teranga-tech.com on a phone in EN and FR; the form and WhatsApp link work.
- [ ] Portfolio links still open the right products (Radiora Medical, EduSen/ScolaTech, XP Client Academy, SunuPermis, Clinic Management System).
- [ ] GitHub Actions CI is green on `master`; `npm audit` step passing.
