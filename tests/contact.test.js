// Validation, email content, Resend delivery outcomes and duplicate protection of the shared contact module.
const test = require('node:test');
const assert = require('node:assert/strict');
const contact = require('../api/_lib/contact');

const VALID = {
  type: 'discovery',
  name: 'Awa Ndiaye',
  email: 'awa@example.com',
  company: 'Acme SA',
  service: 'saas',
  timeline: '1-3m',
  message: 'We want to launch a booking SaaS for clinics.',
  lang: 'en',
};

const ENV = {
  RESEND_API_KEY: 're_test_not_a_real_key',
  RESEND_FROM_EMAIL: 'Teranga Technologies <notifications@teranga-tech.com>',
  LEAD_NOTIFICATION_EMAIL: 'owner@example.com',
  VERCEL: '1',
  VERCEL_ENV: 'production',
};

// Fake Resend client: answers each send with the next scripted response ({ data, error } like the SDK).
function fakeClient(...responses) {
  const calls = [];
  return {
    calls,
    emails: {
      send: async (payload, options) => {
        calls.push({ payload, options });
        const r = responses.length > 1 ? responses.shift() : responses[0];
        if (r instanceof Error) throw r;
        return typeof r === 'function' ? r() : r;
      },
    },
  };
}
const ACCEPTED = { data: { id: '4ef9a417-02e9-4d39-ad75-9611e0fcc33c' }, error: null };
const providerError = (name, statusCode) => ({ data: null, error: { name, statusCode, message: name } });
const deps = (client, extra = {}) => ({ client, retryDelayMs: 0, ...extra });
let n = 0;
const unique = (extra = {}) => ({ ...VALID, message: `${VALID.message} (case ${++n})`, ...extra });

function captureLogs(fn) {
  const lines = [];
  const { log, error } = console;
  console.log = (...a) => lines.push(a.join(' '));
  console.error = (...a) => lines.push(a.join(' '));
  return Promise.resolve().then(() => fn(lines)).finally(() => { console.log = log; console.error = error; });
}

test.beforeEach(() => contact._test.recent.clear());

// ── Validation ───────────────────────────────────────────────

test('accepts a complete discovery request', () => {
  const v = contact.validate(VALID);
  assert.equal(v.ok, true);
  assert.equal(v.data.type, 'discovery');
  assert.equal(v.data.serviceLabel, 'SaaS development');
  assert.equal(v.data.timelineLabel, 'Within 1–3 months');
});

test('rejects missing or invalid required fields', () => {
  const cases = [
    [{ name: 'A' }, /Name is required/],
    [{ name: undefined }, /Name is required/],
    [{ email: 'not-an-email' }, /valid email/],
    [{ email: 'a@b.c' }, /valid email/],
    [{ email: 'awa@example.com\r\nBcc: x@evil.test' }, /valid email/],
    [{ email: 'awa@example.com>, x@evil.test' }, /valid email/],
    [{ email: 'awa@example.com,x@evil.test' }, /valid email/],
    [{ service: 'crypto' }, /valid service/],
    [{ service: '' }, /valid service/],
    [{ timeline: 'tomorrow' }, /valid timeline/],
    [{ message: 'too short' }, /Message is required/],
    [{ message: undefined }, /Message is required/],
    [{ type: 'quote' }, /Invalid inquiry type/],
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

test('a submission from the previous site\'s contact form is typed "contact"', () => {
  const legacy = { name: 'Moussa Diop', email: 'moussa@example.com', service: 'Création de site web', subject: 'Site vitrine', phone: '+221 77 000 00 00', message: 'Bonjour, je voudrais un site pour mon entreprise.' };
  const v = contact.validate(legacy);
  assert.equal(v.ok, true);
  assert.equal(v.data.type, 'contact');
  assert.equal(v.data.typeLabel, 'Contact message');
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
});

test('lead references are dated and short', () => {
  assert.match(contact.leadRef(new Date('2026-10-22T09:00:00Z')), /^TT-20261022-[0-9A-F]{4}$/);
});

// ── Notification content ─────────────────────────────────────

test('notification escapes visitor HTML and has a readable plain-text part', () => {
  const v = contact.validate({ ...VALID, name: '<img src=x onerror=alert(1)>', company: '"><script>alert(1)</script>', message: 'Hello <b>team</b> & <a href="javascript:x">click</a>', source: { utm_source: 'newsletter' } });
  const mail = contact.buildEmail(v.data, { ref: 'TT-20261022-ABCD', received: new Date('2026-10-22T09:05:00Z') });
  assert.doesNotMatch(mail.html, /<script>|<img |<b>|<a href="javascript/);
  assert.match(mail.html, /&lt;script&gt;/);
  assert.match(mail.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(mail.subject, /^New Teranga Technologies Inquiry — SaaS development — .* · TT-20261022-ABCD$/);
  assert.doesNotMatch(mail.subject, /[\r\n]/);
  for (const line of ['Inquiry type: Discovery call request', 'Reference: TT-20261022-ABCD', 'Submitted: 2026-10-22 09:05 UTC', 'Submitted from: Website discovery-call form — teranga-tech.com', 'Service: SaaS development', 'Timeline: Within 1–3 months', 'Language: English', 'Source: utm_source=newsletter', 'Hello <b>team</b> & <a href="javascript:x">click</a>']) {
    assert.ok(mail.text.includes(line), line);
  }
});

test('fields that were not supplied are left out, never invented', () => {
  const v = contact.validate({ name: 'Awa Ndiaye', email: 'awa@example.com', service: 'other', message: 'Just exploring options for now.' });
  const mail = contact.buildEmail(v.data, { ref: 'TT-20261022-ABCD', received: new Date() });
  assert.doesNotMatch(mail.text, /Company:|Phone:|Timeline:|Budget|Subject:/);
  assert.ok(mail.text.includes('Source: Direct or unknown'));
  assert.match(mail.subject, /— Not sure yet — Awa Ndiaye ·/);
});

test('contact-form notifications are labelled differently from discovery requests', () => {
  const v = contact.validate({ name: 'Moussa Diop', email: 'moussa@example.com', service: 'Website Development', subject: 'Quote <please>', message: 'Hello, I need a website for my shop.', lang: 'fr' });
  const mail = contact.buildEmail(v.data, { ref: 'TT-20261022-ABCD', received: new Date() });
  assert.match(mail.subject, /^New Teranga Technologies Contact Message — Website Development — Moussa Diop · TT-/);
  assert.ok(mail.text.includes('Submitted from: Previous website contact form (cached page)'));
  assert.ok(mail.text.includes('Subject: Quote <please>'));
  assert.match(mail.html, /Quote &lt;please&gt;/);
  assert.ok(mail.text.includes('Language: French'));
});

// ── Configuration ────────────────────────────────────────────

test('missing Resend settings return a generic 503 and name only the missing variables', async () => {
  for (const missing of ['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'LEAD_NOTIFICATION_EMAIL']) {
    const env = { ...ENV, [missing]: '' };
    const client = fakeClient(ACCEPTED);
    await captureLogs(async (lines) => {
      const r = await contact.handleSubmission(unique(), env, deps(client));
      assert.equal(r.status, 503);
      assert.equal(r.body.message, 'Unable to send your request. Please try again later.');
      assert.equal(client.calls.length, 0);
      assert.match(lines.join('\n'), new RegExp(`missing ${missing}`));
      assert.doesNotMatch(lines.join('\n'), /re_test_not_a_real_key/);
    });
  }
});

test('an invalid sender or recipient configuration is refused before calling Resend', async () => {
  const bad = [
    { RESEND_FROM_EMAIL: 'Teranga Technologies' },
    { RESEND_FROM_EMAIL: 'notifications@' },
    { RESEND_FROM_EMAIL: 'Teranga <notifications@teranga-tech.com>\r\nBcc: x@evil.test' },
    { LEAD_NOTIFICATION_EMAIL: 'seckbara23' },
    { LEAD_NOTIFICATION_EMAIL: 'a@example.com, not-an-address' },
  ];
  for (const patch of bad) {
    const client = fakeClient(ACCEPTED);
    await captureLogs(async (lines) => {
      const r = await contact.handleSubmission(unique(), { ...ENV, ...patch }, deps(client));
      assert.equal(r.status, 503, JSON.stringify(patch));
      assert.equal(client.calls.length, 0);
      assert.match(lines.join('\n'), /RESEND_FROM_EMAIL must|LEAD_NOTIFICATION_EMAIL must/);
    });
  }
  assert.ok(!contact.mailConfig({ ...ENV, RESEND_FROM_EMAIL: 'notifications@teranga-tech.com' }).problem, 'bare address allowed');
  assert.deepEqual(contact.mailConfig({ ...ENV, LEAD_NOTIFICATION_EMAIL: 'a@example.com, b@example.com' }).to, ['a@example.com', 'b@example.com']);
});

// ── Delivery ─────────────────────────────────────────────────

test('a lead accepted by Resend returns 200 with the expected message', async () => {
  const client = fakeClient(ACCEPTED);
  await captureLogs(async (lines) => {
    const r = await contact.handleSubmission(unique({ name: 'Awa "Boss" Ndiaye\r\nBcc: x@evil.test', source: { utm_source: 'linkedin' } }), ENV, deps(client));
    assert.equal(r.status, 200);
    assert.equal(r.body.message, 'Request sent.');
    assert.equal(client.calls.length, 1);
    const { payload, options } = client.calls[0];
    assert.equal(payload.from, 'Teranga Technologies <notifications@teranga-tech.com>');
    assert.deepEqual(payload.to, ['owner@example.com']);
    assert.equal(payload.replyTo, 'awa@example.com');
    assert.equal(payload.bcc, undefined);
    assert.equal(payload.cc, undefined);
    assert.ok(payload.html && payload.text, 'HTML and plain text');
    assert.match(payload.subject, /^New Teranga Technologies Inquiry — SaaS development — Acme SA · TT-\d{8}-[0-9A-F]{4}$/);
    assert.doesNotMatch(payload.html + payload.text, /TEST|not a real lead/);
    for (const tag of payload.tags) assert.match(tag.value, /^[A-Za-z0-9_-]+$/, tag.name);
    assert.match(options.idempotencyKey, /^lead\/TT-\d{8}-[0-9A-F]{4}-[0-9a-f-]{36}$/);
    // Diagnostics: reference and Resend id, no personal data or message text.
    const log = lines.join('\n');
    assert.match(log, /Lead accepted by Resend.*"ref":"TT-\d{8}-[0-9A-F]{4}".*"deployment":"production","fromDomain":"teranga-tech\.com","recipients":1,"attempts":1,"id":"4ef9a417/);
    assert.doesNotMatch(log, /@|Ndiaye|Acme|booking SaaS|re_test/);
  });
});

test('legacy service labels are sent as valid Resend tags', async () => {
  const client = fakeClient(ACCEPTED);
  await captureLogs(async () => {
    const r = await contact.handleSubmission({ name: 'Moussa Diop', email: 'moussa@example.com', service: 'Maintenance & Support', message: 'Our site is down since Monday.' }, ENV, deps(client));
    assert.equal(r.status, 200);
    const tags = Object.fromEntries(client.calls[0].payload.tags.map((t) => [t.name, t.value]));
    assert.deepEqual(tags, { inquiry_type: 'contact', service: 'Maintenance___Support', lang: 'en' });
  });
});

test('provider rejections are not retried and return a generic 502', async () => {
  for (const [name, status] of [['validation_error', 403], ['invalid_from_address', 422], ['invalid_api_key', 403], ['daily_quota_exceeded', 429]]) {
    const client = fakeClient(providerError(name, status));
    await captureLogs(async (lines) => {
      const r = await contact.handleSubmission(unique(), ENV, deps(client));
      assert.equal(r.status, 502, name);
      assert.equal(r.body.message, 'Unable to send your request. Please try again later.');
      assert.equal(client.calls.length, 1, `${name} retried`);
      assert.match(lines.join('\n'), new RegExp(`"error":"${name}","status":${status}`));
      assert.doesNotMatch(lines.join('\n'), /@|Ndiaye/);
    });
  }
});

test('transient failures are retried once with the same idempotency key', async () => {
  const client = fakeClient(providerError('internal_server_error', 500), ACCEPTED);
  await captureLogs(async () => {
    const r = await contact.handleSubmission(unique(), ENV, deps(client));
    assert.equal(r.status, 200);
    assert.equal(client.calls.length, 2);
    assert.equal(client.calls[0].options.idempotencyKey, client.calls[1].options.idempotencyKey);
    assert.deepEqual(client.calls[0].payload, client.calls[1].payload);
  });
});

test('a failure that persists after the retry returns 502', async () => {
  for (const response of [providerError('rate_limit_exceeded', 429), new Error('socket hang up'), { data: null, error: null }]) {
    const client = fakeClient(response);
    await captureLogs(async () => {
      const r = await contact.handleSubmission(unique(), ENV, deps(client));
      assert.equal(r.status, 502);
      assert.equal(client.calls.length, 2);
    });
  }
});

test('each submission gets its own idempotency key', async () => {
  const client = fakeClient(ACCEPTED);
  await captureLogs(async () => {
    await contact.handleSubmission(unique(), ENV, deps(client));
    await contact.handleSubmission(unique(), ENV, deps(client));
  });
  assert.equal(client.calls.length, 2);
  assert.notEqual(client.calls[0].options.idempotencyKey, client.calls[1].options.idempotencyKey);
});

// ── Duplicate submissions ────────────────────────────────────

test('the same request sent twice is delivered once', async () => {
  const client = fakeClient(ACCEPTED);
  const body = unique();
  await captureLogs(async (lines) => {
    const first = await contact.handleSubmission(body, ENV, deps(client));
    const second = await contact.handleSubmission({ ...body, email: body.email.toUpperCase() }, ENV, deps(client));
    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.equal(second.body.message, 'Request already received.');
    assert.equal(client.calls.length, 1);
    assert.match(lines.join('\n'), /Duplicate lead not resent/);
  });
});

test('concurrent copies of a request wait for the first and send nothing extra', async () => {
  let release;
  const gate = new Promise((r) => { release = r; });
  const client = fakeClient(() => gate.then(() => ACCEPTED));
  const body = unique();
  await captureLogs(async () => {
    const pending = [1, 2, 3].map(() => contact.handleSubmission(body, ENV, deps(client)));
    release();
    const results = await Promise.all(pending);
    assert.deepEqual(results.map((r) => r.status), [200, 200, 200]);
    assert.equal(client.calls.length, 1);
  });
});

test('a request that failed is sent again when resubmitted, never reported as received', async () => {
  const client = fakeClient(providerError('validation_error', 403), ACCEPTED);
  const body = unique();
  await captureLogs(async () => {
    const first = await contact.handleSubmission(body, ENV, deps(client));
    const second = await contact.handleSubmission(body, ENV, deps(client));
    assert.equal(first.status, 502);
    assert.equal(second.status, 200);
    assert.equal(second.body.message, 'Request sent.');
    assert.equal(client.calls.length, 2);
  });
});

test('different requests from the same person are both delivered', async () => {
  const client = fakeClient(ACCEPTED);
  await captureLogs(async () => {
    await contact.handleSubmission({ ...VALID, message: 'First project: a booking SaaS.' }, ENV, deps(client));
    await contact.handleSubmission({ ...VALID, message: 'Second project: a mobile app.' }, ENV, deps(client));
  });
  assert.equal(client.calls.length, 2);
});

// ── Timeouts and environments ────────────────────────────────

test('a provider call that hangs is cut off and retried, then reported as a failure', async () => {
  const calls = [];
  const client = { emails: { send: (payload, options) => { calls.push(options); return new Promise(() => {}); } } };
  await captureLogs(async (lines) => {
    const started = Date.now();
    const r = await contact.handleSubmission(unique(), ENV, deps(client, { timeoutMs: 30 }));
    assert.equal(r.status, 502);
    assert.ok(Date.now() - started < 2000, 'bounded');
    assert.equal(calls.length, 2);
    assert.ok(calls.every((o) => o.signal && o.signal.aborted), 'requests aborted');
    assert.equal(calls[0].idempotencyKey, calls[1].idempotencyKey);
    assert.match(lines.join('\n'), /"attempts":2.*"error":"timeout"/);
  });
});

test('a slow first attempt followed by acceptance succeeds', async () => {
  let call = 0;
  const client = fakeClient(() => (++call === 1 ? new Promise(() => {}) : ACCEPTED));
  await captureLogs(async () => {
    const r = await contact.handleSubmission(unique(), ENV, deps(client, { timeoutMs: 30 }));
    assert.equal(r.status, 200);
    assert.equal(client.calls.length, 2);
    assert.equal(client.calls[0].options.idempotencyKey, client.calls[1].options.idempotencyKey);
  });
});

test('preview and local submissions are marked as tests; production ones are not', async () => {
  const cases = [
    [{ VERCEL_ENV: 'preview' }, /^\[TEST · preview\] New Teranga Technologies Inquiry — /, /Vercel preview deployment/, true],
    [{ VERCEL: '', VERCEL_ENV: '' }, /^\[TEST · local\] New Teranga Technologies Inquiry — /, /local development server/, true],
    [{ VERCEL_ENV: '' }, /^New Teranga Technologies Inquiry — /, /environment not reported/, false],
  ];
  for (const [patch, subject, site, isTest] of cases) {
    const client = fakeClient(ACCEPTED);
    await captureLogs(async () => {
      await contact.handleSubmission(unique(), { ...ENV, ...patch }, deps(client));
    });
    const { payload } = client.calls[0];
    assert.match(payload.subject, subject, JSON.stringify(patch));
    assert.match(payload.text, site);
    assert.equal(/^TEST SUBMISSION — not a real lead/.test(payload.text), isTest);
    assert.equal(/not a real lead/.test(payload.html), isTest);
  }
});

test('the HTML notification is a complete branded document with a hidden preview line', () => {
  const v = contact.validate({ ...VALID, message: 'Line one\nLine <two>' });
  const mail = contact.buildEmail(v.data, { ref: 'TT-20261022-ABCD', received: new Date('2026-10-22T09:05:00Z'), deployment: 'production' });
  assert.match(mail.html, /^<!DOCTYPE html>/);
  assert.match(mail.html, />Teranga Technologies<\/div>/);
  assert.match(mail.html, /New inquiry — SaaS development/);
  assert.match(mail.html, /display:none[^>]*>SaaS development — Acme SA: Line one Line &lt;two&gt;/);
  assert.match(mail.html, /white-space:pre-wrap">Line one\nLine &lt;two&gt;<\/div>/);
  assert.doesNotMatch(mail.html, /<img|<script|\ssrc=/i, 'no remote images or scripts');
});
