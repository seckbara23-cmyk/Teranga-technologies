# TERANGA-05C — Release report: production assurance, conversion reliability, growth operations

Audience: the owner. Date: 2026-10-24. PR #8, **not merged**. Production is unchanged.

## A. Executive summary

The first real analytics after TERANGA-05B showed the contact form losing requests at the last step: **3 submissions refused by the server**, with no explanation to the visitor and no trace on the server. This release:

- makes the page and the server agree on what is valid;
- removes an autofill trap from the anti-spam field;
- turns a refusal into a correctable field error;
- logs why a request was refused, without logging what was typed.

It also gives the owner a weekly routine to act on leads: who needs a reply, what's overdue, what has gone quiet, and how the website performed that week. It does this from two private command-line reports and the existing tracker, with no CRM, dashboard or new service.

## B. Production baseline (`docs/TERANGA-05C-production-baseline.md`)

- TERANGA-05B is live: deployment `dpl_5hfXE787P3vGT2cPnRq4cChDXw7t` READY at merge `8394100`; served files **19/19 byte-identical** to the release.
- HTTP **51/52**: the only failure was the `.vercel.app` root answering 200; fixed here.
- Production browser suite **38/38** (submissions mocked); axe 0 violations.
- ScolaTech, XP and the no-fixed-timeline wording are confirmed. Private paths 404; security headers present; no errors in the logs.
- `www` → 307 (owner action).

## C. Conversion funnel (`docs/TERANGA-05C-funnel-audit.md`)

The funnel runs: visitor → service interest → form start → friction → accepted → delivered → qualified → outcome. Each stage is mapped to its system: Vercel, the server log, Resend, or the tracker.

Measurable today:
- page views, pages, referrers and language;
- the 8 events;
- accepted leads, with their attribution, response time, pipeline and outcomes.

Not measurable, and labelled so:
- per-visitor journeys (by design);
- exact visitor-to-lead conversion (two systems, not joined);
- campaign breakdown of page views (needs Web Analytics Plus);
- delivery status inside the reports (Resend dashboard).

## D. Implemented improvements (`docs/TERANGA-05C-conversion-plan.md`)

| | Before | After |
|---|---|---|
| Email rule | Page looser than server | Identical (parity test) |
| Anti-spam field | `website`, autofill-prone | `tt_hp`, "Leave this field empty", password-manager ignore hints; API unchanged |
| Server refusal | Dead-end "couldn't send" for any 400 | Field marked, message, focus; honeypot stays generic |
| Diagnostics | None | `Lead rejected {"reason":…}`, category only. Seen on the preview: `email`, `honeypot` |
| Confirmation | Reference | Reference + "We will reply to <address>" |
| Budget | Not asked | Invited in the message hint; no new field |
| `.vercel.app` root | 200 | 308 to teranga-tech.com (rule `/(.*)`), verifiable after merge |

## E. Lead operations (`docs/TERANGA-05C-lead-operations.md`)

The 8 stages are read from the existing statuses and date columns, with no new status. The routine covers:
- owner per lead;
- a next action and its date on every open lead;
- first reply within one business day (flagged after 24 h);
- proposal 5 business days after the call;
- 3 follow-ups, then `LOST`;
- 14-day silence check.

`lead-report.mjs` prints "Actions this week": replies due, overdue next actions, missing next steps, stale leads, open leads by owner, stage counts and discovery calls held.

## F. Growth reporting (`docs/TERANGA-05C-growth-reporting.md`)

Monday routine:
- `analytics-report.mjs --json`;
- `lead-report.mjs --analytics`;
- Resend and log checks.

Available: acquisition (page views, visitors, top pages, referrers, EN/FR, devices); engagement (CTA by service and location, case studies, form starts, validation fields, failure reasons); leads (by service, source, channel, entry page; qualified, discovery, proposals, won); operations (awaiting reply, median and average reply, overdue, qualification rate).

Unavailable: UTM breakdown of page views (402 on this plan); Search Console data (not set up); revenue (never summed).

First real run: 34 page views, 3 visitors, EN/FR 28/6. The UTM query came back as unavailable, not as zero.

## G. SEO readiness (owner checklist §5)

Not verified: there is no TXT record and no verification tag, and nothing is claimed. The checklist covers:
- Domain property via DNS TXT;
- sitemap submission;
- indexing requests for `/` and `/fr`;
- Bing import;
- a 30-minute monthly assessment (performance EN/FR, queries and pages, indexing against the 14 sitemap URLs, Bing, link to leads).

## H. Security and privacy

Preserved unchanged:
- server validation and sanitisation (`clean()` untouched);
- the 32 KB limit;
- the rate limit (5 per 10 minutes, Vercel-reported IP);
- CSP; generic error answers; secret isolation (environment names checked, values never read);
- the 8 events with ≤2 properties and no personal data;
- no cookies or new trackers; no public tracker; private files not deployed.

New: `private/` is ignored by git and Vercel, for exports and reports.

| Phase I test | Covered by |
|---|---|
| Duplicate submissions | Unit: same request delivered once; concurrent copies wait; different requests both delivered. Browser (local): double click sends one request; resubmission shows the same reference |
| Repeated CTA clicks | Browser: double click counted once |
| Analytics failure | Browser: provider throwing on every call blocks neither navigation nor the form |
| Submission errors | Browser: 503, network, 429, 400, timeout → honest error, input kept, pre-filled fallback; field-level refusal (EN/FR) |
| Missing optional attribution | Unit: absent fields left out, channel `direct`; browser: direct visit labelled direct |
| Malformed input | Unit: malformed JSON 400, non-object body, >32 KB 413, markup/URLs in attribution, line breaks, spreadsheet formulas, errors never echo input |
| Email provider failure | Unit: rejection → 502 (not retried), transient → one retry with the same idempotency key, hang cut off, missing settings → 503. Browser (local): Resend rejection → 502, then delivered after recovery |
| Mobile connectivity | Browser: aborted request (EN/FR); **new:** stalled request at 375 px abandoned after 15 s → `timeout`, input kept, button usable |

Risks, all low:
- A field-level 400 tells a script which field failed. That's the same information the page shows; the honeypot answer stays generic.
- A bot that fills only a field named `website` no longer trips the honeypot. Bots that fill every input, or post `website` to the API, still do; validation and rate limits are unchanged. Watch the `honeypot` count in the logs and `SPAM` rows.

## I. Tests and accessibility

| Suite | Result |
|---|---|
| `npm test` (node:test) | **102/102**: 99 at the first commit and 102 at each later commit, each checked on its own |
| Browser suite, local (real Resend SDK against a local fake API) | **50/50**: the 6 new 05C form checks and the new connectivity check |
| Browser suite, preview (every submission mocked) | **45/45**: the 5 delivery checks need the local fake API. axe-core WCAG 2.2 A/AA: **0 violations** on 14 pages × 375/768/1180/1440 px plus the confirmation state |
| Preview HTTP checks | **20/20**. Served files identical to the branch; the root page also carries Vercel's preview-only toolbar tag after `</html>`. Headers; preview `noindex`; trailing-slash redirects; 15 private paths 404; form markup EN/FR; shared email rule; `GET` 405; invalid email → 400 `field: email`; honeypot → 400 without a field (both refused, nothing sent) |
| Preview analytics | `check-analytics`: script 200 on 5 pages, custom events on |
| html-validate | 0 errors |
| ESLint | 1 finding, pre-existing and intended: `no-control-regex` in `clean()`, which strips control characters |

Lighthouse 12.2.1, mobile. The preview blocks only Vercel's toolbar.

| Page | Perf prod / prev | A11y | BP | SEO prod / prev | LCP prod / prev | TBT prod / prev | CLS | Weight |
|---|---|---|---|---|---|---|---|---|
| `/` | 95 / 95 | 100 | 100 | 100 / 0* | 2.12 / 2.43 s | 232 / 81 ms | 0 | 192 → 193 KB |
| `/contact` | 97 / 99 | 100 | 100 | 100 / 0* | 1.84 / 2.25 s | 75 / 30 ms | 0 | 151 KB |
| `/fr/contact` | 97 / 96 | 100 | 100 | 100 / 0* | 1.78 / 2.26 s | 69 / 67 ms | 0 | 151 → 152 KB |

\* The preview fails only `is-crawlable`: Vercel's preview `noindex`, as intended. LCP on the preview is 0.3–0.5 s higher; that's the preview-environment offset measured since TERANGA-05A.

Required regression areas (Phase J):

| # | Area | Evidence |
|---|---|---|
| 1 | EN/FR parity | Unit: same content structure, no empty French; same message keys; generator freshness |
| 2 | Navigation | Unit: header links and current page; every internal link and fragment. Browser: 6 links EN/FR, 14 pages, 404 |
| 3 | Form validation | Unit: required fields, honeypot, bounds; browser/server email parity. Browser: empty submit; 05C refusal and pre-send checks |
| 4 | CTA preselection | Unit: standard wording and service. Browser: 15 service-aware CTAs |
| 5 | Event names | Unit: schema equals the taxonomy. Browser: all 8 events |
| 6 | Event privacy | Unit: no personal data, ≤2 properties. Browser: nothing typed reaches events or the vendor queue |
| 7 | Lead references | Unit: dated format; deduplication returns the same reference. Browser: same reference on screen and in the notification |
| 8 | Submission success and failure | Unit: 200/502/503 paths. Browser: mocked 200, 503, network, 429, 400, timeout; local Resend rejection and recovery |
| 9 | Attribution | Unit: allow-list, bounds, untrusted input, server-side channel. Browser (local): campaign, referral, direct |
| 10 | Lead reporting | 9 report tests: parsing, funnel, rates, operations, analytics merge, analytics report with unavailable ≠ 0, sample freshness, references only |
| 11 | SEO metadata | Unit: language, one h1, titles and descriptions, canonical, hreflang, OG. Lighthouse SEO 100 (production) |
| 12 | Structured data | Unit: one valid graph per indexable page, describing only what it shows |
| 13 | Sitemap and redirects | Unit: sitemap = canonical URLs with alternates; host redirect matches `/`, `/work`, `/fr/services`, `/favicon.ico`. Preview: trailing-slash 308 |
| 14 | Mobile navigation | Browser: mobile menu; 375 px layout with no overflow |
| 15 | Keyboard | Browser: menu by keyboard with focus return; focus to the first invalid field, the refused field, the confirmation heading |
| 16 | WCAG 2.2 AA | axe 0 violations (56 page-width combinations + confirmation); Lighthouse accessibility 100 |
| 17 | No private data exposed | Unit: ignore lists incl. `private/`; no Resend key in browser code; reports print references only. Preview: 15 private paths 404 |
| 18 | No fixed timeline | Unit: no week-range promise |
| 19 | ScolaTech | Unit: "formerly EduSen", own URL, current screenshot |
| 20 | XP attribution | Unit: "for XP Client Consulting"; no native-app claim |

Failures found during the sprint, and their fixes:
- The analytics CLI fallback broke on `&` under Windows: now runs the CLI without a shell.
- Report sorting and spacing.
- A future discovery date was counted as held.
- A handler test hit the rate limit (correctly): it now uses one IP per case.
- A confirmation test anchor was outdated.

None remain.

## J. GitHub

- Branch `feat/teranga-05c-conversion-growth`, from `origin/master` `8394100`.
- Commits:
  - `9dc6fac` fix(contact);
  - `335aba3` feat(reporting);
  - `3d8e876` docs;
  - plus this report (docs only).
- PR **#8** against `master`, open and mergeable. CI on `3d8e876`: `test` ✅, Vercel ✅.

## K. Vercel

- Preview `dpl_3KuFQWSUgqkWxtT7BUnccW1JVHMA`, `teranga-technologies-1ms7nlci1-seckbara23-6470s-projects.vercel.app` (protected), **READY**, commit `3d8e876` = branch head at test time. The report commit adds docs only, which aren't deployed.
- Production unchanged: `dpl_5hfXE787P3vGT2cPnRq4cChDXw7t` at `8394100`.

## L. Owner decisions

In `docs/TERANGA-05C-owner-checklist.md`:

1. Approve or decline the merge of PR #8.
2. Were the 3 refused submissions on 2026-10-24 (10:00–11:00 UTC, SaaS) yours?
3. Approve a time for the one controlled production email test (§2).
4. Make `www` a 308.
5. Search Console and Bing.
6. Later: a budget field (after about 20 inquiries), Web Analytics Plus, DMARC.

The open 05B items (permissions, office line, mailbox) are unchanged.

## M. Release verdict: **GO** for the owner's merge decision

The changes are small, covered by tests at three levels and verified on the preview. They change no design, event, limit or email routing. Production keeps working if the PR is not merged.

- **Production merged:** NO
- **Production deployment changed:** NO
- **Verified improvements**, on the preview, code and tests:
  - field-level refusal, shown and focused (EN/FR);
  - email-rule parity;
  - honeypot renamed with the API contract intact;
  - rejection logs with category only;
  - reply address on the confirmation;
  - budget hint;
  - stalled-connection handling;
  - weekly analytics report (real production data) and follow-up actions (synthetic tracker).
- **Unverified assumptions:**
  - the cause of the 3 refusals (autofill or email rule) is inferred, not proven;
  - that the changes increase completed inquiries is a hypothesis, to be read from `lead_submit_failure` and "Lead rejected";
  - the `.vercel.app` root redirect can only be observed in production (preview hosts don't match the host rule; the same pattern already works there for headers);
  - production email delivery to Gmail was not tested in this sprint.
- **Remaining blockers:** none technical. Merge needs the owner's explicit approval.

After merge:
1. Deployment READY at the merge SHA.
2. `curl -sI https://teranga-technologies.vercel.app/` → 308 to `https://teranga-tech.com/`.
3. `/contact` serves `tt_hp`.
4. An invalid-email `POST` → 400 with `field`, and the log shows `Lead rejected`.
5. If approved, the controlled email test.
