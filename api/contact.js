const { handleSubmission } = require('./_lib/contact');

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

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { return res.status(400).json({ message: 'Invalid JSON.' }); }
  }

  const result = await handleSubmission(body);
  return res.status(result.status).json(result.body);
};
