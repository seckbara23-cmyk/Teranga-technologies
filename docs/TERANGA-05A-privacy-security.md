# TERANGA-05A — Privacy and security review

Audience: the owner, and any adviser reviewing the site's data handling. This is an engineering review, not legal advice. Items marked **Owner / legal review** need a decision outside engineering.

## 1. Data inventory

| Data | Collected by | Where it ends up | Purpose | Retention |
|---|---|---|---|---|
| Name, work email, company (optional), service, timeline (optional), message | Contact form, only when the visitor submits | Resend (notification transit and logs), Gmail inbox | Reply to the request | Our practice: ≤ 12 months after the last exchange unless a client; earlier on request (privacy page) |
| Language, entry page, conversion page, `utm_*` tags, referring host, channel | Browser (session), sent with the form only | Same notification; tracker row (without name/email/message) | Know which pages and campaigns bring inquiries | Same as the lead |
| Lead reference, received time | Server | Notification, tracker, Vercel function log line (with Resend id, deployment, sender domain, recipient count, attempts, channel) | Trace a lead end to end | Vercel log retention (plan-dependent) |
| IP address | Vercel (every request) | In-memory rate-limit map (≤ 10 min, per instance); Vercel's platform logs | Abuse protection | Map: minutes; platform: Vercel's policy |
| Page views: path (with any campaign tags), referring host, country, device, OS, browser | Vercel Web Analytics script, **only once enabled** | Vercel | Aggregated audience statistics | Vercel's policy for the plan |
| Conversion events (§ taxonomy) | `main.js` | The page only; Vercel only if custom events are enabled (Pro) | Funnel diagnostics | As above |

Not collected: cookies, fingerprints, cross-site identifiers, persistent visitor profiles, full referrer URLs, form contents in analytics, the lead reference in analytics.

## 2. Browser storage

| Key | Storage | Content | Lifetime | Why |
|---|---|---|---|---|
| `tt-lang` | localStorage | `en` or `fr` | Until cleared | Remember the visitor's language choice (requested by the visitor) |
| `tt-src` | sessionStorage | UTM tags, referring host, entry path | Tab session | Attribute a lead sent from another page |
| `tt-hop` | sessionStorage | `1`, removed on the next page | One page load | Keep attribution across the site's own language redirect |
| `tt-draft` | sessionStorage | Unsent form fields | Until the next page reads it (immediately) | Keep what the visitor typed when they switch language |

No cookies are set by the site or by Vercel Web Analytics.

**Owner / legal review — consent.** The analytics are cookieless and first-party, and attribution is session-only, carries no identifier and leaves the browser only inside a form the visitor chooses to send. All of this is disclosed on the privacy page, so no consent banner was added. Two regimes may still call for one:
- Senegal's Law 2008-12, overseen by the CDP.
- For visitors in the EU, the ePrivacy rule on storing information on a device. It exempts strictly necessary storage. Some regulators also exempt audience measurement that meets strict conditions.

If a review concludes that consent is needed for `tt-src`, there are two options:
- (a) Remove session storage for attribution: the form then reports only the campaign tags and referrer of the page it is sent from.
- (b) Add a consent choice.

Option (a) is a small change in `visitSource()`.

## 3. Privacy disclosures

The new privacy page (`/privacy`, `/fr/privacy`), linked from every footer and the form, states in plain language:
- who we are and how to reach us;
- what the form collects, and the attribution context sent with it;
- why it is used (reply; aggregated understanding of what brings inquiries; no marketing emails from the form; no sale);
- processors (Vercel hosting and IP for delivery and abuse protection; Resend for the notification; Google for the inbox) and that they may process data outside Senegal;
- analytics (section shown only while the analytics script is on), browser storage, retention and rights (see, correct, delete by email; the CDP in Senegal).

It makes no claim of legal compliance and no certification. Its retention is worded as "our practice".

**Owner / legal review:**
1. Confirm the 12-month retention practice and that the inbox owner applies it.
2. Confirm the processors list (add any tool you use for leads, e.g. a CRM, if adopted).
3. Decide whether a registered business name or legal entity should appear under "Who we are".
4. Decide whether a declaration to the CDP is required for this processing.

## 4. Security controls

| Threat | Control | Where | Test |
|---|---|---|---|
| Oversized or slow-parse bodies | 32 KB cap: `Content-Length` checked before parsing, string bodies measured; 413 with a generic message | `api/contact.js` | `handler.test.js` "oversized requests…" |
| Malformed JSON | Parse in `try`; 400 "Invalid JSON." | `api/contact.js` | "JSON sent as a string…" |
| Flooding | 5 requests per 10 min per IP per instance; 429 with `Retry-After` | `api/contact.js` | "the sixth request…" |
| Rate-limit bypass with a forged `X-Forwarded-For` | Client IP from `x-vercel-forwarded-for`, then `x-real-ip` (set by Vercel, not by the client), then `x-forwarded-for` (other hosts) | `api/contact.js` | "the address set by Vercel wins…", "a forged x-forwarded-for…" |
| Bots | Hidden honeypot field; server rejects when filled | form + `validate()` | "rejects honeypot…" |
| Email header injection | Single-line fields flattened; strict email pattern rejects `\r\n`, `,`, `<`, `>`; Reply-To is the validated address | `validate()` | "rejects missing or invalid…", "flattens line breaks…" |
| HTML injection in the notification | Every visitor value HTML-escaped; no remote images or scripts | `buildEmail()` | "notification escapes visitor HTML…", "complete branded document…" |
| Injection through attribution | String-only, allow-listed keys, markup characters stripped, bounded lengths, host-only referrer, path-only pages, server-computed channel | `cleanAttribution()` | "keeps only allow-listed…", "attribution is untrusted…", "the channel is decided by the server…" |
| Spreadsheet formula injection via the tracker row | Cells starting `= + - @` prefixed with `'`; tabs and line breaks removed | `tsvCell()` | "tracker cells cannot…" |
| Sensitive referrer URLs | Only the host is read in the browser and only a valid host is kept on the server | `main.js`, `cleanHost()` | Browser suite "a referral keeps only the referring host" |
| PII in analytics | Schema with patterns; no free text, no reference | `EVENTS` in `main.js` | "the event schema … carries no personal data", browser suite "nothing the visitor typed reaches the events" |
| Error disclosure | Generic messages; only field-validation messages are specific; no stack traces; no input echoed | `api/_lib/contact.js` | "error answers are generic…", "missing Resend settings…" |
| Secrets | `RESEND_API_KEY` only in Vercel environment variables (Sensitive); never in code, pages or `main.js`; logs never print it | config | "no Resend key … reaches browser code" |
| Private data published by mistake | No server-side store; tracker lives in a private sheet; `docs/`, `scripts/`, `tests/`, `site/` excluded from deployments; samples are synthetic | `.vercelignore` | "deployment serves clean URLs and keeps internal and source files private" |
| Script injection in pages | CSP `script-src 'self'`, no inline scripts/styles/handlers; Web Analytics is same-origin | `vercel.json` | "pages work under the Content-Security-Policy" |
| Caching of responses | `Cache-Control: no-store` on the API | `api/contact.js` | "GET is refused…" |
| Duplicate notifications | Idempotency key per submission; 10-minute duplicate guard; in-flight requests wait | `handleSubmission()` | duplicate tests |
| False success | Confirmation only on 2xx; 2xx only after Resend accepted | `main.js`, `deliver()` | site test "confirmation panel…", browser suite failure paths |

## 5. Residual risks

| Risk | Level | Mitigation / owner action |
|---|---|---|
| Rate limit and duplicate guard are per instance | Low (current volume) | Add a Vercel Firewall rate-limit rule on `POST /api/contact` |
| Lead personal data sits in Gmail and Resend | Inherent | 2-step verification on the Google and Resend accounts; apply the retention practice |
| Attribution can be forged | Low impact | Bounded, labelled "as reported by the visitor's browser"; never used for anything but reporting |
| Analytics blocked by some browsers | Accepted | Leads are counted from the tracker |
| Analytics script answers 404 until Web Analytics is enabled | Low (console error only) | Owner release gate (architecture §4) |
| `no-control-regex` lint finding in `clean()` | None (intentional pattern that strips control characters, present on master) | Keep; it is the sanitiser |
