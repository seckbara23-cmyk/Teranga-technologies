# TERANGA-03 — Resend lead delivery: verification and GO/NO-GO

Branch `feat/teranga-03-resend-leads` (from `master` `d730dcd`) · production untouched.
Verification run: 2026-10-22, 22:55–23:45 UTC. Internal document (not deployed).
Operations and owner setup steps: `docs/commercial-operating-guide.md` §1.

---

## Status dashboard

| Area | Status | Evidence |
|---|---|---|
| Code | 🟢 Ready | Resend integration; 45/45 `npm test`; type check 0 errors; browser suite 34/34 local through the real SDK |
| Security | 🟢 | Key server-side only, never logged; no client exposure on the preview; HTML escaped; 0 npm vulnerabilities |
| Resend | 🔴 **Not connected** | No Resend API key exists in Vercel; domain not added in Resend (owner account) |
| DNS | 🔴 **Records not created** | Vercel DNS zone has no Resend (DKIM/SPF/return-path) records; exact values only come from Resend |
| Real delivery test | ⚪ Not possible yet | Blocked by the two rows above. Preview fails honestly (503 + pre-filled fallback) |
| GitHub | 🟡 | Branch pushed, CI green; PR not opened from this session (no GitHub API access) |
| Vercel preview | 🟢 | `dpl_D11BKhERSxehMjK8fG2f7sRGnNmH`, READY, SHA `d6ab541`; 29/29 browser journeys |
| **Production** | 🔴 **Misconfigured** | Production branch is `main` (does not exist); `master` merges never reach production. Live = `e52bdd8` (pre-TERANGA-01) |

**Verdict: NO-GO** — Resend domain verification and API key are owner actions, and production deployment needs the branch setting fixed with approval.

---

## 1. Discovery (verified)

| Item | Finding |
|---|---|
| TERANGA-02 | PR #2 merged 2026-10-22 22:52 UTC as `d730dcd` (parents `e52bdd8`, `b98848b`); CI "test" success on the merge. PR #1 closed as merged through #2 |
| Production deployment | Still `dpl_H3pSap7rWRnkHLpbQKawwiE7mus6` = `e52bdd8`. The merge built `dpl_2rbFjGjuYXS5EiZMGydQqpWD1th5` as **Preview** (target `null`) |
| Root cause | Vercel project `link.productionBranch` = **`main`**; the repository has only `master`. Every earlier production deployment appeared minutes after a preview of the same commit, i.e. promoted manually |
| Consequence | teranga-tech.com still runs the old site: the 6-step quote wizard that only `console.log`s, the contact form that returns `500 Email service is not configured`, and `/server.js` served publicly (all verified live, 2026-10-22 23:00 UTC) |
| Email code on `master` | nodemailer SMTP (`EMAIL_*`), never configured |
| Vercel environment (before) | 0 variables |
| DNS | `teranga-tech.com` on Vercel DNS (`ns1/ns2.vercel-dns.com`). Records: 3 CAA, 2 ALIAS (Vercel-managed). **No MX, TXT/SPF, DKIM or DMARC** |
| Resend access | No Resend API key anywhere this session can see (Vercel, local `.env` names), no Resend CLI; the Resend connector requires an interactive authorization this session cannot do |
| Branch protection | None on `master` |
| Unrelated work | Five untracked `Pictures/*.png` (owner's) left untouched |

## 2. Production branch: fix before any release

Changing it is a production setting, so it needs owner approval. Options:

1. **Recommended:** Vercel → project `teranga-technologies` → Settings → Git → Production Branch → `master`. From then on, merging a PR into `master` deploys production automatically (the normal GitHub workflow). Note: the next push to `master` will deploy to production, so change it together with the approved merge.
2. Keep promoting manually: after merging, promote the `master` preview in Vercel → Deployments → … → Promote to Production.

TERANGA-02 (`d730dcd`) was approved and merged but is **not live**. Releasing TERANGA-03 also ships TERANGA-01 and -02 for the first time.

## 3. Changes in TERANGA-03

| Commit | Change |
|---|---|
| `3955ecc` feat(contact) | nodemailer → **resend 6.32.1** (newest release > 2 weeks old). Config from `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `LEAD_NOTIFICATION_EMAIL` only; missing/malformed → generic 503 + log naming the variable. Success only when Resend returns an email id. SDK `{ data, error }` handled explicitly; 429/5xx/network/concurrent retried once with the same per-submission idempotency key; 401/403/422/quota not retried → 502. Duplicate submissions (10 min, per instance) reuse the first attempt; "already received" only if it was accepted. Inquiry type (`discovery` / `contact`) in subject, body and Resend tag. Logs: ref, type, service, lang, Resend id or error name/status only |
| `e69edd2` test(site) | Guards: no console logging and no quote-wizard path in `main.js`; the form's inquiry type is accepted by the API; EN/FR success, error and validation messages exist and differ |
| `d6ab541` docs | Operating guide §1 (where leads arrive, replying, failure detection, inquiry types, Resend/DNS/key setup, recipient change), README |
| (this commit) docs | This record |

`main.js`, `index.html` and `style.css` are unchanged: the form already sent `type: 'discovery'`, waited for the server's answer and showed EN/FR success/error states with the pre-filled fallback.

## 4. Security verification

| Check | Result |
|---|---|
| API key exposure | Read only from `process.env` in the function; never logged (unit test asserts the key string is absent from logs); not in any served file (preview `index.html`/`main.js`: 0 matches for key patterns, `RESEND`, `api.resend.com`, `notifications@`); `/api/_lib/contact.js`, `/package.json`, `/.env.example`, `/node_modules/…` → 404 on the preview |
| No hard-coded credentials | No key, sender or recipient default in code; `.env.example` holds placeholders only |
| Sender/recipient injection | `RESEND_FROM_EMAIL` must be `Name <address>` or an address, no CR/LF; recipients validated; visitor email validated (no whitespace, `<>"',`) and used only as `replyTo` |
| HTML injection | Every visitor field escaped in the HTML part (tests with `<script>`, `<img onerror>`, attribute breakout, `javascript:` links); plain-text part provided |
| Header injection | CR/LF stripped from single-line fields; subject is one line; one fixed recipient list; no CC/BCC |
| Abuse | Honeypot; validation; per-IP limit (5 / 10 min per instance, 429 + `Retry-After`); duplicate suppression. Recommended: a Vercel Firewall rate-limit rule on `POST /api/contact` (owner approval) |
| Error disclosure | Public messages are generic (400 field messages, 429, 502, 503); provider details only in server logs |
| Logging | No addresses, names or message text (unit-tested). The SDK's own `[Resend API Error]` console line is emitted only when `NODE_ENV` is not `production` (Vercel sets `production` for Preview and Production) |
| Dependencies | `npm audit`: 0 vulnerabilities (resend 6.32.1 + express 4.22.3 dev server) |
| CORS / headers | Unchanged: no CORS unless `ALLOWED_ORIGIN`; CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy on the preview |

## 5. Tests

| Check | Command / tool | Result |
|---|---|---|
| Syntax | `node --check` ×4 (in `npm test`) | pass |
| Unit + integration | `npm test` (node:test, 45 cases) | **45/45** locally; GitHub Actions run 39870286621 ✅ |
| Mutation checks | Retry-everything, no dedupe, unescaped name, success-on-any-response | each caught by ≥ 1 test |
| Type check | `tsc --noEmit --allowJs --checkJs` against Resend's own type definitions (ad hoc; the repo has no TypeScript) | **0 errors** (send payload, `replyTo`, `tags`, `idempotencyKey` match `resend@6.32.1`) |
| Lint | ESLint 9 `recommended` (ad hoc; the repo has no ESLint config) | 7 style findings, none in new logic: 1 intentional control-character regex (input sanitising), 6 pre-existing unused `catch (e)` bindings in `main.js`/`api/contact.js` |
| Production build | Vercel build of `d6ab541` | READY; 76 packages installed; warnings only (open `engines` range; `memory` ignored under Fluid compute) |
| Browser, local (Chrome + axe-core 4.10; server.js with the **real Resend SDK** pointed at a local fake Resend API) | 34 journeys | **34/34** — see §7 |
| Browser, preview | 29 journeys incl. one real unmocked submission | **29/29** (real submission → 503 + honest pre-filled fallback; 0 axe violations at 4 widths × EN/FR; layout/axe contexts bypass CSP only to inject axe) |
| Dependency audit | `npm audit` | 0 vulnerabilities |
| Real delivery to seckbara23@gmail.com | — | **Not run**: no Resend key/verified domain. Will be run by the owner (guide §1 step 8) |

## 6. Resend and DNS status

| Item | Status | Owner action |
|---|---|---|
| Resend account / domain `teranga-tech.com` | Not visible to this session; assumed not added | Add the domain in Resend (guide §1 steps 1–2) |
| DNS records | **None exist.** Exact DKIM / SPF / return-path values are generated by Resend per domain and are not guessed here | Copy the records Resend shows into Vercel DNS (step 3), or send them for addition via the Vercel connector after approval |
| Existing mail records | No MX, no SPF TXT, no DMARC on `teranga-tech.com`: nothing to merge or replace | — |
| Domain verification | Not started | Verify in Resend; proceed only when it says **Verified** |
| `RESEND_API_KEY` | **Missing** | Create a sending-access key restricted to `teranga-tech.com`; add to Vercel Production + Preview as Sensitive |
| `RESEND_FROM_EMAIL` | Set (Production + Preview): `Teranga Technologies <notifications@teranga-tech.com>` | — |
| `LEAD_NOTIFICATION_EMAIL` | Set (Production + Preview): `seckbara23@gmail.com` | — |
| DMARC | Not present | Optional after verification: `_dmarc` TXT `v=DMARC1; p=none; rua=mailto:seckbara23@gmail.com` |

## 7. Contact form and quotation wizard

| Pathway | Production today (`e52bdd8`) | Release candidate |
|---|---|---|
| Discovery-call form (all CTAs) | Not present | Posts to `/api/contact` with `type: discovery`; success shown only on HTTP 200 after Resend acceptance; honest EN/FR error with pre-filled email/WhatsApp otherwise |
| Previous contact form (cached old pages) | Posts to `/api/contact`, returns 500 | Still accepted → notification typed **Contact message** (legacy service labels, phone and subject kept) |
| 6-step quote wizard | Live, **only `console.log`s the lead** | **Removed** (TERANGA-01). Guarded by a test: no console logging, no `/api/quote`, no wizard markup |

A distinct "Request a quote" option (with budget) is not built: the brief asks for budget only "if supplied", and the currency and ranges are an open owner decision since TERANGA-01. If wanted, it is a small addition to the existing form (new `quote` inquiry type + optional budget field, EN/FR) once the ranges are chosen.

Notification content (both types): inquiry type, reference, received time (UTC), name, email (Reply-To), company/phone/subject if supplied, service, timeline if supplied, interface language, source, message; HTML (escaped) and plain text. Missing fields are omitted, never invented.

Browser evidence (local, real SDK → fake Resend API): discovery request accepted once with `Authorization: Bearer …`, an `Idempotency-Key` of the form `lead/TT-…-uuid`, sender, recipient, Reply-To, inquiry type, reference, source and language checked; double click → 1 request; identical resubmission → success shown, nothing resent; Resend 403 ("domain not verified") → HTTP 502, honest error with pre-filled fallback, nothing recorded as sent; same request after recovery → delivered; FR request delivered tagged French; mocked 503/429/network failures in EN and FR → no false success, input kept; 4 widths × EN/FR layout with 0 axe violations; keyboard, language persistence, reduced motion, no-JS.

## 8. GitHub evidence

| Item | Value |
|---|---|
| Branch | `feat/teranga-03-resend-leads` |
| Commits | `3955ecc`, `e69edd2`, `d6ab541` (+ this record) on top of `d730dcd` |
| CI | GitHub Actions "CI" run 39870286621 on `d6ab541`: success (npm ci, npm test, npm audit); Vercel status success |
| Pull request | **Not opened** — no GitHub API access in this session (GitHub connector 401, no `gh`). Open: https://github.com/seckbara23-cmyk/Teranga-technologies/compare/master...feat/teranga-03-resend-leads?expand=1 |
| Branch protection | None on `master`; recommended: require the "test" check |

## 9. Vercel preview evidence

| Item | Value |
|---|---|
| Deployment | `dpl_D11BKhERSxehMjK8fG2f7sRGnNmH`, target Preview, READY |
| URL | https://teranga-technologies-a1zs74iai-seckbara23-6470s-projects.vercel.app (Vercel login or share link) |
| Git SHA | `d6ab54194f703ce8474b597a3898fc947d84b894` |
| Served files | `main.js` byte-identical to the commit; security headers present (6/6) |
| Hidden paths (404) | `/server.js`, `/.env.example`, `/package.json`, `/package-lock.json`, `/api/_lib/contact.js`, `/tests/…`, `/docs/…`, `/.github/…`, `/node_modules/…` |
| API | `GET` → 405; labelled `example.com` submission → **503** generic (no key yet); `type: "quote"` → 400 |
| Function log | `[Teranga] Lead email not configured: missing RESEND_API_KEY` (23:13:33 and 23:14:21 UTC) — only the key is reported missing, so `RESEND_FROM_EMAIL` and `LEAD_NOTIFICATION_EMAIL` reach the function |
| Browser journeys | 29/29: EN/FR content, 8 service CTAs, 37 anchors, EN/FR validation, real submission, mocked 503/429/network EN/FR, 4 widths × EN/FR layout + axe, keyboard, mobile menu, language persistence, reduced motion, no-JS |

## 10. Production configuration checklist and GO/NO-GO

| # | Gate | Status |
|---|---|---|
| P1 | Resend domain `teranga-tech.com` **Verified** (DKIM + return path records added from Resend) | ❌ owner |
| P2 | `RESEND_API_KEY` (sending access, Sensitive) in Production + Preview | ❌ owner |
| P3 | `RESEND_FROM_EMAIL`, `LEAD_NOTIFICATION_EMAIL` in Production + Preview | ✅ |
| P4 | Preview redeployed after P1–P2; real delivery test arrives in seckbara23@gmail.com and shows **Delivered** in Resend; Vercel log `Lead accepted by Resend` with the same ref | ❌ after P1–P2 |
| P5 | PR opened, reviewed, CI green | 🟡 CI green; PR to open |
| P6 | Vercel production branch set to `master` (or manual promotion agreed) | ❌ owner approval |
| P7 | Explicit owner approval to merge and release (names the merge SHA) | ❌ |
| P8 | Code, security and preview checks | ✅ |
| P9 | Rollback plan | ✅ §11 |

After approval: merge the PR → production deploys from `master` (P6) → confirm READY and `githubCommitSha` = merge SHA → smoke test https://teranga-tech.com (EN/FR, form, one labelled delivery test to the inbox, `/server.js` 404, headers) → check Vercel logs and Resend → Emails.

## 11. Rollback plan

- **Vercel Instant Rollback** to the current production deployment `dpl_H3pSap7rWRnkHLpbQKawwiE7mus6` (`e52bdd8`): Vercel → Deployments → that deployment → Instant Rollback (seconds, no rebuild). Caveat: that version cannot deliver leads either.
- Then `git revert -m 1 <merge SHA>` on `master` so the next deployment does not bring the change back.
- Lighter option if only email fails after release: the site keeps working and shows the pre-filled email/WhatsApp fallback; fix the Resend configuration in Vercel and redeploy, no code rollback needed.
- Environment variables added in TERANGA-03 can be removed in Vercel → Environment Variables; they do nothing on the old code.
