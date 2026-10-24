# TERANGA-05C — Conversion plan

Audience: the owner and the maintainer. Changes are kept only where there is a clear reason and a way to check the result. The design, the CTAs (TERANGA-05A) and the positioning (TERANGA-05B) are unchanged.

## 1. Journey review (four buyers)

| Buyer | Path today | Friction found | Action |
|---|---|---|---|
| Funded startup | Home → "Who we work with" → SaaS → "Discuss your SaaS project" → form (SaaS preselected) | None structural; at the last step the form could refuse a valid-looking request with no explanation | §2 |
| Growing SME | Home → Web applications / AI → service CTA → form | Same last-step risk. Budget is the usual qualification gap; asking for it in a field adds friction | §2, §3 |
| Established organisation | AI Engineering → "Discuss your AI project" → form | Same last-step risk | §2 |
| International buyer | Home (EN) / About → header CTA → form | Same; a mistyped address means a lost lead that nobody notices | §2, §4 |

Not friction (checked): one H1 and a clear CTA per page; service preselection works on all 15 service-aware CTAs (EN and FR, browser suite); mobile shows the form first on the contact page; the 7-field form (4 required) is already short; next steps are stated next to the form; there are no popups or chat widgets.

## 2. The server could refuse what the page accepted — fixed

**Evidence:** 3 production rejections on 2026-10-24 with no explanation to the visitor (production baseline, finding 2).

| Before | After |
|---|---|
| The page allowed `< > " ' ,` in an email; the server refused them | The page uses the server's exact rule; a test compares both on 11 samples |
| The hidden anti-spam field was named `website` with a "Website" label, a name autofill and password managers may fill, making a real person look like a bot | Renamed `tt_hp` with a "Leave this field empty" label and password-manager ignore hints. The API still receives it as `website`, so the server contract is unchanged |
| Any 400 showed "We couldn't send your request…" plus email/WhatsApp links: a dead end, because resending fails the same way | The server answers `{ message, field }` for its 5 field checks. For name, email, service and message the page marks that field, shows its localized message, focuses it and says "Please check the highlighted field, then send again." The honeypot answer still has no field (no hint for bots). The fallback is kept for every other failure, including timeline, a fixed list that fails only if the request was tampered with |
| Rejections left no trace on the server | Log line `[Teranga] Lead rejected {"reason":"email","lang":"en","deployment":"production"}`: the category only, never the values |

**Hypothesis:** valid inquiries are no longer lost at submission.

**Check:**
- `lead_submit_failure` with reason `rejected` should fall to about zero;
- the "Lead rejected" log reasons show what remains (honeypot = bots).

## 3. Budget, without a budget field

Earlier sprints left the budget range open: the currency and ranges are the owner's decision.

| Option | Benefit | Friction risk |
|---|---|---|
| Required budget select | Strong qualification | High: early-stage buyers often don't know, and the currency (XOF / EUR / USD) is ambiguous for international buyers |
| Optional budget select | Medium | Medium: one more decision; needs owner-chosen ranges and currency |
| **Prompt in the message hint (chosen)** | Buyers who have a budget usually mention it | None: no new field |

The message hint is now: "A few sentences is enough: the problem, who it is for, any deadline and, if you have one, a budget range." FR: "… l'échéance éventuelle et, si vous en avez une, une fourchette de budget."

**Revisit** after about 20 real inquiries. If most lack a budget and that slows qualification, add an optional select once the owner picks the ranges.

## 4. Show the reply address on the confirmation

The confirmation now adds "We will reply to **name@company.com**" ("Nous vous répondrons à …"). The address comes from what the visitor typed, in their own browser only; it isn't stored or sent anywhere new.

**Hypothesis:** a mistyped address is noticed and the request resent, instead of a lead silently lost.

**Check:** hard to measure directly. Watch for replies that bounce (the tracker's "Lost reason": "no reply") falling.

## 5. Considered and not done

| Idea | Why not |
|---|---|
| Phone field | Contact by email is the workflow; WhatsApp and phone are already shown; less personal data |
| Company website / LinkedIn field | Useful for research, but it's more data and friction; buyers often include it in the message |
| Sticky mobile CTA, exit popup, chat widget | Intrusive; against the premium direction; the brief excludes them |
| Contextual "You're asking about …" banner when a service is preselected | The preselected service is already visible in the form |
| More analytics events | The 8 events already cover the funnel; changing them would break week-to-week comparability |

## 6. Root redirect on the `.vercel.app` host

Fixed in `vercel.json` (production baseline, finding 1). This is an SEO hygiene fix, not a conversion change.
