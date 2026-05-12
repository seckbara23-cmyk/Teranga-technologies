const path      = require('path');
const express   = require('express');
const nodemailer = require('nodemailer');
const cors      = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ── CORS ─────────────────────────────────────────────────────
// In production set ALLOWED_ORIGIN to your actual domain.
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || `http://localhost:${PORT}`;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ALLOWED_ORIGIN : true,
  methods: ['GET', 'POST'],
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.static(path.join(__dirname)));

// ── Simple in-memory rate limiter ─────────────────────────────
// 5 contact submissions per IP per 15-minute window.
const rateLimitStore = new Map();
const WINDOW_MS   = 15 * 60 * 1000;
const MAX_HITS    = 5;

function rateLimit(req, res, next) {
  const key = req.ip || req.socket.remoteAddress;
  const now = Date.now();
  const rec = rateLimitStore.get(key);

  if (!rec || now - rec.start > WINDOW_MS) {
    rateLimitStore.set(key, { start: now, count: 1 });
    return next();
  }
  if (rec.count >= MAX_HITS) {
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }
  rec.count++;
  next();
}

// Clean up stale entries every 30 minutes.
setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;
  rateLimitStore.forEach((v, k) => { if (v.start < cutoff) rateLimitStore.delete(k); });
}, 30 * 60 * 1000);

// ── Mail transporter ──────────────────────────────────────────
const smtpHost   = process.env.EMAIL_HOST;
const smtpPort   = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587;
const smtpSecure = process.env.EMAIL_SECURE === 'true';
const smtpUser   = process.env.EMAIL_USER;
const smtpPass   = process.env.EMAIL_PASS;
const emailTo    = process.env.EMAIL_TO || 'seckbara23@gmail.com';

const transporter = nodemailer.createTransport({
  host:   smtpHost,
  port:   smtpPort,
  secure: smtpSecure,
  auth:   { user: smtpUser || '', pass: smtpPass || '' },
});

// ── Input helpers ─────────────────────────────────────────────
function sanitize(v) {
  return String(v || '').trim().replace(/[<>]/g, '');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const VALID_SERVICES = new Set([
  'Website Development',
  'Web Application',
  'Mobile App',
  'SaaS Product',
  'Maintenance & Support',
  'Création de site web',
  'Application web',
  'Application mobile',
  'Produit SaaS',
  'Other',
  'Autre',
]);

// ── Routes ────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/contact', rateLimit, async (req, res) => {
  const website = sanitize(req.body.website);
  if (website) return res.status(400).json({ message: 'Invalid submission.' });

  const name    = sanitize(req.body.name);
  const email   = sanitize(req.body.email);
  const service = sanitize(req.body.service);
  const subject = sanitize(req.body.subject);
  const phone   = sanitize(req.body.phone);
  const message = sanitize(req.body.message);

  // Validation
  if (!name || name.length < 2)
    return res.status(400).json({ message: 'Name is required (minimum 2 characters).' });
  if (!email || !isValidEmail(email))
    return res.status(400).json({ message: 'A valid email address is required.' });
  if (!service || !VALID_SERVICES.has(service))
    return res.status(400).json({ message: 'Please select a valid service.' });
  if (!subject || subject.length < 3)
    return res.status(400).json({ message: 'Subject is required (minimum 3 characters).' });
  if (!message || message.length < 10)
    return res.status(400).json({ message: 'Message is required (minimum 10 characters).' });

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.error('[Teranga] SMTP not configured. Set EMAIL_HOST, EMAIL_USER, EMAIL_PASS in .env');
    return res.status(500).json({ message: 'Email service is not configured.' });
  }

  const html = `
    <h2 style="color:#2563EB;margin-bottom:16px">New Contact Request — Teranga Technologies</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px">
      <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;width:120px">Name</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0">${name}</td></tr>
      <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc">Email</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0"><a href="mailto:${email}">${email}</a></td></tr>
      ${phone ? `<tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc">Phone</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0"><a href="tel:${phone}">${phone}</a></td></tr>` : ''}
      <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc">Service</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0">${service}</td></tr>
      <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc">Subject</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0">${subject}</td></tr>
      <tr><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:600;background:#f8fafc;vertical-align:top">Message</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0;white-space:pre-wrap">${message}</td></tr>
    </table>
  `;

  try {
    await transporter.sendMail({
      from:    `"Teranga Website" <${smtpUser}>`,
      to:      emailTo,
      replyTo: email,
      subject: `[Teranga Contact] ${subject}`,
      text:    `From: ${name} <${email}>${phone ? `\nPhone: ${phone}` : ''}\nService: ${service}\n\n${subject}\n\n${message}`,
      html,
    });
    res.json({ message: 'Email sent successfully.' });
  } catch (err) {
    console.error('[Teranga] Mail send error:', err.message);
    res.status(500).json({ message: 'Unable to send email. Please try again later.' });
  }
});

app.listen(PORT, () => {
  console.log(`Teranga Technologies server → http://localhost:${PORT}`);
});
