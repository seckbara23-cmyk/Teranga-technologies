// Lead report: reads a CSV or TSV export of the private lead tracker and prints the funnel,
// channel, service and response-time figures as Markdown (docs/TERANGA-05A-lead-operations.md).
// No dependencies; nothing is sent anywhere.
//
//   node scripts/lead-report.mjs tracker.csv [--from 2026-10-01] [--to 2026-10-31] [--visitors 1840] [--form-starts 60] [--json]
//
// --visitors is the visitor count for the same period, read from Vercel Web Analytics, and
// --form-starts the contact_form_start count (Vercel, Pro plan only). Without them no rate that
// needs them is printed: clicks and page views are never counted as leads. Rates mixing the
// tracker and Vercel are labelled as such: the two cannot be joined visitor by visitor.
// The output lists references only (for rows that need fixing), never names, companies or messages.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON'];
export const STATUSES = [...STAGES, 'LOST', 'SPAM'];
const REQUIRED = ['Reference', 'Submitted (UTC)', 'Service', 'Language', 'Channel', 'Source', 'Status'];

/** Minimal RFC 4180 parser (quoted fields, doubled quotes, CRLF); tab-separated if the header has a tab. */
export function parseTable(text) {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text; // byte-order mark from spreadsheet exports
  const firstLine = src.split(/\r?\n/, 1)[0];
  const sep = firstLine.includes('\t') ? '\t' : ',';
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"' && cell === '') quoted = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const nonEmpty = rows.filter((r) => r.some((c) => c.trim() !== ''));
  if (!nonEmpty.length) return [];
  const header = nonEmpty[0].map((h) => h.trim());
  const missing = REQUIRED.filter((h) => !header.includes(h));
  if (missing.length) throw new Error(`Missing column(s): ${missing.join(', ')}`);
  return nonEmpty.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] || '').trim()])));
}

/** "2026-10-22 09:05 UTC" or an ISO date → Date, or null. */
export function parseUtc(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(value || '');
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0)));
  return Number.isNaN(d.getTime()) ? null : d;
}

// How far a lead got. A LOST lead reached the stage in "Lost at" (CONTACTED when not given).
function stageIndex(r) {
  if (r.Status === 'LOST') {
    const at = STAGES.indexOf((r['Lost at'] || '').toUpperCase());
    return at > 0 ? at : 1;
  }
  return STAGES.indexOf(r.Status);
}

const pct = (n, d) => (d ? Math.round((n / d) * 1000) / 10 : null);

function median(values) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function breakdown(leads, key) {
  const groups = new Map();
  for (const r of leads) {
    const k = r[key] || '(not set)';
    const g = groups.get(k) || { leads: 0, qualified: 0, won: 0 };
    g.leads++;
    if (stageIndex(r) >= 2) g.qualified++;
    if (r.Status === 'WON') g.won++;
    groups.set(k, g);
  }
  return [...groups.entries()].map(([name, g]) => ({ name, ...g })).sort((a, b) => b.leads - a.leads || a.name.localeCompare(b.name));
}

export const OPEN = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL'];
const DAY = 86400000;
const startOfDay = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

/**
 * The pipeline as it stands at `now`, over every valid row (not only the period): what needs a
 * reply, which next steps are overdue or missing, what has gone quiet, and who holds what.
 * The owner's stages map onto the tracker without new statuses (docs/TERANGA-05C-lead-operations.md).
 */
export function operations(rows, now = new Date()) {
  const today = startOfDay(now);
  const seen = new Set();
  const valid = [];
  for (const raw of rows) {
    const r = { ...raw, Status: (raw.Status || '').toUpperCase() };
    const at = parseUtc(r['Submitted (UTC)']);
    if (!at || !STATUSES.includes(r.Status) || seen.has(r.Reference)) continue;
    seen.add(r.Reference);
    valid.push({ ...r, at });
  }
  const open = valid.filter((r) => OPEN.includes(r.Status));
  const hours = (d) => Math.round(((now - d) / 3600000) * 10) / 10;
  const awaitingReply = open
    .filter((r) => r.Status === 'NEW' && !parseUtc(r['First reply (UTC)']))
    .map((r) => ({ ref: r.Reference, hours: hours(r.at), overdue: now - r.at > DAY }))
    .sort((a, b) => b.hours - a.hours);
  const overdueActions = open
    .filter((r) => { const d = parseUtc(r['Next action date']); return d && d < today; })
    .map((r) => ({ ref: r.Reference, due: r['Next action date'], action: r['Next action'] || '' }))
    .sort((a, b) => a.due.localeCompare(b.due));
  const missingNextStep = open
    .filter((r) => r.Status !== 'NEW' && !parseUtc(r['Next action date']))
    .map((r) => r.Reference);
  const stale = open
    .map((r) => ({ r, last: [parseUtc(r['Last contact (UTC)']), parseUtc(r['First reply (UTC)']), r.at].filter(Boolean).reduce((a, b) => (b > a ? b : a)) }))
    .filter(({ last }) => now - last > 14 * DAY)
    .map(({ r, last }) => ({ ref: r.Reference, days: Math.floor((now - last) / DAY) }));
  const discoveryScheduled = valid.filter((r) => { const d = parseUtc(r['Discovery date']); return d && d >= today && OPEN.includes(r.Status); }).length;
  const owners = new Map();
  for (const r of open) owners.set(r.Owner || '(unassigned)', (owners.get(r.Owner || '(unassigned)') || 0) + 1);
  const count = (fn) => valid.filter(fn).length;
  return {
    asOf: now.toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
    stages: [
      ['New inquiry (NEW, no reply yet)', awaitingReply.length],
      ['Needs review (CONTACTED, waiting for details)', count((r) => r.Status === 'CONTACTED')],
      ['Qualified (QUALIFIED, no call scheduled)', count((r) => r.Status === 'QUALIFIED' && !(parseUtc(r['Discovery date']) >= today))],
      ['Discovery scheduled (Discovery date today or later)', discoveryScheduled],
      ['Proposal sent (PROPOSAL)', count((r) => r.Status === 'PROPOSAL')],
      ['Won', count((r) => r.Status === 'WON')],
      ['Lost', count((r) => r.Status === 'LOST')],
      ['Closed as spam or irrelevant (SPAM)', count((r) => r.Status === 'SPAM')],
    ],
    open: open.length,
    awaitingReply,
    overdueActions,
    missingNextStep,
    stale,
    byOwner: [...owners.entries()].map(([owner, n]) => ({ owner, open: n })).sort((a, b) => b.open - a.open || a.owner.localeCompare(b.owner)),
  };
}

/** Figures for the rows submitted between from and to (inclusive, UTC dates). */
export function summarize(rows, { from, to, visitors, formStarts, now, analytics } = {}) {
  // Weekly analytics (scripts/analytics-report.mjs --json) fill in what the command line did not give.
  if (analytics) {
    if (visitors === undefined && analytics.visitors > 0) visitors = analytics.visitors;
    if (formStarts === undefined && analytics.events && analytics.events.contact_form_start > 0) formStarts = analytics.events.contact_form_start;
  }
  const lo = from ? parseUtc(from) : null;
  const hi = to ? new Date(parseUtc(to).getTime() + 86400000) : null;
  const problems = [];
  const inRange = [];
  const seen = new Set();
  for (const raw of rows) {
    const r = { ...raw, Status: (raw.Status || '').toUpperCase() };
    const at = parseUtc(r['Submitted (UTC)']);
    if (!at) { problems.push(`${r.Reference || '(no reference)'}: unreadable "Submitted (UTC)"`); continue; }
    if ((lo && at < lo) || (hi && at >= hi)) continue;
    if (!STATUSES.includes(r.Status)) { problems.push(`${r.Reference}: unknown status "${raw.Status}"`); continue; }
    if (seen.has(r.Reference)) { problems.push(`${r.Reference}: duplicate row ignored`); continue; }
    seen.add(r.Reference);
    inRange.push({ ...r, at });
  }
  const spam = inRange.filter((r) => r.Status === 'SPAM');
  const leads = inRange.filter((r) => r.Status !== 'SPAM');
  const reached = STAGES.map((_, i) => leads.filter((r) => stageIndex(r) >= i).length);
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, inRange.filter((r) => r.Status === s).length]));
  const won = byStatus.WON;
  const lost = byStatus.LOST;

  const replyHours = [];
  for (const r of leads) {
    const reply = parseUtc(r['First reply (UTC)']);
    if (reply && reply >= r.at) replyHours.push((reply - r.at) / 3600000);
  }

  const months = new Map();
  for (const r of leads) {
    const m = r.at.toISOString().slice(0, 7);
    months.set(m, (months.get(m) || 0) + 1);
  }

  const asOf = now ? new Date(now) : new Date();
  const v = Number(visitors);
  const fs0 = Number(formStarts);
  const per100 = (n, d) => (d > 0 ? Math.round((n / d) * 10000) / 100 : null);
  return {
    period: { from: from || null, to: to || null },
    rows: inRange.length,
    leads: leads.length,
    spam: spam.length,
    spamShare: pct(spam.length, inRange.length),
    byStatus,
    funnel: STAGES.map((stage, i) => ({ stage, reached: reached[i], rate: pct(reached[i], leads.length) })),
    open: byStatus.NEW + byStatus.CONTACTED + byStatus.QUALIFIED + byStatus.PROPOSAL,
    winRateOfDecided: pct(won, won + lost),
    response: {
      measured: replyHours.length,
      medianHours: replyHours.length ? Math.round(median(replyHours) * 10) / 10 : null,
      meanHours: replyHours.length ? Math.round((replyHours.reduce((a, b) => a + b, 0) / replyHours.length) * 10) / 10 : null,
      within24h: pct(replyHours.filter((h) => h <= 24).length, replyHours.length),
    },
    byChannel: breakdown(leads, 'Channel'),
    bySource: breakdown(leads, 'Source'),
    byService: breakdown(leads, 'Service'),
    byLanguage: breakdown(leads, 'Language'),
    byEntry: breakdown(leads, 'Entry page'),
    byMonth: [...months.entries()].sort().map(([month, n]) => ({ month, leads: n })),
    qualificationRate: pct(reached[2], leads.length),
    visitors: v > 0 ? v : null,
    formStarts: fs0 > 0 ? fs0 : null,
    leadRate: per100(leads.length, v),
    qualifiedRate: per100(reached[2], v),
    formStartRate: v > 0 && fs0 > 0 ? pct(fs0, v) : null,
    formCompletion: fs0 > 0 ? pct(leads.length, fs0) : null,
    // Held = a discovery date in the period that is already past (a future date is only scheduled).
    discoveryHeld: leads.filter((r) => { const d = parseUtc(r['Discovery date']); return d && d < asOf && (!lo || d >= lo) && (!hi || d < hi); }).length,
    operations: operations(rows, asOf),
    analytics: analytics ? { period: analytics.period, pageviews: analytics.pageviews, events: analytics.events, failureReasons: analytics.failureReasons || [], unavailable: analytics.unavailable || [] } : null,
    problems,
  };
}

const fmt = (n) => (n == null ? '—' : `${n}%`);

function table(head, rows) {
  return [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');
}

const cellText = (s) => String(s).replace(/\|/g, '\\|');

function renderOperations(o, discoveryHeld) {
  const refs = (list) => (list.length ? list.join(', ') : 'none');
  return [
    `## Actions this week (pipeline as of ${o.asOf})`,
    '',
    table(['Stage', 'Leads now'], o.stages),
    '',
    `- **Awaiting a first reply:** ${o.awaitingReply.length ? o.awaitingReply.map((a) => `${a.ref} (${a.hours} h${a.overdue ? ', over the one-business-day target' : ''})`).join(', ') : 'none'}`,
    `- **Overdue next actions:** ${o.overdueActions.length ? o.overdueActions.map((a) => `${a.ref} (due ${a.due}${a.action ? `: ${cellText(a.action)}` : ''})`).join(', ') : 'none'}`,
    `- **Open leads without a next action date:** ${refs(o.missingNextStep)}`,
    `- **No activity for 14+ days:** ${o.stale.length ? o.stale.map((a) => `${a.ref} (${a.days} d)`).join(', ') : 'none'}`,
    `- **Discovery calls held in the period:** ${discoveryHeld} (from "Discovery date")`,
    `- **Open leads by owner:** ${o.byOwner.length ? o.byOwner.map((b) => `${cellText(b.owner)} ${b.open}`).join(', ') : 'none'}`,
    '',
  ];
}

function renderEngagement(a) {
  const ev = a.events || {};
  const n = (k) => (a.events ? ev[k] || 0 : '—');
  return [
    `## Website engagement (Vercel Web Analytics, ${a.period ? `${a.period.from} → ${a.period.to}` : 'period of the analytics file'})`,
    '',
    'Interactions recorded by the page, not leads. A success event means the server accepted a request; the tracker is still the count of leads.',
    '',
    table(['Measure', 'Count'], [
      ['Page views', a.pageviews == null ? '—' : a.pageviews],
      ['Service CTA clicks', n('service_cta_click')],
      ['Case-study clicks', n('case_study_click')],
      ['Contact form starts', n('contact_form_start')],
      ['Form fields flagged by the page', n('contact_form_validation_error')],
      ['Requests accepted (lead_submit_success)', n('lead_submit_success')],
      ['Requests that failed (lead_submit_failure)', `${n('lead_submit_failure')}${a.failureReasons.length ? ` (${a.failureReasons.map((f) => `${f.name} ${f.count}`).join(', ')})` : ''}`],
      ['WhatsApp / email link clicks', `${n('whatsapp_click')} / ${n('email_click')}`],
    ]),
    '',
    ...(a.unavailable.length ? [`Unavailable: ${a.unavailable.map(cellText).join('; ')}.`, ''] : []),
  ];
}

/** Markdown report. */
export function render(s) {
  const period = s.period.from || s.period.to ? `${s.period.from || 'start'} → ${s.period.to || 'today'}` : 'all rows';
  const groups = (title, list) => `### ${title}\n\n${table(['', 'Leads', 'Qualified', 'Won'], list.map((g) => [cellText(g.name), g.leads, g.qualified, g.won]))}`;
  const out = [
    `# Lead report — ${period}`,
    '',
    'Source of truth: the private lead tracker (one row per notification accepted by Resend). Analytics events are not counted as leads.',
    '',
    '## Summary',
    '',
    table(['Measure', 'Value', 'From'], [
      ['Accepted leads (excluding spam)', s.leads, 'Tracker'],
      ['Spam rows', `${s.spam} (${fmt(s.spamShare)} of rows)`, 'Tracker'],
      ['Qualification rate (reached QUALIFIED ÷ leads)', fmt(s.qualificationRate), 'Tracker'],
      ['Open pipeline (NEW → PROPOSAL)', s.open, 'Tracker'],
      ['Won', s.byStatus.WON, 'Tracker'],
      ['Lost', s.byStatus.LOST, 'Tracker'],
      ['Win rate of decided leads (WON ÷ (WON + LOST))', fmt(s.winRateOfDecided), 'Tracker'],
      ['First reply, median', s.response.medianHours == null ? '— (fill "First reply (UTC)")' : `${s.response.medianHours} h over ${s.response.measured} lead(s)`, 'Tracker'],
      ['First reply, average', s.response.meanHours == null ? '—' : `${s.response.meanHours} h`, 'Tracker'],
      ['First reply within 24 h', fmt(s.response.within24h), 'Tracker'],
      ['Visitors (--analytics or --visitors)', s.visitors == null ? '— not provided' : s.visitors, 'Vercel Web Analytics'],
      ['Contact form starts (--analytics or --form-starts)', s.formStarts == null ? '— not provided' : s.formStarts, 'Vercel events'],
      ['Leads per 100 visitors', s.leadRate == null ? '—' : s.leadRate, 'Tracker ÷ Vercel, not joined'],
      ['Qualified leads per 100 visitors', s.qualifiedRate == null ? '—' : s.qualifiedRate, 'Tracker ÷ Vercel, not joined'],
      ['Form-start rate (starts ÷ visitors)', fmt(s.formStartRate), 'Vercel'],
      ['Form completion (leads ÷ form starts)', fmt(s.formCompletion), 'Tracker ÷ Vercel, not joined'],
    ]),
    '',
    'Rates that divide tracker counts by Vercel counts compare two systems for the same period; they are indicative (ad blockers hide some visits and events from Vercel, never leads from the tracker).',
    '',
    ...renderOperations(s.operations, s.discoveryHeld),
    ...(s.analytics ? renderEngagement(s.analytics) : []),
    '## Funnel (leads that reached each stage)',
    '',
    table(['Stage', 'Reached', 'Share of leads'], s.funnel.map((f) => [f.stage, f.reached, fmt(f.rate)])),
    '',
    'A LOST lead counts as having reached the stage in its "Lost at" column (CONTACTED when empty).',
    '',
    '## Where leads come from',
    '',
    groups('By channel', s.byChannel),
    '',
    groups('By source', s.bySource),
    '',
    groups('By entry page', s.byEntry),
    '',
    '## What they ask for',
    '',
    groups('By service', s.byService),
    '',
    groups('By language', s.byLanguage),
    '',
    '### By month',
    '',
    table(['Month', 'Leads'], s.byMonth.map((m) => [m.month, m.leads])),
  ];
  if (s.problems.length) out.push('', '## Rows to fix in the tracker', '', ...s.problems.map((p) => `- ${p}`));
  return `${out.join('\n')}\n`;
}

function args(argv) {
  const o = { file: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') o.json = true;
    else if (['--from', '--to', '--visitors'].includes(a)) o[a.slice(2)] = argv[++i];
    else if (a === '--form-starts') o.formStarts = argv[++i];
    else if (a === '--now') o.now = argv[++i];
    else if (a === '--analytics') o.analytics = JSON.parse(fs.readFileSync(argv[++i], 'utf8'));
    else if (!a.startsWith('--')) o.file = a;
    else throw new Error(`Unknown option ${a}`);
  }
  for (const k of ['from', 'to']) if (o[k] && !parseUtc(o[k])) throw new Error(`--${k} must be a date like 2026-10-01`);
  if (o.now !== undefined && Number.isNaN(new Date(o.now).getTime())) throw new Error('--now must be a date or ISO time');
  if (o.visitors !== undefined && !(Number(o.visitors) > 0)) throw new Error('--visitors must be a positive number');
  if (o.formStarts !== undefined && !(Number(o.formStarts) > 0)) throw new Error('--form-starts must be a positive number');
  return o;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const o = args(process.argv.slice(2));
    if (!o.file) throw new Error('Usage: node scripts/lead-report.mjs tracker.csv [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--analytics week.json] [--visitors N] [--form-starts N] [--now ISO] [--json]');
    const s = summarize(parseTable(fs.readFileSync(o.file, 'utf8')), o);
    process.stdout.write(o.json ? `${JSON.stringify(s, null, 2)}\n` : render(s));
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    process.exitCode = 1;
  }
}
