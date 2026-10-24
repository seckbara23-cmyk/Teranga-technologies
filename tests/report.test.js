// The lead report script: parsing tracker exports, funnel and channel figures, privacy of the output.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { TRACKER_COLUMNS } = require('../api/_lib/contact');

const root = path.join(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8').replace(/\r\n/g, '\n');
const SAMPLE = 'docs/samples/lead-tracker-sample.csv';
const OPTS = { from: '2026-09-01', to: '2026-10-31', visitors: 1840, formStarts: 64 };

let report;
test.before(async () => { report = await import('../scripts/lead-report.mjs'); });

test('the tracker columns written by the notification are the ones the report reads', () => {
  const header = read(SAMPLE).split('\n')[0].split(',');
  assert.deepEqual(header.slice(0, TRACKER_COLUMNS.length), TRACKER_COLUMNS);
  assert.deepEqual(report.STATUSES, ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST', 'SPAM']);
});

test('CSV exports with quotes, commas, CRLF and a byte-order mark are parsed; TSV too', () => {
  const head = 'Reference,Submitted (UTC),Company,Service,Language,Channel,Source,Status';
  const csv = String.fromCharCode(0xfeff) + `${head}\r\nTT-20261001-AAAA,2026-10-01 09:00 UTC,"Acme, ""Dakar""",SaaS development,FR,direct,,NEW\r\n\r\n`;
  const rows = report.parseTable(csv);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].Company, 'Acme, "Dakar"');
  assert.equal(rows[0].Status, 'NEW');
  const tsv = `${head.replace(/,/g, '\t')}\nTT-20261001-BBBB\t2026-10-01 09:00 UTC\tA, B\tAI integration\tEN\treferral\twww.google.com\tWON\n`;
  assert.equal(report.parseTable(tsv)[0].Company, 'A, B');
  assert.throws(() => report.parseTable('Reference,Status\nTT-1,NEW\n'), /Missing column\(s\): Submitted \(UTC\)/);
});

test('funnel, pipeline, response time and rates are computed from the tracker', () => {
  const s = report.summarize(report.parseTable(read(SAMPLE)), OPTS);
  assert.equal(s.rows, 12);
  assert.equal(s.leads, 10);
  assert.equal(s.spam, 2);
  assert.deepEqual(s.funnel.map((f) => [f.stage, f.reached]), [['NEW', 10], ['CONTACTED', 9], ['QUALIFIED', 6], ['PROPOSAL', 3], ['WON', 1]]);
  assert.equal(s.open, 7);
  assert.equal(s.winRateOfDecided, 33.3);
  assert.deepEqual(s.response, { measured: 9, medianHours: 5.6, meanHours: 11.4, within24h: 88.9 });
  assert.equal(s.qualificationRate, 60);
  assert.equal(s.leadRate, 0.54);
  assert.equal(s.qualifiedRate, 0.33);
  assert.equal(s.formStartRate, 3.5);
  assert.equal(s.formCompletion, 15.6);
  assert.deepEqual(s.byChannel.map((g) => [g.name, g.leads, g.qualified, g.won]), [['campaign', 4, 4, 0], ['direct', 3, 1, 0], ['referral', 3, 1, 1]]);
  assert.deepEqual(s.byMonth, [{ month: '2026-09', leads: 5 }, { month: '2026-10', leads: 5 }]);
  assert.deepEqual(s.problems, []);
});

test('no visitor or form-start count means no rate that needs one: clicks and views are never treated as leads', () => {
  const s = report.summarize(report.parseTable(read(SAMPLE)), { from: OPTS.from, to: OPTS.to });
  assert.equal(s.visitors, null);
  assert.equal(s.leadRate, null);
  assert.equal(s.formStartRate, null);
  assert.equal(s.formCompletion, null);
  const md = report.render(s);
  assert.match(md, /\| Leads per 100 visitors \| — \| Tracker ÷ Vercel, not joined \|/);
  assert.match(md, /\| Form completion \(leads ÷ form starts\) \| — \|/);
  // The lead count comes from the tracker only, whatever analytics say.
  assert.equal(report.summarize(report.parseTable(read(SAMPLE)), { ...OPTS, formStarts: 5 }).leads, 10);
});

test('the date range is inclusive and bad rows are listed by reference only', () => {
  const head = 'Reference,Submitted (UTC),Company,Service,Language,Channel,Source,Status';
  const rows = report.parseTable([
    head,
    'TT-20261001-AAAA,2026-10-01 00:00 UTC,Secret Co,SaaS development,FR,direct,,NEW',
    'TT-20261031-BBBB,2026-10-31 23:59 UTC,Secret Co,SaaS development,FR,direct,,WON',
    'TT-20261101-CCCC,2026-11-01 00:00 UTC,Secret Co,SaaS development,FR,direct,,NEW',
    'TT-20261015-DDDD,2026-10-15 10:00 UTC,Secret Co,SaaS development,FR,direct,,MAYBE',
    'TT-20261015-EEEE,someday,Secret Co,SaaS development,FR,direct,,NEW',
    'TT-20261001-AAAA,2026-10-01 00:00 UTC,Secret Co,SaaS development,FR,direct,,NEW',
  ].join('\n'));
  const s = report.summarize(rows, { from: '2026-10-01', to: '2026-10-31' });
  assert.equal(s.leads, 2);
  assert.deepEqual(s.problems, [
    'TT-20261015-DDDD: unknown status "MAYBE"',
    'TT-20261015-EEEE: unreadable "Submitted (UTC)"',
    'TT-20261001-AAAA: duplicate row ignored',
  ]);
  const md = report.render(s);
  assert.doesNotMatch(md, /Secret Co/, 'company names never appear in the report');
});

const ANALYTICS_SAMPLE = 'docs/samples/analytics-sample.json';
const NOW = '2026-10-24T12:00:00Z';

test('the sample report in docs is what the script produces from the synthetic tracker and analytics', () => {
  const analytics = JSON.parse(read(ANALYTICS_SAMPLE));
  assert.equal(analytics.synthetic, true, 'the analytics sample is marked synthetic');
  const s = report.summarize(report.parseTable(read(SAMPLE)), { from: OPTS.from, to: OPTS.to, analytics, now: NOW });
  const sample = read('docs/samples/lead-report-sample.md');
  assert.match(sample, /^<!-- SYNTHETIC SAMPLE/);
  assert.ok(sample.endsWith(report.render(s)), 'regenerate docs/samples/lead-report-sample.md');
  for (const line of read(SAMPLE).split('\n').slice(1).filter(Boolean)) assert.match(line, /SYNTHETIC SAMPLE ROW$/);
});

test('operations: replies due, overdue and missing next steps, stale leads, owners, the owner\'s pipeline stages', () => {
  const o = report.operations(report.parseTable(read(SAMPLE)), new Date(NOW));
  assert.deepEqual(o.awaitingReply, [{ ref: 'TT-20261009-A109', hours: 360.8, overdue: true }]);
  assert.deepEqual(o.overdueActions.map((a) => a.ref), ['TT-20260905-A102', 'TT-20261020-A112']);
  assert.deepEqual(o.missingNextStep, ['TT-20260912-A104']);
  assert.deepEqual(o.stale, [{ ref: 'TT-20260912-A104', days: 40 }, { ref: 'TT-20261009-A109', days: 15 }]);
  assert.deepEqual(o.byOwner, [{ owner: 'Owner A', open: 4 }, { owner: 'Owner B', open: 2 }, { owner: '(unassigned)', open: 1 }]);
  assert.deepEqual(o.stages.map((s) => s[1]), [1, 2, 1, 1, 2, 1, 2, 2], 'New, Needs review, Qualified, Discovery scheduled, Proposal, Won, Lost, Spam');
  assert.equal(o.open, 7);
  // A discovery date after "now" is scheduled, not held.
  const s = report.summarize(report.parseTable(read(SAMPLE)), { ...OPTS, now: NOW });
  assert.equal(s.discoveryHeld, 4);
  assert.doesNotMatch(report.render(s), /Sample Clinic|Sample School|Sample Bank/, 'references only, no company names');
});

test('analytics fill visitors and form starts unless the command line gives them', () => {
  const analytics = JSON.parse(read(ANALYTICS_SAMPLE));
  const rows = report.parseTable(read(SAMPLE));
  const merged = report.summarize(rows, { from: OPTS.from, to: OPTS.to, analytics, now: NOW });
  assert.equal(merged.visitors, 1840);
  assert.equal(merged.formStarts, 64);
  assert.equal(merged.leads, 10, 'leads come from the tracker, never from events');
  const explicit = report.summarize(rows, { ...OPTS, visitors: 999, analytics, now: NOW });
  assert.equal(explicit.visitors, 999);
  assert.match(report.render(merged), /Interactions recorded by the page, not leads/);
});

test('analytics report: aggregates, language split, sorting, and failed queries shown as unavailable (never zero)', async () => {
  const wa = await import('../scripts/analytics-report.mjs');
  const calls = [];
  const fakeApi = async (p) => {
    calls.push(p);
    const q = new URLSearchParams(p.split('?')[1]);
    const by = q.get('by');
    const filter = q.get('filter');
    assert.match(filter, /^environment eq 'production'/, 'production only');
    if (by === 'utmSource') throw new Error('UTM dimensions require the Web Analytics Plus add-on (402)');
    const data = {
      environment: [{ environment: 'production', pageviews: 40, visitors: 9 }],
      requestPath: [{ requestPath: '/fr/contact', pageviews: 4, visitors: 2 }, { requestPath: '/', pageviews: 20, visitors: 8 }, { requestPath: '/fr', pageviews: 6, visitors: 3 }, { requestPath: '/services', pageviews: 10, visitors: 5 }],
      referrerHostname: [{ referrerHostname: '', pageviews: 30, visitors: 7 }, { referrerHostname: 'www.google.com', pageviews: 10, visitors: 2 }],
      deviceType: [{ deviceType: 'mobile', pageviews: 25, visitors: 6 }],
      eventName: [{ eventName: 'service_cta_click', count: 5 }, { eventName: 'contact_form_start', count: 3 }, { eventName: 'lead_submit_failure', count: 1 }],
      'eventData/service': [{ 'eventData/service': 'ai', count: 3 }, { 'eventData/service': 'saas', count: 2 }],
      'eventData/reason': [{ 'eventData/reason': 'rejected', count: 1 }],
    }[by] || [];
    return { data };
  };
  const s = await wa.collect(fakeApi, { from: '2026-10-19', to: '2026-10-25' });
  assert.equal(s.pageviews, 40);
  assert.equal(s.visitors, 9);
  assert.deepEqual(s.languages, { en: 30, fr: 10 });
  assert.deepEqual(s.topPages.map((p) => p.name), ['/', '/services', '/fr', '/fr/contact']);
  assert.equal(s.referrers[0].name, '(direct or none)');
  assert.equal(s.events.service_cta_click, 5);
  assert.equal(s.events.lead_submit_success, 0);
  assert.equal(s.campaigns, null);
  assert.equal(s.unavailable.length, 1);
  assert.match(s.unavailable[0], /Web Analytics Plus/);
  assert.ok(calls.every((c) => c.includes('since=2026-10-19T00%3A00%3A00.000Z') && c.includes('until=2026-10-25T23%3A59%3A59.999Z')));
  const md = wa.render(s);
  assert.match(md, /Events are interactions, not leads/);
  assert.match(md, /Campaigns \(utm_source\): unavailable/);
  assert.match(md, /\*\*Submission failures\*\* by reason: rejected 1/);
  // A query that fails is "unavailable", not zero.
  const down = await wa.collect(async () => { throw new Error('network down'); }, { from: '2026-10-19', to: '2026-10-25' });
  assert.equal(down.pageviews, null);
  assert.equal(down.events, null);
  assert.match(wa.render(down), /\| Page views \| — unavailable \|/);
});
