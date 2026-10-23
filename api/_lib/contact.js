/* Shared contact / discovery-call logic.
   Used by the Vercel function (api/contact.js) and the local Express server (server.js).
   Files in api/ whose name starts with "_" are not deployed as endpoints.
   Lead notifications are sent with Resend; configuration comes only from server-side
   environment variables (RESEND_API_KEY, RESEND_FROM_EMAIL, LEAD_NOTIFICATION_EMAIL). */

const crypto = require('crypto');
const { Resend } = require('resend');

const SERVICES = {
  saas:      'SaaS development',
  ai:        'AI integration',
  webapp:    'Web applications',
  mobile:    'Mobile applications',
  webdesign: 'Web design',
  support:   'Maintenance and support',
  other:     'Not sure yet',
};

// Labels sent by the previous version of the site (kept so old cached pages still work).
const LEGACY_SERVICES = new Set([
  'Website Development', 'Web Application', 'Mobile App', 'SaaS Product', 'Maintenance & Support',
  'Création de site web', 'Application web', 'Application mobile', 'Produit SaaS', 'Other', 'Autre',
]);

const TIMELINES = {
  'asap':      'As soon as possible',
  '1-3m':      'Within 1–3 months',
  '3-6m':      'Within 3–6 months',
  'exploring': 'Just exploring',
};

// "discovery": the site's discovery-call form. "contact": the previous site's contact form
// (still accepted from cached pages). The type leads the email subject so inbox filters can sort them.
const INQUIRY_TYPES = {
  discovery: 'Discovery call request',
  contact:   'Contact message',
};

const LIMITS = { name: 120, email: 200, company: 160, subject: 200, phone: 40, message: 5000 };

// Attribution sent by the page for the visit: campaign tags, the referring site's host, the entry
// page and the page the form was sent from. All of it is untrusted input: cleaned, bounded, shown to
// the owner and never used for decisions. Anything else in `source` is ignored.
const UTM_LIMITS = { utm_source: 100, utm_medium: 100, utm_campaign: 150, utm_content: 150, utm_term: 150 };
const CHANNELS = { campaign: 'Campaign (UTM tags)', referral: 'Referral', direct: 'Direct or unknown' };

const GENERIC_ERROR = 'Unable to send your request. Please try again later.';

function clean(value, max) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

function oneLine(value, max) {
  return clean(value, max).replace(/[\r\n]+/g, ' ');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidEmail(email) {
  return /^[^\s@<>"',]+@[^\s@<>"',]+\.[^\s@<>"',]{2,}$/.test(email);
}

// Attribution values must be strings: an object or array would otherwise become "[object Object]".
const str = (value) => (typeof value === 'string' ? value : '');

// Free text from campaign tags: one line, no markup-significant characters, bounded.
function cleanTag(value, max) {
  return oneLine(str(value), 1000).replace(/[<>"'`\\]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

// A host name, from a bare host or a URL; validated label by label (no backtracking-prone regex).
function cleanHost(value) {
  let h = oneLine(str(value), 300).toLowerCase();
  if (/^[a-z][a-z0-9+.-]*:\/\//.test(h)) {
    try { h = new URL(h).hostname; } catch { return ''; }
  }
  const labels = h.split('.');
  if (h.length > 253 || labels.length < 2) return '';
  const label = (l) => /^[a-z0-9-]{1,63}$/.test(l) && l[0] !== '-' && l[l.length - 1] !== '-';
  const tld = labels[labels.length - 1];
  return labels.every(label) && (/^[a-z]{2,63}$/.test(tld) || /^xn--[a-z0-9-]{1,59}$/.test(tld)) ? h : '';
}

// A site path such as /services or /fr/contact: no query, fragment or unexpected characters.
function cleanPath(value) {
  const p = oneLine(str(value), 300).split(/[?#]/)[0].toLowerCase();
  return /^\/[a-z0-9/-]{0,79}$/.test(p) && !p.includes('//') ? p : '';
}

/** Validated attribution plus a channel computed here, never taken from the client. */
function cleanAttribution(source, page) {
  const s = source && typeof source === 'object' && !Array.isArray(source) ? source : {};
  const a = {};
  for (const [key, max] of Object.entries(UTM_LIMITS)) {
    const v = cleanTag(s[key], max);
    if (v) a[key] = v;
  }
  const referrer = cleanHost(s.referrer);
  if (referrer && !/(^|\.)teranga-tech\.com$/.test(referrer)) a.referrer = referrer;
  const entry = cleanPath(s.entry);
  if (entry) a.entry = entry;
  const conversion = cleanPath(page);
  if (conversion) a.page = conversion;
  a.channel = Object.keys(UTM_LIMITS).some((k) => a[k]) ? 'campaign' : a.referrer ? 'referral' : 'direct';
  return a;
}

/** Short reference used to track a request from the inbox to the logs, e.g. TT-20261022-3F9A. */
function leadRef(now = new Date()) {
  const day = now.toISOString().slice(0, 10).replace(/-/g, '');
  return `TT-${day}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

/** Validate a request body. Returns { ok, status, message, data }. */
function validate(body) {
  body = body && typeof body === 'object' ? body : {};

  // Honeypot: a filled "website" field means a bot.
  if (clean(body.website, 200)) return { ok: false, status: 400, message: 'Invalid submission.' };

  const data = {
    name:     oneLine(body.name, LIMITS.name),
    email:    oneLine(body.email, LIMITS.email),
    company:  oneLine(body.company, LIMITS.company),
    phone:    oneLine(body.phone, LIMITS.phone),
    subject:  oneLine(body.subject, LIMITS.subject),
    message:  clean(body.message, LIMITS.message),
    service:  oneLine(body.service, 80),
    timeline: oneLine(body.timeline, 20),
    lang:     body.lang === 'fr' ? 'fr' : 'en',
    attribution: cleanAttribution(body.source, body.page),
  };

  if (data.name.length < 2)
    return { ok: false, status: 400, message: 'Name is required (minimum 2 characters).' };
  if (!isValidEmail(data.email))
    return { ok: false, status: 400, message: 'A valid email address is required.' };

  if (SERVICES[data.service]) data.serviceLabel = SERVICES[data.service];
  else if (LEGACY_SERVICES.has(data.service)) data.serviceLabel = data.service;
  else return { ok: false, status: 400, message: 'Please select a valid service.' };

  const type = oneLine(body.type, 20);
  if (type && !INQUIRY_TYPES[type])
    return { ok: false, status: 400, message: 'Invalid inquiry type.' };
  data.type = type || (LEGACY_SERVICES.has(data.service) ? 'contact' : 'discovery');
  data.typeLabel = INQUIRY_TYPES[data.type];

  if (data.timeline && !TIMELINES[data.timeline])
    return { ok: false, status: 400, message: 'Please select a valid timeline.' };
  data.timelineLabel = data.timeline ? TIMELINES[data.timeline] : '';

  if (data.message.length < 10)
    return { ok: false, status: 400, message: 'Message is required (minimum 10 characters).' };

  return { ok: true, status: 200, data };
}

// Where a submission came from. Anything other than production is labelled as a test in the
// subject and the body, so preview or local checks are never mistaken for real leads.
const DEPLOYMENTS = {
  production:  { site: 'teranga-tech.com', test: false },
  unknown:     { site: 'teranga-tech.com (environment not reported)', test: false },
  preview:     { site: 'Vercel preview deployment', test: true },
  development: { site: 'vercel dev', test: true },
  local:       { site: 'local development server', test: true },
};
const FORMS = {
  discovery: 'Website discovery-call form',
  contact:   'Previous website contact form (cached page)',
};

function deploymentOf(env) {
  if (DEPLOYMENTS[env.VERCEL_ENV]) return env.VERCEL_ENV;
  return env.VERCEL ? 'unknown' : 'local';
}

// Lead tracker columns (docs/TERANGA-05A-lead-operations.md); the notification fills the first eleven.
const TRACKER_COLUMNS = ['Reference', 'Submitted (UTC)', 'Company', 'Service', 'Language', 'Channel', 'Source', 'Medium', 'Campaign', 'Entry page', 'Status'];

// One tab-separated cell. A leading = + - @ is neutralised so a pasted value can never run as a
// spreadsheet formula.
function tsvCell(value) {
  const s = String(value == null ? '' : value).replace(/[\t\r\n]+/g, ' ').trim();
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
}

// Source is the utm_source tag or, for a referral, the referring site.
function trackerRow(d, meta, received) {
  const a = d.attribution || { channel: 'direct' };
  return [meta.ref, received, d.company, d.serviceLabel, d.lang === 'fr' ? 'FR' : 'EN', a.channel,
    a.utm_source || a.referrer, a.utm_medium, a.utm_campaign, a.entry, 'NEW'].map(tsvCell).join('\t');
}

function attributionRows(a) {
  return [
    ['Channel', CHANNELS[a.channel] || CHANNELS.direct],
    a.utm_source ? ['Source', a.utm_source] : null,
    a.utm_medium ? ['Medium', a.utm_medium] : null,
    a.utm_campaign ? ['Campaign', a.utm_campaign] : null,
    a.utm_content ? ['Content', a.utm_content] : null,
    a.utm_term ? ['Term', a.utm_term] : null,
    a.referrer ? ['Referrer', a.referrer] : null,
    a.entry ? ['Entry page', a.entry] : null,
    a.page ? ['Conversion page', a.page] : null,
  ].filter(Boolean);
}

function buildEmail(d, meta) {
  const deployment = DEPLOYMENTS[meta.deployment] ? meta.deployment : 'production';
  const where = DEPLOYMENTS[deployment];
  const received = meta.received.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const attribution = attributionRows(d.attribution || { channel: 'direct' });
  const row = trackerRow(d, meta, received);
  const who = d.company || d.name;
  const kind = d.type === 'contact' ? 'Contact Message' : 'Inquiry';
  const submittedFrom = `${FORMS[d.type]} — ${where.site}`;

  const rows = [
    ['Name', escapeHtml(d.name)],
    ['Email', `<a href="mailto:${escapeHtml(d.email)}" style="color:#2251CC">${escapeHtml(d.email)}</a>`],
    d.company ? ['Company', escapeHtml(d.company)] : null,
    d.phone ? ['Phone', escapeHtml(d.phone)] : null,
    ['Service', escapeHtml(d.serviceLabel)],
    d.timelineLabel ? ['Timeline', escapeHtml(d.timelineLabel)] : null,
    ['Inquiry type', escapeHtml(d.typeLabel)],
    ['Submitted', received],
    ['Submitted from', escapeHtml(submittedFrom)],
    ['Language', d.lang === 'fr' ? 'French' : 'English'],
    ['Reference', escapeHtml(meta.ref)],
    d.subject ? ['Subject', escapeHtml(d.subject)] : null,
  ].filter(Boolean);
  const cellLabel = 'padding:6px 12px 6px 0;color:#53627A;width:130px;vertical-align:top';
  const cellValue = 'padding:6px 0;vertical-align:top';
  const table = (list) => list.map(([k, v]) => `<tr><td style="${cellLabel}">${k}</td><td style="${cellValue}">${v}</td></tr>`).join('');

  const font = 'font-family:Arial,Helvetica,sans-serif';
  const preheader = `${d.serviceLabel} — ${who}: ${d.message.replace(/\s+/g, ' ').slice(0, 90)}`;
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(kind)}</title></head>
<body style="margin:0;padding:0;background:#F3F5F8">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F5F8;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#FFFFFF;border:1px solid #D8DEE7;border-radius:10px;${font}">
  <tr><td style="background:#0B1F3A;padding:20px 24px;border-radius:10px 10px 0 0">
    <div style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#F5A524;font-weight:700">Teranga Technologies</div>
    <div style="font-size:20px;line-height:28px;color:#FFFFFF;font-weight:700;margin-top:6px">New ${escapeHtml(kind.toLowerCase())} — ${escapeHtml(d.serviceLabel)}</div>
  </td></tr>
  ${where.test ? `<tr><td style="background:#FFF4DF;color:#7A4B00;padding:10px 24px;font-size:13px;font-weight:700">Test submission from a ${escapeHtml(where.site)} — not a real lead.</td></tr>` : ''}
  <tr><td style="padding:20px 24px 4px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:20px;color:#0B1F3A">
      ${table(rows)}
    </table>
  </td></tr>
  <tr><td style="padding:12px 24px 4px">
    <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#53627A;font-weight:700;margin-bottom:6px">Message</div>
    <div style="background:#F8FAFC;border-left:4px solid #F5A524;padding:12px 14px;font-size:14px;line-height:21px;color:#0B1F3A;white-space:pre-wrap">${escapeHtml(d.message)}</div>
  </td></tr>
  <tr><td style="padding:16px 24px 4px">
    <div style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#53627A;font-weight:700;margin-bottom:6px">Attribution (as reported by the visitor's browser)</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;line-height:19px;color:#0B1F3A">
      ${table(attribution.map(([k, v]) => [k, escapeHtml(v)]))}
    </table>
  </td></tr>
  <tr><td style="padding:16px 24px 20px;font-size:14px;line-height:20px;color:#0B1F3A">Reply to this email to answer ${escapeHtml(d.name)} directly. Target: first reply within one business day.</td></tr>
  <tr><td style="padding:0 24px 18px">
    <div style="font-size:12px;color:#53627A;margin-bottom:4px">Lead tracker row (${escapeHtml(TRACKER_COLUMNS.join(' · '))}):</div>
    <pre style="margin:0;padding:8px 10px;background:#F3F5F8;border-radius:6px;font-size:12px;line-height:17px;white-space:pre;overflow-x:auto">${escapeHtml(row)}</pre>
  </td></tr>
  <tr><td style="padding:12px 24px;background:#F8FAFC;border-top:1px solid #D8DEE7;border-radius:0 0 10px 10px;font-size:12px;line-height:18px;color:#53627A">Sent by the teranga-tech.com website · Reference ${escapeHtml(meta.ref)} · Log it in the lead tracker as NEW.</td></tr>
</table>
</td></tr></table>
</body></html>`;

  const text = [
    where.test ? 'TEST SUBMISSION — not a real lead' : null,
    where.test ? '' : null,
    `New Teranga Technologies ${kind.toLowerCase()} — ${d.serviceLabel}`,
    '',
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    d.company ? `Company: ${d.company}` : null,
    d.phone ? `Phone: ${d.phone}` : null,
    `Service: ${d.serviceLabel}`,
    d.timelineLabel ? `Timeline: ${d.timelineLabel}` : null,
    `Inquiry type: ${d.typeLabel}`,
    `Submitted: ${received}`,
    `Submitted from: ${submittedFrom}`,
    `Language: ${d.lang === 'fr' ? 'French' : 'English'}`,
    `Reference: ${meta.ref}`,
    d.subject ? `Subject: ${d.subject}` : null,
    '',
    'Message:',
    d.message,
    '',
    "Attribution (as reported by the visitor's browser):",
    ...attribution.map(([k, v]) => `${k}: ${v}`),
    '',
    `Reply to this email to answer ${d.name} directly. Target: first reply within one business day.`,
    '',
    `Lead tracker row (${TRACKER_COLUMNS.join(' · ')}):`,
    row,
  ].filter((l) => l !== null).join('\n');

  const subject = `${where.test ? `[TEST · ${deployment}] ` : ''}New Teranga Technologies ${kind} — ${d.serviceLabel} — ${who} · ${meta.ref}`;
  return { subject, html, text };
}

// ── Resend configuration ─────────────────────────────────────
// RESEND_FROM_EMAIL: "Display Name <address@verified-domain>" or a bare address.
function parseSender(value) {
  const v = String(value || '').trim();
  if (!v || v.length > 200 || /[\r\n]/.test(v)) return null;
  const named = /^"?([^"<>]{1,80}?)"?\s*<([^<>\s]+)>$/.exec(v);
  return isValidEmail(named ? named[2] : v) ? v : null;
}

// LEAD_NOTIFICATION_EMAIL: one address, or up to five separated by commas.
function parseRecipients(value) {
  const list = String(value || '').split(',').map((s) => s.trim()).filter(Boolean);
  return list.length && list.length <= 5 && list.every(isValidEmail) ? list : null;
}

/** Returns { apiKey, from, to } or { problem } naming what is wrong (never a value). */
function mailConfig(env) {
  const missing = ['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'LEAD_NOTIFICATION_EMAIL']
    .filter((k) => !String(env[k] || '').trim());
  if (missing.length) return { problem: `missing ${missing.join(', ')}` };
  const from = parseSender(env.RESEND_FROM_EMAIL);
  if (!from) return { problem: 'RESEND_FROM_EMAIL must look like "Name <address@domain>"' };
  const to = parseRecipients(env.LEAD_NOTIFICATION_EMAIL);
  if (!to) return { problem: 'LEAD_NOTIFICATION_EMAIL must be an email address (or a comma-separated list of up to 5)' };
  const fromDomain = (/@([^>\s]+)>?$/.exec(from) || [])[1] || '';
  return { apiKey: String(env.RESEND_API_KEY).trim(), from, to, fromDomain, deployment: deploymentOf(env) };
}

// Tag values may only contain ASCII letters, numbers, underscores and dashes.
function tagValue(v) {
  return String(v).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 64) || 'none';
}

// ── Delivery ─────────────────────────────────────────────────
// Rate limits, provider errors, network failures, timeouts and an in-progress idempotent request are
// retried; configuration and validation errors (401, 403, 422…) are not.
const RETRYABLE = new Set(['rate_limit_exceeded', 'application_error', 'internal_server_error', 'concurrent_idempotent_requests', 'timeout']);

// Two attempts of at most 4 s plus the pause between them stay inside the function's 10 s limit.
const ATTEMPT_TIMEOUT_MS = 4000;

async function sendOnce(client, payload, idempotencyKey, timeoutMs) {
  const controller = new AbortController();
  let timer;
  // The abort signal cancels the HTTP request; the timer bounds the attempt even if it is ignored.
  const timedOut = new Promise((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve({ error: { name: 'timeout', statusCode: null } });
    }, timeoutMs);
  });
  const attempt = (async () => {
    try {
      const res = await client.emails.send(payload, { idempotencyKey, signal: controller.signal });
      if (res && res.data && res.data.id) return { id: res.data.id };
      return { error: (res && res.error) || { name: 'application_error', statusCode: null } };
    } catch {
      // The SDK reports API errors in `error`; this only catches aborts and unexpected failures.
      return { error: { name: controller.signal.aborted ? 'timeout' : 'application_error', statusCode: null } };
    }
  })();
  try {
    return await Promise.race([attempt, timedOut]);
  } finally {
    clearTimeout(timer);
  }
}

async function deliver(data, cfg, deps) {
  const meta = { ref: leadRef(), received: new Date(), deployment: cfg.deployment };
  const mail = buildEmail(data, meta);
  const client = deps.client || new Resend(cfg.apiKey);
  const payload = {
    from: cfg.from,
    to: cfg.to,
    replyTo: data.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    tags: [
      { name: 'inquiry_type', value: data.type },
      { name: 'service', value: tagValue(data.service) },
      { name: 'lang', value: data.lang },
      { name: 'channel', value: data.attribution.channel },
    ],
  };
  // Unique per submission: makes retries of this request safe without ever merging two leads.
  const idempotencyKey = `lead/${meta.ref}-${crypto.randomUUID()}`;
  const attempts = deps.attempts || 2;
  const delay = deps.retryDelayMs == null ? 700 : deps.retryDelayMs;
  const timeoutMs = deps.timeoutMs || ATTEMPT_TIMEOUT_MS;

  /** @type {{ id?: string, error?: { name: string, statusCode: number | null } }} */
  let result = { error: { name: 'application_error', statusCode: null } };
  let tries = 0;
  for (let i = 1; i <= attempts; i++) {
    tries = i;
    result = await sendOnce(client, payload, idempotencyKey, timeoutMs);
    if (result.id || !RETRYABLE.has(result.error.name) || i === attempts) break;
    await new Promise((r) => setTimeout(r, delay * i));
  }

  // Delivery evidence for the logs, without personal data. Acceptance by Resend is not proof of
  // inbox delivery: look the id up in the Resend dashboard (Emails) for delivered/bounced.
  // Sender domain and recipient count show the configuration resolved without logging addresses.
  const diag = {
    ref: meta.ref, type: data.type, service: data.service, lang: data.lang, channel: data.attribution.channel,
    deployment: cfg.deployment, fromDomain: cfg.fromDomain, recipients: cfg.to.length, attempts: tries,
  };
  if (result.id) {
    console.log('[Teranga] Lead accepted by Resend', JSON.stringify({ ...diag, id: result.id }));
    // The reference is the visitor's own; it lets them quote their request.
    return { status: 200, body: { message: 'Request sent.', ref: meta.ref } };
  }
  console.error('[Teranga] Lead email failed', JSON.stringify({ ...diag, error: result.error.name, status: result.error.statusCode }));
  return { status: 502, body: { message: GENERIC_ERROR } };
}

// ── Duplicate submissions ────────────────────────────────────
// The same request sent again (double click, resubmit after a slow reply) within 10 minutes reuses
// the first attempt: concurrent copies wait for it, later copies get "already received" only if it
// was accepted. A failed attempt is forgotten, so a genuine retry is sent. Per instance, best effort.
const DEDUPE_MS = 10 * 60 * 1000;
const recent = new Map();

function contentKey(d) {
  return crypto.createHash('sha256')
    .update(JSON.stringify([d.type, d.email.toLowerCase(), d.name, d.company, d.service, d.timeline, d.message]))
    .digest('hex');
}

/** Validate and send. Returns { status, body }. Never throws. */
async function handleSubmission(body, env = process.env, deps = {}) {
  const v = validate(body);
  if (!v.ok) return { status: v.status, body: { message: v.message } };

  const cfg = mailConfig(env);
  if (cfg.problem) {
    // Logged for the owner (names only, never values); the public response stays generic.
    console.error('[Teranga] Lead email not configured:', cfg.problem);
    return { status: 503, body: { message: GENERIC_ERROR } };
  }

  const now = Date.now();
  for (const [k, e] of recent) if (now - e.at > DEDUPE_MS) recent.delete(k);

  const key = contentKey(v.data);
  const prior = recent.get(key);
  const priorResult = prior ? await prior.promise : null;
  if (priorResult && priorResult.status === 200) {
    console.log('[Teranga] Duplicate lead not resent', JSON.stringify({ ref: priorResult.body.ref, type: v.data.type, service: v.data.service }));
    return { status: 200, body: { message: 'Request already received.', ref: priorResult.body.ref } };
  }

  const promise = deliver(v.data, cfg, deps).catch(() => {
    console.error('[Teranga] Lead email failed', JSON.stringify({ type: v.data.type, error: 'unexpected' }));
    return { status: 502, body: { message: GENERIC_ERROR } };
  });
  recent.set(key, { at: now, promise });
  const result = await promise;
  if (result.status !== 200 && recent.get(key) && recent.get(key).promise === promise) recent.delete(key);
  return result;
}

module.exports = {
  handleSubmission, validate, buildEmail, escapeHtml, leadRef, mailConfig, cleanAttribution,
  SERVICES, TIMELINES, INQUIRY_TYPES, CHANNELS, TRACKER_COLUMNS,
  _test: { recent, tsvCell, cleanHost, cleanPath },
};
