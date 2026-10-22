// HTTP behaviour of the Vercel function (api/contact.js).
const test = require('node:test');
const assert = require('node:assert/strict');
const handler = require('../api/contact');

const VALID = {
  name: 'Awa Ndiaye',
  email: 'awa@example.com',
  service: 'ai',
  message: 'We want to automate document intake.',
};

function call({ method = 'POST', body = VALID, ip = '203.0.113.10', headers = {} } = {}) {
  const res = {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.body = obj; return this; },
    end() { return this; },
  };
  const req = { method, body, headers: { 'x-forwarded-for': ip, ...headers }, socket: {} };
  return Promise.resolve(handler(req, res)).then(() => res);
}

// No Resend settings in tests: a valid request reaches the mail step and stops with 503.
const ENV_KEYS = ['RESEND_API_KEY', 'RESEND_FROM_EMAIL', 'LEAD_NOTIFICATION_EMAIL', 'ALLOWED_ORIGIN'];
const saved = {};
const consoleError = console.error;
test.beforeEach(() => {
  handler._test.hits.clear();
  for (const k of ENV_KEYS) { saved[k] = process.env[k]; delete process.env[k]; }
  console.error = () => {};
});
test.afterEach(() => {
  for (const k of ENV_KEYS) if (saved[k] !== undefined) process.env[k] = saved[k];
  console.error = consoleError;
});

test('GET is refused with 405 and an Allow header', async () => {
  const res = await call({ method: 'GET' });
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.allow, 'POST, OPTIONS');
  assert.equal(res.headers['cache-control'], 'no-store');
});

test('OPTIONS answers 204', async () => {
  assert.equal((await call({ method: 'OPTIONS' })).statusCode, 204);
});

test('no CORS header unless ALLOWED_ORIGIN is set', async () => {
  assert.equal((await call()).headers['access-control-allow-origin'], undefined);
  process.env.ALLOWED_ORIGIN = 'https://teranga-tech.com';
  assert.equal((await call()).headers['access-control-allow-origin'], 'https://teranga-tech.com');
});

test('JSON sent as a string is parsed; malformed JSON is a 400', async () => {
  assert.equal((await call({ body: JSON.stringify(VALID) })).statusCode, 503);
  const bad = await call({ body: '{"name":' });
  assert.equal(bad.statusCode, 400);
  assert.equal(bad.body.message, 'Invalid JSON.');
});

test('invalid input is a 400 with a field message', async () => {
  const res = await call({ body: { ...VALID, email: 'nope' } });
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /valid email/);
});

test('missing Resend settings give a generic 503', async () => {
  const res = await call();
  assert.equal(res.statusCode, 503);
  assert.equal(res.body.message, 'Unable to send your request. Please try again later.');
});

test('the sixth request from one IP in the window is rate-limited', async () => {
  for (let i = 1; i <= 5; i++) assert.notEqual((await call()).statusCode, 429, `request ${i}`);
  const sixth = await call();
  assert.equal(sixth.statusCode, 429);
  assert.equal(sixth.headers['retry-after'], '600');
  assert.notEqual((await call({ ip: '198.51.100.7' })).statusCode, 429, 'other IPs are unaffected');
});

test('the rate-limit key is the first forwarded address', () => {
  const ip = handler._test.clientIp({ headers: { 'x-forwarded-for': '203.0.113.5, 10.0.0.1' } });
  assert.equal(ip, '203.0.113.5');
});
