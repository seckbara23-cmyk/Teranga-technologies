const path      = require('path');
const express   = require('express');
const cors      = require('cors');
require('dotenv').config();
const { handleSubmission } = require('./api/_lib/contact');

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
// Same URLs as on Vercel (cleanUrls): /services serves services.html, /fr serves fr/index.html.
app.use(express.static(path.join(__dirname), { extensions: ['html'] }));

// ── Simple in-memory rate limiter ─────────────────────────────
// 5 contact submissions per IP per 15-minute window.
const rateLimitStore = new Map();
const WINDOW_MS   = 15 * 60 * 1000;
const MAX_HITS    = Number(process.env.CONTACT_RATE_LIMIT) || 5;

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

// ── Routes ────────────────────────────────────────────────────
// Validation and email sending are shared with the Vercel function (api/_lib/contact.js).
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/contact', rateLimit, async (req, res) => {
  const result = await handleSubmission(req.body);
  res.status(result.status).json(result.body);
});

// Unknown pages get the generated bilingual 404, as on Vercel.
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => {
  console.log(`Teranga Technologies server → http://localhost:${PORT}`);
});
