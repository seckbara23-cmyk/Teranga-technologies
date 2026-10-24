# TERANGA-05C — Owner checklist

Audience: the owner. These are actions outside the code: accounts, DNS, approvals. Nothing here was done for you. Steps already written in earlier docs are referenced, not repeated.

## 1. This release

| # | Action | Why |
|---|---|---|
| 1.1 | Review and approve (or not) merging the TERANGA-05C PR | Nothing reaches production without your approval |
| 1.2 | Answer: on 2026-10-24 between 10:00 and 11:00 UTC, did you (or someone testing) submit the contact form three times with service SaaS, and was browser autofill or a password manager used? | 3 submissions were refused by the server (production baseline, finding 2). Your answer tells us whether a real prospect was lost. 05C fixes both likely causes either way |
| 1.3 | After merge, check `https://teranga-technologies.vercel.app/` redirects with **308** to `https://teranga-tech.com/` | The 05C redirect fix can only be observed in production |

## 2. Email: what is proven, and the controlled test

Five different facts. Each needs its own evidence:

| Fact | Evidence | Status (2026-10-24) |
|---|---|---|
| Sending domain verified in Resend | Resend → Domains: `teranga-tech.com` **Verified**; DNS `resend._domainkey` (DKIM) and `send` (return path) resolve | DNS records resolve (checked today). "Verified" was reported by you in TERANGA-03; this session can't read Resend |
| Production has the settings | `RESEND_API_KEY` (Sensitive), `RESEND_FROM_EMAIL`, `LEAD_NOTIFICATION_EMAIL` for Production | Present for Production and Preview (names and targets checked today; values not read) |
| Form acceptance | The visitor sees the confirmation with a reference (HTTP 200) | Proven on preview and locally; in production only the refusal path was exercised (no live submission in this sprint) |
| Resend acceptance | Vercel → Logs: `Lead accepted by Resend` with the reference and a Resend id | One production line on 2026-10-23 00:15 UTC (before 05B). Acceptance isn't delivery |
| Delivery and inbound mailbox | Resend → Emails: **Delivered** for that id; the message in the Gmail inbox (not spam) with the same reference | **Not verified** in this sprint |

The domain itself can't receive mail (no MX record), so the notifications keep going to Gmail. Moving to `contact@teranga-tech.com` needs a mailbox first: `docs/TERANGA-05B-brand-credibility.md` §3.

**Controlled production test.** It needs your approval and a time you name. Run it once, after the merge:

1. Open `https://teranga-tech.com/contact` in a normal browser window.
2. Fill in:
   - Name: `TERANGA-05C controlled test`;
   - Email: an address **you** control (not a prospect's, and ideally not the notification inbox, so Reply-To can be checked);
   - Company: `Teranga Technologies (test)`;
   - any service;
   - Message: `TERANGA-05C controlled test, not a lead. <date and time>`.
3. Send **once**. Don't resend:
   - an identical copy within 10 minutes is usually recognised and not sent again, but this is best effort (per server instance);
   - a changed message is a new request and sends a second email.
4. Record:
   - the reference shown;
   - that the confirmation shows your address;
   - Vercel → Logs → `/api/contact`: `Lead accepted by Resend` with the same reference;
   - Resend → Emails: status **Delivered**;
   - Gmail: the notification in the inbox (check spam), same reference; Gmail ⋮ → Show original: **SPF: PASS** and **DKIM: PASS** for `teranga-tech.com`;
   - Reply in Gmail: the recipient shown is your test address.
5. Paste the tracker row, then set it to `SPAM` (or delete it) so it isn't counted.

Don't put the reference into the repository: it's public.

## 3. Domain

- Vercel → Domains: add `www.teranga-tech.com` to the project as a **redirect to `teranga-tech.com`, 308**. Today it's a 307.

## 4. Weekly email check (2 minutes)

- Resend → Emails: nothing Bounced or Failed. If something did, find the reference in Vercel → Logs.
- Included in the Monday routine (`docs/TERANGA-05C-growth-reporting.md` §2).

## 5. Search Console and Bing

**Status: not set up.** There is no verification TXT record on `teranga-tech.com`, and no verification tag in the pages (`SEARCH_VERIFICATION` is empty in `site/config.mjs`). Nothing is claimed as verified.

One-time setup: `docs/TERANGA-05B-brand-credibility.md` §4. In short:

1. Add the Google **Domain** property → TXT record in Vercel DNS → Verify.
2. Submit `https://teranga-tech.com/sitemap.xml`.
3. Request indexing of `/` and `/fr`.
4. In Bing Webmaster Tools, **Import from Google Search Console**.

The DNS step is yours: this sprint changed no DNS.

**Monthly assessment (30 minutes, first Monday of the month, from the second month after setup)**

Write five lines into `private/seo-YYYY-MM.md`:

1. **Performance** (Search Console, last 28 days against the previous 28):
   - clicks, impressions, CTR, average position;
   - then filtered by page containing `/fr`, for the French share.
2. **Queries and pages:** the top 10 queries and landing pages. Mark which match the topics in `docs/TERANGA-05B-search-strategy.md`. Only real queries from the report: no assumed volumes or rankings.
3. **Indexing** (Indexing → Pages):
   - indexed pages against the 14 in the sitemap;
   - reasons for any not indexed ("Alternate page with proper canonical tag" is expected for duplicates; anything else is a task);
   - the sitemap status "Success".
4. **Bing:** the same three, from Search Performance and Site Explorer.
5. **Business link:**
   - Vercel referrers `google.com` / `bing.com` (weekly report);
   - leads whose Source is a search engine (tracker "By source");
   - one action for next month.

## 6. Decisions still open from TERANGA-05B

Unchanged: `docs/TERANGA-05B-brand-credibility.md` §2b:
- Radiora, SunuPermis, CMS permissions;
- code-ownership wording;
- payment integrations;
- office address;
- domain mailbox;
- Search Console;
- `www` redirect.

## 7. Optional, later

| Option | Benefit | Cost or risk |
|---|---|---|
| Optional budget field on the form | Faster qualification | One more field; needs your ranges and currency. Revisit after about 20 real inquiries (conversion plan §3) |
| Web Analytics Plus | Campaign (UTM) breakdown of page views in the weekly report | Paid add-on. Campaign tags of leads are already in the tracker |
| DMARC record (`_dmarc` TXT, `p=none` first) | Better deliverability evidence and spoofing reports | DNS change; yours to make (TERANGA-03 §6) |
