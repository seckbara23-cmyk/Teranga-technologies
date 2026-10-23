<!-- SYNTHETIC SAMPLE: generated with `node scripts/lead-report.mjs docs/samples/lead-tracker-sample.csv --from 2026-09-01 --to 2026-10-31 --visitors 1840 --form-starts 64`. Fictional rows, visitor and form-start counts; no real lead or traffic data. -->

# Lead report — 2026-09-01 → 2026-10-31

Source of truth: the private lead tracker (one row per notification accepted by Resend). Analytics events are not counted as leads.

## Summary

| Measure | Value | From |
| --- | --- | --- |
| Accepted leads (excluding spam) | 10 | Tracker |
| Spam rows | 2 (16.7% of rows) | Tracker |
| Qualification rate (reached QUALIFIED ÷ leads) | 60% | Tracker |
| Open pipeline (NEW → PROPOSAL) | 7 | Tracker |
| Won | 1 | Tracker |
| Lost | 2 | Tracker |
| Win rate of decided leads (WON ÷ (WON + LOST)) | 33.3% | Tracker |
| First reply, median | 5.6 h over 9 lead(s) | Tracker |
| First reply within 24 h | 88.9% | Tracker |
| Visitors (--visitors) | 1840 | Vercel Web Analytics |
| Contact form starts (--form-starts) | 64 | Vercel events (Pro) |
| Leads per 100 visitors | 0.54 | Tracker ÷ Vercel, not joined |
| Qualified leads per 100 visitors | 0.33 | Tracker ÷ Vercel, not joined |
| Form-start rate (starts ÷ visitors) | 3.5% | Vercel |
| Form completion (leads ÷ form starts) | 15.6% | Tracker ÷ Vercel, not joined |

Rates that divide tracker counts by Vercel counts compare two systems for the same period; they are indicative (ad blockers hide some visits and events from Vercel, never leads from the tracker).

## Funnel (leads that reached each stage)

| Stage | Reached | Share of leads |
| --- | --- | --- |
| NEW | 10 | 100% |
| CONTACTED | 9 | 90% |
| QUALIFIED | 6 | 60% |
| PROPOSAL | 3 | 30% |
| WON | 1 | 10% |

A LOST lead counts as having reached the stage in its "Lost at" column (CONTACTED when empty).

## Where leads come from

### By channel

|  | Leads | Qualified | Won |
| --- | --- | --- | --- |
| campaign | 4 | 4 | 0 |
| direct | 3 | 1 | 0 |
| referral | 3 | 1 | 1 |

### By source

|  | Leads | Qualified | Won |
| --- | --- | --- | --- |
| (not set) | 3 | 1 | 0 |
| linkedin | 2 | 2 | 0 |
| newsletter | 2 | 2 | 0 |
| www.google.com | 2 | 1 | 1 |
| www.facebook.com | 1 | 0 | 0 |

### By entry page

|  | Leads | Qualified | Won |
| --- | --- | --- | --- |
| /fr | 3 | 2 | 0 |
| /services | 2 | 2 | 0 |
| /ai-engineering | 1 | 1 | 0 |
| /fr/ai-engineering | 1 | 1 | 1 |
| /fr/contact | 1 | 0 | 0 |
| /fr/services | 1 | 0 | 0 |
| /fr/work | 1 | 0 | 0 |

## What they ask for

### By service

|  | Leads | Qualified | Won |
| --- | --- | --- | --- |
| Custom web applications | 2 | 2 | 0 |
| Mobile applications | 2 | 1 | 0 |
| SaaS development | 2 | 1 | 0 |
| AI integration | 1 | 1 | 1 |
| AI integration and automation | 1 | 1 | 0 |
| Maintenance and ongoing support | 1 | 0 | 0 |
| Website design and development | 1 | 0 | 0 |

### By language

|  | Leads | Qualified | Won |
| --- | --- | --- | --- |
| FR | 7 | 3 | 1 |
| EN | 3 | 3 | 0 |

### By month

| Month | Leads |
| --- | --- |
| 2026-09 | 5 |
| 2026-10 | 5 |
