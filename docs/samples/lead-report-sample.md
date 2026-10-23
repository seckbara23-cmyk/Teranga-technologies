<!-- SYNTHETIC SAMPLE: generated with `node scripts/lead-report.mjs docs/samples/lead-tracker-sample.csv --from 2026-09-01 --to 2026-10-31 --visitors 1840`. Fictional rows and visitor count; no real lead or traffic data. -->

# Lead report — 2026-09-01 → 2026-10-31

Source of truth: the private lead tracker (one row per notification accepted by Resend). Analytics events are not counted as leads.

## Summary

| Measure | Value |
| --- | --- |
| Leads (excluding spam) | 10 |
| Spam rows | 2 (16.7% of rows) |
| Open pipeline (NEW → PROPOSAL) | 7 |
| Won | 1 |
| Lost | 2 |
| Win rate of decided leads (WON ÷ (WON + LOST)) | 33.3% |
| First reply, median | 5.6 h over 9 lead(s) |
| First reply within 24 h | 88.9% |
| Visitors (Vercel Web Analytics, entered with --visitors) | 1840 |
| Leads per 100 visitors | 0.54 |
| Qualified leads per 100 visitors | 0.33 |

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
