const nodemailer = require('nodemailer');

function sanitize(v) {
  return String(v || '').trim().replace(/[<>]/g, '');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const VALID_SERVICES = new Set([
  'Website Development', 'Web Application', 'Mobile App',
  'SaaS Product', 'Maintenance & Support',
  'Création de site web', 'Application web', 'Application mobile',
  'Produit SaaS', 'Other', 'Autre',
]);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin',  process.env.ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ message: 'Method not allowed.' });

  const body = req.body || {};

  const website = sanitize(body.website);
  if (website) return res.status(400).json({ message: 'Invalid submission.' });

  const name    = sanitize(body.name);
  const email   = sanitize(body.email);
  const service = sanitize(body.service);
  const subject = sanitize(body.subject);
  const phone   = sanitize(body.phone);
  const message = sanitize(body.message);

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

  const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_PORT, EMAIL_SECURE, EMAIL_TO } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS)
    return res.status(500).json({ message: 'Email service is not configured.' });

  const transporter = nodemailer.createTransport({
    host:   EMAIL_HOST,
    port:   Number(EMAIL_PORT) || 587,
    secure: EMAIL_SECURE === 'true',
    auth:   { user: EMAIL_USER, pass: EMAIL_PASS },
  });

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
    </table>`;

  try {
    await transporter.sendMail({
      from:    `"Teranga Website" <${EMAIL_USER}>`,
      to:      EMAIL_TO || 'seckbara23@gmail.com',
      replyTo: email,
      subject: `[Teranga Contact] ${subject}`,
      text:    `From: ${name} <${email}>${phone ? `\nPhone: ${phone}` : ''}\nService: ${service}\n\n${subject}\n\n${message}`,
      html,
    });
    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (err) {
    console.error('[Teranga] Mail send error:', err.message);
    res.status(500).json({ message: 'Unable to send email. Please try again later.' });
  }
};
