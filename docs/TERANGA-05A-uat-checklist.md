# TERANGA-05A — Owner acceptance checklist

Audience: the owner, before approving the merge. About 30 minutes. Use the preview link from the pull request (Vercel bot comment or the release report). Work on a phone for at least sections A–C.

Rules: do not submit the form with a real prospect's details. Sections D–F include **one** labelled test submission. That is optional, and only if you authorise sending it to your inbox. Every preview submission is marked `[TEST · preview]` automatically.

## A. Calls to action (EN and FR)

- [ ] Header button reads **Discuss your project** (EN) / **Parlons de votre projet** (FR), on a phone and on a computer.
- [ ] Services: each section's button names its service ("Discuss your SaaS project" … / "Parlons de votre projet SaaS" …). Each opens the contact form with that service already selected.
- [ ] Work: "Discuss a similar project" / "Parlons d'un projet similaire" opens the form with the right service. "Visit …" opens the live product in a new tab.
- [ ] AI Engineering: the closing button reads "Discuss your AI project" / "Parlons de votre projet IA" and preselects AI.
- [ ] The wording reads naturally to you in both languages. Note any phrase to change: ______________________

## B. Form behaviour (no submission needed)

- [ ] Submit the empty form: four fields are flagged in the page language and the cursor goes to the first.
- [ ] Below the button: "How we handle your information" / "Comment nous traitons vos données" opens the privacy page in the same language.
- [ ] Switch language while the form is half filled: what you typed is still there.

## C. Privacy page

- [ ] Footer → Privacy / Confidentialité opens `/privacy` or `/fr/privacy`.
- [ ] Read both versions. Confirm or correct:
  - [ ] the contact email for privacy requests;
  - [ ] the processors (Vercel, Resend, Google): add any other tool you use for leads;
  - [ ] the retention practice: "delete at most 12 months after the last exchange unless we work together, sooner if asked". Will you apply it?
  - [ ] whether a legal entity name should appear under "Who we are";
  - [ ] whether to seek advice on the consent question (`docs/TERANGA-05A-privacy-security.md` §2) and on a CDP declaration.
- [ ] The analytics paragraph is acceptable (it is shown because the Web Analytics script is on).

## D. Confirmation and reference (optional live test, one submission)

Only if you authorise one test email to `LEAD_NOTIFICATION_EMAIL`:

1. Open the preview with campaign tags, e.g. `<preview>/services?utm_source=uat&utm_medium=owner&utm_campaign=teranga05a` (add the share parameter if the preview asks for login).
2. Click "Discuss your SaaS project".
3. Fill the form with your own name and email. Message: `TERANGA-05A UAT test — not a lead`.
4. Submit.

- [ ] The page shows "Thank you. Your project inquiry has been received. We aim to respond within one business day." with **Your reference** `TT-…`.
- [ ] The keyboard focus moved to "Thank you."; "Send another request" brings back an empty form.
- [ ] Gmail: a notification `[TEST · preview] New Teranga Technologies Inquiry — SaaS development — … · TT-…` with the **same** reference (check Spam).
- [ ] The email has an **Attribution** section: Channel "Campaign (UTM tags)", Source `uat`, Medium `owner`, Campaign `teranga05a`, Entry page `/services`, Conversion page `/contact`.
- [ ] Resend → Emails shows it as **Delivered**.

## E. Tracker (5 minutes)

- [ ] Create the private sheet with the header row from `docs/TERANGA-05A-lead-operations.md` §3.
- [ ] Paste the "Lead tracker row" from the test email into row 2: the cells fill Reference … Status (`NEW`). If they land in one cell, note it here so the format can be adjusted: ______________
- [ ] Change Status to `SPAM` (it is a test), or delete the row.

## F. Report

- [ ] In the repository folder: `node scripts/lead-report.mjs docs/samples/lead-tracker-sample.csv --visitors 1840`. A Markdown report prints. This uses the synthetic sample: the numbers are fictional.
- [ ] Optional: export your sheet as CSV and run the same command on it.

## G. Analytics (release gate)

- [ ] Vercel → project `teranga-technologies` → **Analytics** → **Enable** Web Analytics. Hobby plan: free within 50,000 events a month, shared with your other Vercel projects.
- [ ] Ask for the preview to be redeployed (or redeploy it from Vercel), then open `<preview>/_vercel/insights/script.js`: it must load (HTTP 200), not the 404 page.
- [ ] After browsing a few preview pages, Vercel → Analytics shows page views (filter environment: Preview).
- [ ] Decision: stay on Hobby (page views only; events stay in the page) or move to Pro to record the conversion events: ______________
- [ ] If you prefer not to enable analytics now: ask for `webAnalytics: false` before merging (the privacy page then drops its analytics section).

## H. Approval

- [ ] Production stays unchanged until you merge. Merging `feat/teranga-05a-conversion-measurement` into `master` deploys to production.
- [ ] After merging: one labelled production test (message `TERANGA-05A production check`), then confirm Delivered in Resend and the page views in Vercel Analytics.

Approved by: ______________ Date: ______________ Notes: ______________
