const { handleSubmission } = require('./_lib/contact');

// ── Best-effort rate limit ──────────────────────────────────
// Serverless instances are reused between requests, so an in-memory window
// slows bursts from one client. It is not a global guarantee: for that, add a
// Vercel Firewall rate-limit rule on POST /api/contact (see docs/TERANGA-01-report.md).
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = Number(process.env.CONTACT_RATE_LIMIT) || 5;
const hits = new Map();

// A discovery request is a few kilobytes; anything far larger is refused before it is parsed.
const MAX_BODY_BYTES = 32 * 1024;

// Vercel sets x-vercel-forwarded-for and x-real-ip itself (a client cannot supply them), so they come
// first; x-forwarded-for is only a fallback for other hosts.
function clientIp(req) {
  const h = req.headers || {};
  const first = (v) => String(v || '').split(',')[0].trim();
  return first(h['x-vercel-forwarded-for']) || first(h['x-real-ip']) || first(h['x-forwarded-for'])
    || (req.socket && req.socket.remoteAddress) || 'unknown';
}

function limited(ip, now = Date.now()) {
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (now - v.start > WINDOW_MS) hits.delete(k);
  }
  const rec = hits.get(ip);
  if (!rec || now - rec.start > WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_PER_WINDOW;
}

// Vercel serverless function: POST /api/contact
module.exports = async (req, res) => {
  // Same-origin requests from the site need no CORS headers. Only allow a
  // cross-origin caller if ALLOWED_ORIGIN is explicitly configured.
  const allowed = process.env.ALLOWED_ORIGIN;
  if (allowed) {
    res.setHeader('Access-Control-Allow-Origin', allowed);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  if (limited(clientIp(req))) {
    res.setHeader('Retry-After', String(Math.ceil(WINDOW_MS / 1000)));
    return res.status(429).json({ message: 'Too many requests. Please try again later.' });
  }

  const declared = Number((req.headers || {})['content-length']);
  if (declared > MAX_BODY_BYTES) return res.status(413).json({ message: 'Request too large.' });

  let body = req.body;
  if (typeof body === 'string') {
    if (Buffer.byteLength(body) > MAX_BODY_BYTES) return res.status(413).json({ message: 'Request too large.' });
    try { body = JSON.parse(body); } catch { return res.status(400).json({ message: 'Invalid JSON.' }); }
  }

  const result = await handleSubmission(body);
  return res.status(result.status).json(result.body);
};

module.exports._test = { limited, clientIp, hits };
