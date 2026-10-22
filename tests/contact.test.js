// Validation, email content and delivery outcomes of the shared contact module.
const test = require('node:test');
const assert = require('node:assert/strict');
const nodemailer = require('nodemailer');
const contact = require('../api/_lib/contact');

const VALID = {
  name: 'Awa Ndiaye',
  email: 'awa@example.com',
  company: 'Acme SA',
  service: 'saas',
  timeline: '1-3m',
  message: 'We want to launch a booking SaaS for clinics.',
  lang: 'en',
};

const SMTP_ENV = { EMAIL_HOST: 'smtp.test', EMAIL_USER: 'site@example.com', EMAIL_PASS: 'x', EMAIL_TO: 'owner@example.com' };

function withFakeTransport(result, fn) {
  const sent = [];
  const original = nodemailer.createTransport;
  nodemailer.createTransport = () => ({
    sendMail: async (msg) => {
      sent.push(msg);
      if (result instanceof Error) throw result;
      return result;
    },
  });
  return fn(sent).finally(() => { nodemailer.createTransport = original; });
}

function captureLogs(fn) {
  const lines = [];
  const { log, error } = console;
  console.log = (...a) => lines.push(a.join(' '));
  console.error = (...a) => lines.push(a.join(' '));
  return fn(lines).finally(() => { console.log = log; console.error = error; });
}

test('accepts a complete request and builds a default subject', () => {
  const v = contact.validate(VALID);
  assert.equal(v.ok, true);
  assert.equal(v.data.serviceLabel, 'SaaS development');
  assert.equal(v.data.timelineLabel, 'Within 1–3 months');
  assert.equal(v.data.subject, 'Discovery call request — SaaS development — Acme SA');
});

test('rejects missing or invalid required fields', () => {
  const cases = [
    [{ name: 'A' }, /Name is required/],
    [{ email: 'not-an-email' }, /valid email/],
    [{ email: 'a@b.c' }, /valid email/],
    [{ email: 'awa@example.com\r\nBcc: x@evil.test' }, /valid email/],
    [{ email: 'awa@example.com>, x@evil.test' }, /valid email/],
    [{ service: 'crypto' }, /valid service/],
    [{ service: '' }, /valid service/],
    [{ timeline: 'tomorrow' }, /valid timeline/],
    [{ message: 'too short' }, /Message is required/],
  ];
  for (const [patch, msg] of cases) {
    const v = contact.validate({ ...VALID, ...patch });
    assert.equal(v.ok, false, JSON.stringify(patch));
    assert.equal(v.status, 400);
    assert.match(v.message, msg);
  }
});

test('rejects honeypot submissions and non-object bodies', () => {
  assert.equal(contact.validate({ ...VALID, website: 'http://spam.test' }).ok, false);
  assert.equal(contact.validate(null).ok, false);
  assert.equal(contact.validate('name=x').ok, false);
});

test('accepts the service labels sent by the previous site', () => {
  assert.equal(contact.validate({ ...VALID, service: 'Website Development' }).ok, true);
  assert.equal(contact.validate({ ...VALID, service: 'Création de site web' }).ok, true);
});

test('flattens line breaks in single-line fields and bounds lengths', () => {
  const v = contact.validate({
    ...VALID,
    name: 'Awa\r\nBcc: x@evil.test',
    company: 'Acme\nCc: y@evil.test',
    subject: 'Hi\r\nBcc: z@evil.test',
    message: 'x'.repeat(9000),
  });
  assert.equal(v.ok, true);
  for (const k of ['name', 'company', 'subject']) assert.doesNotMatch(v.data[k], /[\r\n]/);
  assert.equal(v.data.message.length, 5000);
});

test('keeps only allow-listed, bounded source attribution', () => {
  const v = contact.validate({
    ...VALID,
    source: { utm_source: 'linkedin', utm_medium: 'social\r\nX', utm_campaign: 'q'.repeat(300), referrer: 'www.google.com', email: 'leak@example.com' },
  });
  assert.equal(v.ok, true);
  assert.match(v.data.source, /^utm_source=linkedin · utm_medium=social X · utm_campaign=q{100} · referrer=www\.google\.com$/);
  assert.doesNotMatch(v.data.source, /leak/);
  assert.equal(contact.validate({ ...VALID, source: 'utm_source=x' }).data.source, '');
});

test('lead references are dated and short', () => {
  assert.match(contact.leadRef(new Date('2026-10-22T09:00:00Z')), /^TT-20261022-[0-9A-F]{4}$/);
});

test('notification email escapes visitor input and carries tracking fields', () => {
  const v = contact.validate({ ...VALID, name: '<script>alert(1)</script>', source: { utm_source: 'newsletter' } });
  const mail = contact.buildEmail(v.data, { ref: 'TT-20261022-ABCD', received: new Date('2026-10-22T09:05:00Z') });
  assert.doesNotMatch(mail.html, /<script>/);
  assert.match(mail.html, /&lt;script&gt;/);
  assert.match(mail.subject, /^\[Teranga\] .* · TT-20261022-ABCD$/);
  assert.doesNotMatch(mail.subject, /[\r\n]/);
  for (const line of ['Reference: TT-20261022-ABCD', 'Received: 2026-10-22 09:05 UTC', 'Site language: English', 'Source: utm_source=newsletter']) {
    assert.ok(mail.text.includes(line), line);
  }
  assert.doesNotMatch(mail.html + mail.text, /24 hours/);
});

test('unknown source is labelled rather than left blank', () => {
  const v = contact.validate(VALID);
  const mail = contact.buildEmail(v.data, { ref: 'TT-20261022-ABCD', received: new Date() });
  assert.ok(mail.text.includes('Source: Direct or unknown'));
});

test('missing SMTP settings return a generic 503', async () => {
  await captureLogs(async () => {
    const r = await contact.handleSubmission(VALID, {});
    assert.equal(r.status, 503);
    assert.doesNotMatch(r.body.message, /config|SMTP|EMAIL_/i);
  });
});

test('delivers one message to the configured inbox with the visitor as Reply-To', async () => {
  await withFakeTransport({ accepted: ['owner@example.com'], rejected: [], response: '250 OK' }, async (sent) => {
    await captureLogs(async (lines) => {
      const r = await contact.handleSubmission({ ...VALID, name: 'Awa "Boss" Ndiaye\r\nBcc: x@evil.test' }, SMTP_ENV);
      assert.equal(r.status, 200);
      assert.equal(sent.length, 1);
      assert.equal(sent[0].to, 'owner@example.com');
      assert.equal(sent[0].bcc, undefined);
      assert.equal(sent[0].cc, undefined);
      assert.match(sent[0].replyTo, /<awa@example\.com>$/);
      assert.doesNotMatch(sent[0].replyTo, /[\r\n]|Boss"/);
      assert.match(sent[0].subject, /· TT-\d{8}-[0-9A-F]{4}$/);
      // Delivery evidence is logged without personal data.
      assert.equal(lines.length, 1);
      assert.match(lines[0], /"ref":"TT-\d{8}-[0-9A-F]{4}".*"accepted":1/);
      assert.doesNotMatch(lines.join('\n'), /@|Ndiaye|booking SaaS/);
    });
  });
});

test('a message accepted by no recipient is reported as a failure', async () => {
  await withFakeTransport({ accepted: [], rejected: ['owner@example.com'], response: '550' }, async () => {
    await captureLogs(async () => {
      const r = await contact.handleSubmission(VALID, SMTP_ENV);
      assert.equal(r.status, 502);
    });
  });
});

test('an SMTP error returns a generic 502 and logs no personal data', async () => {
  const err = Object.assign(new Error('Invalid login'), { code: 'EAUTH' });
  await withFakeTransport(err, async () => {
    await captureLogs(async (lines) => {
      const r = await contact.handleSubmission(VALID, SMTP_ENV);
      assert.equal(r.status, 502);
      assert.doesNotMatch(r.body.message, /login|EAUTH/);
      assert.match(lines.join('\n'), /EAUTH/);
      assert.doesNotMatch(lines.join('\n'), /awa@|Ndiaye/);
    });
  });
});
