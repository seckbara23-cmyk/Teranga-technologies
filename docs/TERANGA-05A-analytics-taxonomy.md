# TERANGA-05A — Analytics event taxonomy

Audience: whoever maintains the site's measurement. Source of truth for the code: the `EVENTS` schema in `main.js`. A test (`tests/site.test.js`, "the event schema is the documented taxonomy…") fails if the code and this page disagree on event names.

## 1. Principles

1. **Leads are counted on the server, not from events.** A lead exists when `/api/contact` answered 2xx, which means Resend accepted the notification. Each one has a reference (`TT-YYYYMMDD-XXXX`) and a row in the private tracker. Events describe behaviour around that; they are never a lead count, and a click is never a lead.
2. **No personal data.** Every event and every property is declared in one schema, and each value must match a fixed pattern (service keys, short slugs, field names). Whatever a visitor types (name, email, company, message) cannot pass those patterns. The lead reference is not sent either, so analytics cannot be joined to a person.
3. **One provider.** Vercel Web Analytics (cookieless) for page views; the same events can be forwarded to it when the plan allows custom events. No other tracker is loaded.
4. **Failure-safe.** Measurement code is wrapped so an error can never block navigation or the form.
5. **Deduplicated.** The same event with the same properties within 1 second is dropped (double clicks). A lead success is reported once per reference, even if the visitor resubmits and the server answers "already received".

## 2. Events

Properties are listed in priority order: when forwarding to Vercel, only the first N are sent (N = `ANALYTICS.maxEventProperties`, 2 on Pro, up to 8 with Web Analytics Plus).

| Event | Fires when | Properties (allowed values) | Does not fire when |
|---|---|---|---|
| `service_cta_click` | A discovery CTA that opens the contact form is clicked: header, hero, mobile menu, closing band, service sections, case-study "discuss" buttons | `service`: `saas` `ai` `webapp` `mobile` `webdesign` `support` `other`, or `none` for generic CTAs · `location`: where the CTA sits (`header`, `hero`, `mobile-menu`, `final`, `ai-final`, `svc-saas`, `case-radiora` …) | Plain navigation links (e.g. "Contact" in the menu) |
| `case_study_click` | A link to a case study (`/work#…`) or to a live product is clicked | `project`: `radiora` `edusen` `xp` `sunu` `clinic` · `action`: `open` (case study on the site) or `visit` (live product, new tab) | — |
| `contact_form_start` | First typed character or selection in the form on that page view (focus alone does not count; the hidden anti-spam field is ignored) | `service`: the service selected at that moment, or `none` | Again on the same page view, until "Send another request" resets the form |
| `contact_form_validation_error` | Submit blocked by the browser-side checks | `fields`: invalid field names, comma-separated, in form order, e.g. `email,message` | Server-side rejections (see `lead_submit_failure`) |
| `lead_submit_success` | `/api/contact` answered 2xx, after the confirmation is shown | `service` | Any non-2xx answer, a network error or a timeout; a repeated answer for a reference already reported |
| `lead_submit_failure` | Submission failed; the visitor sees the error with pre-filled email/WhatsApp links | `reason`: `network`, `timeout` (15 s), `rate_limited` (429), `rejected` (other 4xx), `server` (5xx: Resend refused, not configured or unavailable) · `service` | — |
| `whatsapp_click` | Any `https://wa.me/` link is clicked | `location`: `aside` (contact page), `footer`, `dark` (about page), `form-fallback` (after a failed submission), `inline` (link in text) | — |
| `email_click` | Any `mailto:` link is clicked | `location`: as above, plus `final` / `ai-final` (closing band) | — |

Every event in the page also carries `lang` and `page` (page key such as `contact`) and a timestamp. These are kept in the page only; Vercel records the page path itself.

Phone (`tel:`) and language-switch clicks are deliberately not events: they are not in the brief's funnel, and the language choice is visible in page views.

## 3. Funnel built from these events

| Step | Measure | Source |
|---|---|---|
| Visit | Visitors, page views, referrers, UTM tags | Vercel Web Analytics (page views) |
| Interest | `service_cta_click`, `case_study_click` | Events (Pro) |
| Intent | `contact_form_start` | Events (Pro) |
| Friction | `contact_form_validation_error`, `lead_submit_failure` by reason | Events (Pro) |
| Lead | Rows in the tracker (one per accepted notification) | **Server / tracker: the number to report** |
| Direct contact | `whatsapp_click`, `email_click` (intent only: what happens next is in WhatsApp or the inbox, recorded in the tracker if it becomes a lead) | Events (Pro) + tracker |
| Qualified → Won | Tracker statuses | Tracker, `scripts/lead-report.mjs` |

`lead_submit_success` should match the tracker's website rows for the same period. A gap means notifications not recorded in the tracker, or visitors with analytics blocked (ad blockers block `/_vercel/insights` for some visitors). The tracker wins.

## 4. Where events go

The team is on **Pro** (checked 2026-10-23). Pro has no included events: page views and custom events are billed as usage, at $0.03 per 1,000 at the time of writing. Custom events carry 2 properties, or 8 with the Web Analytics Plus add-on.

| Switch | Page views | Events |
|---|---|---|
| `webAnalytics: true`, `customEvents: false` | Yes, on deployments created after Web Analytics was enabled | Kept in the page only (`window.TT.events`, `tt:analytics` DOM event) |
| `webAnalytics: true`, `customEvents: true` | Yes | Also sent to Vercel (`/_vercel/insights/event`) with the first `maxEventProperties` properties. The privacy page then states that actions are recorded |
| `webAnalytics: false` | No script | In the page only |

Automated browsers are ignored by the Vercel script, so tests never add page views or events.

The switches are in `site/config.mjs` (`ANALYTICS`). After changing one, run `npm run generate`, commit the regenerated pages and deploy. With `customEvents: true`, the generator adds `data-va-events="N"` to each page's `<body>`, and `main.js` then queues events for the Vercel script.

## 5. Verifying events

In any browser, on the deployed site:

```js
window.TT.events                      // events of this page view (name, data, lang, page, at)
document.addEventListener('tt:analytics', (e) => console.log(e.detail));
```

Clicks that navigate away clear the list (it lives in the page). To see them, run `window.addEventListener('click', e => e.preventDefault(), true)` first. The automated browser suite does the same.

## 6. Changing the taxonomy

1. Edit `EVENTS` in `main.js`: name in `snake_case`, properties with a strict pattern (never free text), most useful property first.
2. Call `emit('<name>', { … })` where it happens.
3. Update the tables above and the test expectations in `tests/site.test.js`.
4. Run `npm run generate` (the `main.js` cache key changes) and `npm test`.

Never add a property that could carry what a visitor typed, a URL with its query, an email, a reference or an identifier.
