# TERANGA-05A — Lead operations: statuses, tracker and reporting

Audience: the owner (and anyone who answers leads). This replaces §2, §6 and §7 of `docs/commercial-operating-guide.md` where they differ. The rest of that guide (qualification criteria, discovery call, proposals, health check) still applies.

## 1. Where a lead comes from

| Source | Record |
|---|---|
| Website form | Notification email "New Teranga Technologies Inquiry — …" with the reference `TT-YYYYMMDD-XXXX`. The visitor saw the same reference on screen |
| Visitor used the email or WhatsApp fallback after a failed submission, or wrote directly | The message in Gmail or WhatsApp. Create the tracker row by hand: reference `MANUAL-YYYYMMDD-1`, Channel `direct` unless they say how they found you |

**The tracker is the record.** A lead is counted once it has a row. Analytics clicks are never leads.

## 2. Statuses

| Status | Meaning | Enter when | Next action | Target |
|---|---|---|---|---|
| **NEW** | Received, not answered | Row pasted from the notification | Read, check it is genuine, reply | Same business day |
| **CONTACTED** | First reply sent | You replied (fill "First reply (UTC)") | Clarify the need, propose 2–3 call slots (Dakar, UTC+0) | First reply within **one business day** |
| **QUALIFIED** | Worth a discovery call | Meets at least four criteria of the operating guide §3; call scheduled or held (fill "Discovery date") | Hold the call, notes in the sheet the same day | — |
| **PROPOSAL** | Written scope and estimate sent | Proposal sent (fill "Proposal date", "Estimated value") | Follow up after 3–5 business days, then weekly, up to 3 times | Proposal within 5 business days of the call |
| **WON** | Signed or deposit received | Contract signed | Kick-off | — |
| **LOST** | Closed without a deal | Declined, silent after 3 follow-ups, or not a fit | Fill "Lost at" (the last stage reached: CONTACTED, QUALIFIED or PROPOSAL) and "Lost reason" (price, timing, scope, no reply, not a fit) | — |
| **SPAM** | Not a real inquiry | Bot text, sales pitch, job request, test you did not send | Nothing; never reply to links in spam | — |

Previous guide statuses map as: REVIEWED → CONTACTED; DISCOVERY → QUALIFIED + "Discovery date".

Preview tests arrive with `[TEST · preview]` in the subject: do not add them to the tracker.

## 3. Tracker set-up (one time, 10 minutes)

Create one Google Sheet named "Teranga leads", shared with no one else (or only with people who answer leads). Do not publish it, do not "share with anyone with the link", and never put it in the website repository.

Row 1, columns A–K exactly as the notification writes them, then the columns you fill by hand:

```
Reference | Submitted (UTC) | Company | Service | Language | Channel | Source | Medium | Campaign | Entry page | Status | First reply (UTC) | Last contact (UTC) | Owner | Next action | Next action date | Lost at | Lost reason | Discovery date | Proposal date | Estimated value | Notes
```

- Format column B and the date columns as plain text. The notification writes `2026-10-23 09:05 UTC` and the report reads the same format, or `YYYY-MM-DD HH:MM`.
- Add a data-validation drop-down on Status: `NEW, CONTACTED, QUALIFIED, PROPOSAL, WON, LOST, SPAM`; and on Lost at: `CONTACTED, QUALIFIED, PROPOSAL`.
- Name and email are deliberately not in the row: they stay in the email. Find the email by searching Gmail for the reference.

## 4. Daily routine (5 minutes per lead)

1. Open the notification. At the bottom, under "Lead tracker row", copy the line below the column names (it is tab-separated).
2. In the sheet, click column A of the first empty row and paste: the cells fill A–K with Status `NEW`. If everything lands in column A, use Data → Split text to columns (separator: detect automatically), or copy the row from the plain-text view of the email (Gmail ⋮ → Show original).
3. Reply from Gmail (Reply-To is the prospect), in the language shown. When sent, set Status `CONTACTED` and "First reply (UTC)".
4. Update Status and the dates as the lead moves. For every open lead keep "Owner" (who follows it up), "Last contact (UTC)", "Next action" and its date filled.

If a cell starts with `'` (for example `'=…`), the notification neutralised a value that could have run as a spreadsheet formula. Leave it as it is.

## 5. Monthly report (10 minutes)

1. Sheet → File → Download → **Comma-separated values (.csv)** (current sheet). Save it outside the repository, e.g. `Downloads/teranga-leads.csv`.
2. Vercel → project → Analytics → set the same period → note **Visitors** (once Web Analytics is enabled) and, when custom events are on, the count of the `contact_form_start` event (Analytics → Events).
3. In the repository folder:

   ```
   node scripts/lead-report.mjs "C:\Users\<you>\Downloads\teranga-leads.csv" --from 2026-11-01 --to 2026-11-30 --visitors 1840 --form-starts 64
   ```

   Add `> report-2026-11.md` to save it, or `--json` for raw figures. Without `--visitors` / `--form-starts`, the rates that need them are left blank, never estimated.
4. Delete the CSV export when done. Keep the report wherever you keep business documents, not in the repository.

The report contains: accepted leads (spam excluded), spam share, qualification rate, open pipeline, won/lost, win rate of decided leads, median first-reply time and share within 24 h, leads and qualified leads per 100 visitors, form-start rate and form completion, the funnel (leads that reached each stage), and breakdowns by channel, source, entry page, service, language and month. Each summary figure names its system: Tracker, Vercel, or "Tracker ÷ Vercel, not joined" when a tracker count is divided by a Vercel count for the same period. Service interest by clicks (`service_cta_click` by service) is read in Vercel → Analytics → Events on Pro. On Hobby, use "By service" (leads), which is the stronger signal anyway. It lists only references for rows that need fixing (unknown status, unreadable date, duplicate), never names or companies.

A synthetic example: `docs/samples/lead-tracker-sample.csv` → `docs/samples/lead-report-sample.md`. All of its rows are fictional and marked as such.

How to read it:
- **Leads per 100 visitors** = leads ÷ visitors × 100 for the period. **Qualified per 100 visitors** is the better signal.
- **Funnel shares** are of all leads in the period. Recent leads may still be moving, so compare periods that are at least a month old.
- **Win rate of decided leads** ignores open leads.
- **By channel / source** tells you which outreach brings qualified leads, not just leads. Tag every outreach link: `https://teranga-tech.com/fr?utm_source=linkedin&utm_medium=social&utm_campaign=saas-q4`.

## 6. Delivery checks

| Signal | Meaning |
|---|---|
| Visitor sees the confirmation with a reference | Resend accepted the notification (HTTP 200). Not yet proof of inbox delivery |
| Gmail has the notification with that reference, and Resend → Emails shows **Delivered** | Delivered |
| Vercel → Logs `/api/contact`: `Lead accepted by Resend` with the `ref` and Resend `id` | Accepted; use it to trace a reference |
| `Lead email failed` / `Lead email not configured` | Not sent. The visitor was shown the email/WhatsApp fallback; check Resend and the environment variables |
| Resend → Emails: Bounced / Complained | The notification to you failed after acceptance: check the recipient mailbox |

Monthly: send one labelled test from the production site (message starting `TERANGA test`) and confirm it end to end, then mark it SPAM or leave it out of the sheet.

## 7. Retention and deletion

- Our stated practice (privacy page): delete a request at most 12 months after the last exchange unless you start working together, and sooner if asked.
- On a deletion request: delete the notification and replies in Gmail, the tracker row (or blank the Company cell and keep the anonymous row for counts), and the WhatsApp thread if any. Reply to confirm within a week.
- Once a month, delete rows (and emails) for LOST or SPAM leads older than 12 months.
- Exports and reports never go into the repository or a public place.
