# TERANGA-05C — Weekly growth report

Audience: the owner. Two private command-line reports, with no dashboard and no new service:

- `scripts/analytics-report.mjs`: website figures from Vercel Web Analytics (read-only API; production only).
- `scripts/lead-report.mjs`: leads, pipeline and follow-ups from the private tracker export. With `--analytics`, it adds the week's website engagement.

Neither prints a name, company, email or message, and neither is deployed with the site.

## 1. One-time setup

- Node.js 20 or later, and the repository folder.
- Access to Vercel analytics, one of:
  - the Vercel CLI, logged in (`npm i -g vercel`, then `vercel login`); the script uses its login;
  - or a Vercel token in the `VERCEL_TOKEN` environment variable for the session. The script only reads from it, and never prints or saves it. Create it in Vercel → Account Settings → Tokens, scoped to the team, with a short expiry. Vercel tokens can't be made read-only, so treat it like a password and never store it in the repository.
- Create a `private/` folder in the repository folder. Git and Vercel ignore it.

## 2. Every Monday (10 minutes)

Use the previous Monday → Sunday (UTC dates).

```
node scripts/analytics-report.mjs --from 2026-10-26 --to 2026-11-01 --json private/week.json > private/website-2026-10-26.md
```

Download the tracker as CSV to `private/teranga-leads.csv`, then:

```
node scripts/lead-report.mjs private/teranga-leads.csv --from 2026-10-26 --to 2026-11-01 --analytics private/week.json > private/leads-2026-10-26.md
```

In Windows PowerShell 5, replace `> file` with `| Out-File -Encoding utf8 file`. Its `>` writes UTF-16, which garbles the report. Git Bash, cmd and PowerShell 7 are fine as written.

Read the two files, then do the "Actions this week" list (`docs/TERANGA-05C-lead-operations.md` §4). Then check two things by hand:

- Resend → Emails: every notification **Delivered**, none Bounced;
- if `lead_submit_failure` is above zero, Vercel → Logs → filter `/api/contact`: "Lead rejected" names the check that failed; "Lead email failed" means a delivery problem.

Delete the CSV export afterwards. Keep the reports with your business documents if you want a history.

For a **monthly** view, run both with the month's first and last day, and drop `--analytics` if you didn't produce a month file. The lead figures need at least a month to settle (open leads are still moving).

## 3. What the report contains, and from where

| Section | Metric | Source | Available |
|---|---|---|---|
| Acquisition | Page views; visitors | Vercel | Yes. Visitors as Vercel counts them; ad blockers hide some |
| | Top pages (views, visitors) | Vercel | Yes. These are pages viewed; Vercel's API has no entry-page dimension. **Entry pages of leads** are in the tracker ("By entry page") |
| | Referring sites | Vercel | Yes. Hostname only; empty = direct or none |
| | English / French | Vercel | Yes, page views on `/fr…` against the rest |
| | Device type | Vercel | Yes (in `--json`) |
| | Campaigns (utm_source) for page views | Vercel | **No**: needs Web Analytics Plus (paid). Campaign tags of **leads** are in the tracker ("By channel / source") |
| Engagement | Service CTA clicks (by service, by location) | Vercel events | Yes |
| | Case-study clicks (by project) | Vercel events | Yes |
| | Contact-form starts | Vercel events | Yes |
| | Validation errors (by field list) | Vercel events | Yes |
| | Submission failures (by reason) | Vercel events | Yes; details in the Vercel logs |
| Leads | Accepted inquiries (spam excluded); by service, language, channel, source, entry page | Tracker | Yes |
| | Qualified; discovery calls held; proposals; won | Tracker | Yes, as recorded |
| Operations | Awaiting first reply; overdue next actions; missing next steps; stale leads; by owner | Tracker | Yes, as of the run |
| | First reply: median, average, within 24 h | Tracker | Where "First reply (UTC)" is filled |
| | Qualification rate (lead → opportunity) | Tracker | Yes: same system, reliable denominator |
| Cross-system | Leads per 100 visitors; form completion | Tracker ÷ Vercel | **Indicative** and labelled "not joined" |
| Not reported | Revenue | — | The tracker's "Estimated value" is a proposal figure, never summed as revenue |
| | Search queries, impressions, positions | Search Console | Not set up yet (owner checklist §5) |
| | Delivery status | Resend dashboard | Manual check above |

**Rules the scripts follow:**
- A query that fails is shown as "unavailable", never as zero.
- A rate whose denominator is missing is left blank, never estimated.
- An event is never counted as a lead.

## 4. First real run (2026-10-23 → 2026-10-24, production)

| Measure | Value |
|---|---|
| Page views / visitors | 34 / 3 |
| English / French page views | 28 / 6 |
| Events | `service_cta_click` 3, `contact_form_start` 1, `lead_submit_failure` 3 (rejected) |
| Unavailable | Campaigns: the API answered 402 (needs Web Analytics Plus) |

This was most likely owner and test traffic, and too little to compute meaningful rates. It confirmed that the script reads the live data and labels what the plan doesn't provide.

## 5. Reading the week

- **More CTA clicks for a service, but no inquiries for it:** the service page convinces, the form or offer doesn't. Look at the validation errors and failures that week.
- **Form starts high, accepted leads low:** check validation fields and failure reasons first (that's how the 05C rejection problem was found).
- **French share:** compare FR page views with FR leads (tracker "By language"). A gap suggests FR copy or follow-up issues.
- **Response time:** keep the median under 24 h. A high average with a low median means one or two neglected leads; find them in "Awaiting a first reply" and "No activity".
