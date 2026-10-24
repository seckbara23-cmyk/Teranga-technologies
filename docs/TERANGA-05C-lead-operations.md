# TERANGA-05C — Lead operations: pipeline and follow-up

Audience: the owner and anyone who answers leads. The tracker, its statuses and columns, the daily paste routine, delivery checks and retention stay as defined in `docs/TERANGA-05A-lead-operations.md`. This document adds the commercial pipeline and the weekly follow-up routine. No CRM, no new system, nothing on the website.

## 1. The pipeline on the existing tracker

The eight stages need **no new status**: they are read from the existing Status and date columns. `scripts/lead-report.mjs` counts them under "Actions this week".

| Stage | Tracker | Moves on when |
|---|---|---|
| New inquiry | Status `NEW`, "First reply (UTC)" empty | You reply → `CONTACTED` + "First reply (UTC)" |
| Needs review | `CONTACTED`: answered, waiting for details or a call slot | Enough to judge fit (operating guide §3) → `QUALIFIED`; or `LOST` / `SPAM` |
| Qualified | `QUALIFIED`, no "Discovery date" today or later | A call is booked → fill "Discovery date" |
| Discovery scheduled | Any open status with "Discovery date" today or later | The call is held (the date passes: counted as **held**) → proposal or `LOST` |
| Proposal sent | `PROPOSAL` + "Proposal date" (+ "Estimated value" if known) | Signed → `WON`; declined or silent after 3 follow-ups → `LOST` |
| Won | `WON` | Kick-off |
| Lost | `LOST` + "Lost at" + "Lost reason" | — |
| Closed as spam or irrelevant | `SPAM` (bots, sales pitches, job requests, untraceable tests) | — |

**Why no new statuses:** the notification pastes `NEW`, the report and existing exports use these seven values, and the dates add what the extra stages need. A "Discovery scheduled" status would also go stale the day after the call. The date does not.

The sample tracker (`docs/samples/lead-tracker-sample.csv`) now contains every column the report reads. A sheet created from the 05A header already has them: `Owner`, `Next action`, `Next action date`, `Discovery date`, `Proposal date`.

## 2. Responsibilities and targets

| Rule | Target | Where it shows |
|---|---|---|
| Every new inquiry gets a first reply | One business day (the website promises it) | "Awaiting a first reply"; flagged after 24 h |
| Every open lead has an **Owner** (the person who follows it up) | From the first reply | "Open leads by owner"; "(unassigned)" means fix it |
| Every open lead except `NEW` has a **Next action** and a **Next action date** | Always | "Open leads without a next action date" |
| A next action is done by its date, or the date is moved deliberately | — | "Overdue next actions" |
| Proposal after the discovery call | 5 business days | Discovery date → Proposal date |
| Proposal follow-ups | After 3–5 business days, then weekly, up to 3 times, then `LOST` (no reply) | Next action date |
| Nothing open goes quiet | Contact at least every 14 days | "No activity for 14+ days" (latest of Last contact, First reply, Submitted) |

The 24-hour flag is calendar time: an inquiry sent on Friday evening shows as overdue on Sunday. Treat it as a reminder; one business day is the commitment.

## 3. Daily (5 minutes, when a notification arrives)

1. **Review.** Is it genuine? Preview tests say `[TEST · preview]` in the subject: skip them. Spam → row with `SPAM`, no reply.
2. **Log it.** Paste the tracker row (05A §4). Set Owner.
3. **Reply** in the visitor's language, from the notification (Reply-To is the prospect). Set `CONTACTED`, "First reply (UTC)", "Last contact (UTC)", a Next action ("Waiting for scope details", "Propose call slots") and its date.

## 4. Weekly (20 minutes, Monday)

1. Export the tracker (File → Download → CSV) to `private/` in the repository folder. It's ignored by git and by Vercel deployments, or keep it anywhere outside the repository.
2. Run the reports (`docs/TERANGA-05C-growth-reporting.md` §2).
3. Work through **"Actions this week"** top to bottom:
   - **Awaiting a first reply**: answer today.
   - **Overdue next actions**: do them, or move the date with a reason in Notes.
   - **Without a next action date**: decide the next step.
   - **No activity for 14+ days**: one follow-up, or close as `LOST` (no reply).
   - **(unassigned)**: give each lead an owner.
4. For calls held this week: notes in the sheet the same day; proposal within 5 business days or `LOST` with a reason.
5. Delete the export when done.

## 5. Outcomes

- **Won:** status `WON` on signature or deposit. Keep "Estimated value" as the proposal's figure. The report never sums it into revenue.
- **Lost:** always fill "Lost at" (the furthest stage: CONTACTED, QUALIFIED or PROPOSAL) and "Lost reason" (price, timing, scope, no reply, not a fit). Monthly, the reasons tell you whether the problem is fit (marketing), price (offer) or follow-up (operations).

## 6. Boundaries

- The tracker, exports and reports are private: never in the repository, the website or a shared link.
- The reports print references only, never names, companies, emails or messages.
- There is no admin page or dashboard, and no visitor profile or identifier links a lead to analytics.
