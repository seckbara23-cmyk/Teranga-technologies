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

// First-touch attribution sent by the page: campaign tags and the referring site's host.
// No personal data; anything else in `source` is ignored.
const SOURCE_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'referrer'];

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

function cleanSource(source) {
  if (!source || typeof source !== 'object') return '';
  return SOURCE_KEYS
    .map((k) => [k, oneLine(source[k], 100)])
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join(' · ');
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
    source:   cleanSource(body.source),
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

function buildEmail(d, meta) {
  const received = meta.received.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  const source = d.source || 'Direct or unknown';
  const rows = [
    ['Inquiry type', escapeHtml(d.typeLabel)],
    ['Reference', escapeHtml(meta.ref)],
    ['Received', received],
    ['Name', escapeHtml(d.name)],
    ['Email', `<a href="mailto:${escapeHtml(d.email)}">${escapeHtml(d.email)}</a>`],
    d.company ? ['Company', escapeHtml(d.company)] : null,
    d.phone ? ['Phone', escapeHtml(d.phone)] : null,
    ['Service', escapeHtml(d.serviceLabel)],
    d.timelineLabel ? ['Timeline', escapeHtml(d.timelineLabel)] : null,
    ['Site language', d.lang === 'fr' ? 'French' : 'English'],
    ['Source', escapeHtml(source)],
    d.subject ? ['Subject', escapeHtml(d.subject)] : null,
    ['Message', `<span style="white-space:pre-wrap">${escapeHtml(d.message)}</span>`],
  ].filter(Boolean);

  const cell = 'padding:10px 12px;border:1px solid #D8DEE7;vertical-align:top';
  const html = `
    <h2 style="font-family:Arial,sans-serif;color:#0B1F3A;margin:0 0 16px">${escapeHtml(d.typeLabel)} — Teranga Technologies</h2>
    <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;width:100%;max-width:640px">
      ${rows.map(([k, v]) => `<tr><td style="${cell};font-weight:600;background:#F3F5F8;width:130px">${k}</td><td style="${cell}">${v}</td></tr>`).join('')}
    </table>
    <p style="font-family:Arial,sans-serif;font-size:13px;color:#53627A">Reply to this email to answer ${escapeHtml(d.name)} directly. Target: first reply within one business day. Log it in the lead tracker as NEW with reference ${escapeHtml(meta.ref)}.</p>`;

  const text = [
    `${d.typeLabel} — Teranga Technologies`,
    '',
    `Inquiry type: ${d.typeLabel}`,
    `Reference: ${meta.ref}`,
    `Received: ${received}`,
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    d.company ? `Company: ${d.company}` : null,
    d.phone ? `Phone: ${d.phone}` : null,
    `Service: ${d.serviceLabel}`,
    d.timelineLabel ? `Timeline: ${d.timelineLabel}` : null,
    `Site language: ${d.lang === 'fr' ? 'French' : 'English'}`,
    `Source: ${source}`,
    d.subject ? `Subject: ${d.subject}` : null,
    '',
    d.message,
    '',
    'Reply to this email to answer the sender directly.',
  ].filter((l) => l !== null).join('\n');

  const subject = `[Teranga] ${d.typeLabel} — ${d.serviceLabel} — ${d.company || d.name} · ${meta.ref}`;
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
  return { apiKey: String(env.RESEND_API_KEY).trim(), from, to };
}

// Tag values may only contain ASCII letters, numbers, underscores and dashes.
function tagValue(v) {
  return String(v).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 64) || 'none';
}

// ── Delivery ─────────────────────────────────────────────────
// Rate limits, provider errors, network failures and an in-progress idempotent request are retried;
// configuration and validation errors (401, 403, 422…) are not.
const RETRYABLE = new Set(['rate_limit_exceeded', 'application_error', 'internal_server_error', 'concurrent_idempotent_requests']);

async function sendOnce(client, payload, idempotencyKey) {
  try {
    const res = await client.emails.send(payload, { idempotencyKey });
    if (res && res.data && res.data.id) return { id: res.data.id };
    return { error: (res && res.error) || { name: 'application_error', statusCode: null } };
  } catch {
    // The SDK reports API errors in `error`; this only catches unexpected failures.
    return { error: { name: 'application_error', statusCode: null } };
  }
}

async function deliver(data, cfg, deps) {
  const meta = { ref: leadRef(), received: new Date() };
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
    ],
  };
  // Unique per submission: makes retries of this request safe without ever merging two leads.
  const idempotencyKey = `lead/${meta.ref}-${crypto.randomUUID()}`;
  const attempts = deps.attempts || 2;
  const delay = deps.retryDelayMs == null ? 700 : deps.retryDelayMs;

  /** @type {{ id?: string, error?: { name: string, statusCode: number | null } }} */
  let result = { error: { name: 'application_error', statusCode: null } };
  for (let i = 1; i <= attempts; i++) {
    result = await sendOnce(client, payload, idempotencyKey);
    if (result.id || !RETRYABLE.has(result.error.name) || i === attempts) break;
    await new Promise((r) => setTimeout(r, delay * i));
  }

  // Delivery evidence for the logs, without personal data. Acceptance by Resend is not proof of
  // inbox delivery: look the id up in the Resend dashboard (Emails) for delivered/bounced.
  const diag = { ref: meta.ref, type: data.type, service: data.service, lang: data.lang, sourced: Boolean(data.source) };
  if (result.id) {
    console.log('[Teranga] Lead accepted by Resend', JSON.stringify({ ...diag, id: result.id }));
    return { status: 200, body: { message: 'Request sent.' } };
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
  if (prior && (await prior.promise).status === 200) {
    console.log('[Teranga] Duplicate lead not resent', JSON.stringify({ type: v.data.type, service: v.data.service }));
    return { status: 200, body: { message: 'Request already received.' } };
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
  handleSubmission, validate, buildEmail, escapeHtml, leadRef, mailConfig,
  SERVICES, TIMELINES, INQUIRY_TYPES,
  _test: { recent },
};
