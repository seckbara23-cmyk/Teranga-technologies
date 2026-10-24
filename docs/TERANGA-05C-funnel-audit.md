# TERANGA-05C — Conversion funnel audit

Audience: the owner and the maintainer. Event definitions are unchanged and remain in `docs/TERANGA-05A-analytics-taxonomy.md`. This document is about **what each stage can and cannot tell you**.

## 1. The funnel and where each stage is measured

| Stage | Signal | System | Exact? |
|---|---|---|---|
| 1. Visitor | Page view, visitor | Vercel Web Analytics | Page views: yes for browsers that load the script (ad blockers hide some). Visitors: Vercel's own count, **not a unique-person count across days or devices** |
| 2. Service interest | `service_cta_click` (service, location), `case_study_click` (project, action) | Vercel events | Counts of clicks, not people |
| 3. CTA → contact | `service_cta_click`, plus page views of `/contact` | Vercel | Clicks and views; **not joined per visitor** |
| 4. Form started | `contact_form_start` (once per page view) | Vercel | Per page view, not per person |
| 5. Friction | `contact_form_validation_error` (fields); `lead_submit_failure` (reason) | Vercel; **server log "Lead rejected" (reason) since 05C** | Yes for categories |
| 6. Inquiry accepted | `lead_submit_success` (event, page-side) and the server's "Lead accepted by Resend" (log, with reference) | Vercel event + **server log (source of truth)** | Server log: exact. Event: misses visitors who block analytics |
| 7. Notification delivered | Resend → Emails status "Delivered"; message in Gmail | Resend dashboard, inbox | Exact, but only visible there (no webhook) |
| 8. Qualified opportunity | Status QUALIFIED in the tracker | Private tracker | As recorded by the owner |
| 9. Sales follow-up and outcome | Discovery date, proposal, WON/LOST | Private tracker | As recorded |

Stages 6 → 7 → 8 → 9 are different facts:
- an accepted request can fail delivery;
- a delivered request can be spam;
- a genuine one may not qualify.

The weekly report keeps them apart (`docs/TERANGA-05C-growth-reporting.md`).

## 2. What can be measured accurately today

- Accepted inquiries (server log and tracker), with reference, service, language, entry page, conversion page and channel per lead.
- Inquiries by service, language, channel, source and entry page (tracker).
- Response time (tracker: Submitted → First reply).
- Qualification, discovery, proposal and win counts (tracker).
- Page views, top pages and the EN/FR split; referring sites; device types (Vercel).
- Interaction counts per event, CTA by service and location, case studies by project, failures by reason (Vercel).

## 3. What cannot be measured, and is labelled as such

| Not available | Why | Instead |
|---|---|---|
| Per-visitor journey (this visitor clicked X, then submitted) | No identifier by design: no cookies, no profiles (privacy page) | Aggregate rates for the same period, labelled "not joined" |
| Exact visitor-to-lead conversion | Visitors (Vercel) and leads (tracker) come from different systems; ad blockers affect only the first | "Leads per 100 visitors" as an indicative ratio |
| Campaign (UTM) breakdown of page views | Vercel UTM dimensions need the paid Web Analytics Plus add-on; the API answers 402 | UTM tags are captured **per lead** in every notification and the tracker |
| Email delivery inside the reports | Resend status is in the Resend dashboard only | Weekly check (owner checklist §4) |
| Why a submission was rejected (before 05C) | The server didn't log rejections | Since 05C: log line "Lead rejected" with the check that failed |

## 4. Findings from the live data (2026-10-23 → 24)

- **Friction at the last step.** 1 form start produced 3 server rejections and 0 successes (production baseline, finding 2). The page and the server disagreed on what is valid, and the page gave no way forward.
  - Two candidate causes:
    - the hidden anti-spam field is named `website`, which autofill may fill;
    - a stricter email rule on the server.
  - Both are fixed in 05C, with tests.
- **Volume is too low for conversion conclusions** (34 page views, 3 visitors, most likely owner and test traffic). Hypotheses in the conversion plan are judged by rates once real traffic arrives; no conversion rate is quoted here.
- Header CTA clicks (2) outnumber service-section CTA clicks (1) in this tiny sample: nothing to act on yet.

## 5. Review cadence

- **Weekly:**
  - the two reports (growth reporting doc);
  - any `lead_submit_failure`: check Vercel → Logs for "Lead rejected" or "Lead email failed";
  - Resend → Emails for delivery.
- **Monthly:**
  - service interest (CTA by service) against inquiries by service: which offers attract clicks but not requests;
  - the Work page's case-study clicks against inquiries mentioning similar projects.
