/* Shared contact / discovery-call logic.
   Used by the Vercel function (api/contact.js) and the local Express server (server.js).
   Files in api/ whose name starts with "_" are not deployed as endpoints. */

const nodemailer = require('nodemailer');

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

const LIMITS = { name: 120, email: 200, company: 160, subject: 200, phone: 40, message: 5000 };

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
  return /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']{2,}$/.test(email);
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
  };

  if (data.name.length < 2)
    return { ok: false, status: 400, message: 'Name is required (minimum 2 characters).' };
  if (!isValidEmail(data.email))
    return { ok: false, status: 400, message: 'A valid email address is required.' };

  if (SERVICES[data.service]) data.serviceLabel = SERVICES[data.service];
  else if (LEGACY_SERVICES.has(data.service)) data.serviceLabel = data.service;
  else return { ok: false, status: 400, message: 'Please select a valid service.' };

  if (data.timeline && !TIMELINES[data.timeline])
    return { ok: false, status: 400, message: 'Please select a valid timeline.' };
  data.timelineLabel = data.timeline ? TIMELINES[data.timeline] : '';

  if (data.message.length < 10)
    return { ok: false, status: 400, message: 'Message is required (minimum 10 characters).' };

  if (!data.subject) {
    data.subject = `Discovery call request — ${data.serviceLabel} — ${data.company || data.name}`;
  }

  return { ok: true, status: 200, data };
}

function buildEmail(d) {
  const rows = [
    ['Name', escapeHtml(d.name)],
    ['Email', `<a href="mailto:${escapeHtml(d.email)}">${escapeHtml(d.email)}</a>`],
    d.company ? ['Company', escapeHtml(d.company)] : null,
    d.phone ? ['Phone', escapeHtml(d.phone)] : null,
    ['Service', escapeHtml(d.serviceLabel)],
    d.timelineLabel ? ['Timeline', escapeHtml(d.timelineLabel)] : null,
    ['Site language', d.lang === 'fr' ? 'French' : 'English'],
    ['Message', `<span style="white-space:pre-wrap">${escapeHtml(d.message)}</span>`],
  ].filter(Boolean);

  const cell = 'padding:10px 12px;border:1px solid #D8DEE7;vertical-align:top';
  const html = `
    <h2 style="font-family:Arial,sans-serif;color:#0B1F3A;margin:0 0 16px">New discovery call request — Teranga Technologies</h2>
    <table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;width:100%;max-width:640px">
      ${rows.map(([k, v]) => `<tr><td style="${cell};font-weight:600;background:#F3F5F8;width:130px">${k}</td><td style="${cell}">${v}</td></tr>`).join('')}
    </table>
    <p style="font-family:Arial,sans-serif;font-size:13px;color:#53627A">Reply to this email to answer ${escapeHtml(d.name)} directly. The site promises a reply within 24 hours.</p>`;

  const text = [
    'New discovery call request — Teranga Technologies',
    '',
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    d.company ? `Company: ${d.company}` : null,
    d.phone ? `Phone: ${d.phone}` : null,
    `Service: ${d.serviceLabel}`,
    d.timelineLabel ? `Timeline: ${d.timelineLabel}` : null,
    `Site language: ${d.lang === 'fr' ? 'French' : 'English'}`,
    '',
    d.message,
  ].filter((l) => l !== null).join('\n');

  return { subject: `[Teranga] ${d.subject}`, html, text };
}

function smtpConfig(env) {
  const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_PORT, EMAIL_SECURE, EMAIL_TO } = env;
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) return null;
  return {
    transport: {
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT) || 587,
      secure: EMAIL_SECURE === 'true',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    },
    from: EMAIL_USER,
    to: EMAIL_TO || 'seckbara23@gmail.com',
  };
}

/** Validate and send. Returns { status, body }. Never throws. */
async function handleSubmission(body, env = process.env) {
  const v = validate(body);
  if (!v.ok) return { status: v.status, body: { message: v.message } };

  const cfg = smtpConfig(env);
  if (!cfg) {
    // Logged for the owner; the public response stays generic.
    console.error('[Teranga] SMTP not configured: set EMAIL_HOST, EMAIL_USER and EMAIL_PASS.');
    return { status: 503, body: { message: 'Unable to send your request. Please try again later.' } };
  }

  const mail = buildEmail(v.data);
  try {
    const info = await nodemailer.createTransport(cfg.transport).sendMail({
      from: `"Teranga Website" <${cfg.from}>`,
      to: cfg.to,
      replyTo: `"${v.data.name.replace(/"/g, '')}" <${v.data.email}>`,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
    // Delivery evidence for the logs, without personal data.
    console.log('[Teranga] Discovery request handed to SMTP', JSON.stringify({
      service: v.data.service,
      accepted: (info.accepted || []).length,
      rejected: (info.rejected || []).length,
      smtp: String(info.response || '').slice(0, 60),
    }));
    if ((info.accepted || []).length === 0) {
      return { status: 502, body: { message: 'Unable to send your request. Please try again later.' } };
    }
    return { status: 200, body: { message: 'Request sent.' } };
  } catch (err) {
    console.error('[Teranga] Mail send error:', err && (err.code || err.message));
    return { status: 502, body: { message: 'Unable to send your request. Please try again later.' } };
  }
}

module.exports = { handleSubmission, validate, buildEmail, escapeHtml, SERVICES, TIMELINES };
