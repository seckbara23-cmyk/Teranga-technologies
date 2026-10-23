// Lead report: reads a CSV or TSV export of the private lead tracker and prints the funnel,
// channel, service and response-time figures as Markdown (docs/TERANGA-05A-lead-operations.md).
// No dependencies; nothing is sent anywhere.
//
//   node scripts/lead-report.mjs tracker.csv [--from 2026-10-01] [--to 2026-10-31] [--visitors 1840] [--json]
//
// --visitors is the visitor count for the same period, read from Vercel Web Analytics. Without it
// no conversion rate is printed: clicks and page views are never counted as leads.
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

/** Figures for the rows submitted between from and to (inclusive, UTC dates). */
export function summarize(rows, { from, to, visitors } = {}) {
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

  const v = Number(visitors);
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
      within24h: pct(replyHours.filter((h) => h <= 24).length, replyHours.length),
    },
    byChannel: breakdown(leads, 'Channel'),
    bySource: breakdown(leads, 'Source'),
    byService: breakdown(leads, 'Service'),
    byLanguage: breakdown(leads, 'Language'),
    byEntry: breakdown(leads, 'Entry page'),
    byMonth: [...months.entries()].sort().map(([month, n]) => ({ month, leads: n })),
    visitors: v > 0 ? v : null,
    leadRate: v > 0 ? Math.round((leads.length / v) * 10000) / 100 : null,
    qualifiedRate: v > 0 ? Math.round((reached[2] / v) * 10000) / 100 : null,
    problems,
  };
}

const fmt = (n) => (n == null ? '—' : `${n}%`);

function table(head, rows) {
  return [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');
}

const cellText = (s) => String(s).replace(/\|/g, '\\|');

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
    table(['Measure', 'Value'], [
      ['Leads (excluding spam)', s.leads],
      ['Spam rows', `${s.spam} (${fmt(s.spamShare)} of rows)`],
      ['Open pipeline (NEW → PROPOSAL)', s.open],
      ['Won', s.byStatus.WON],
      ['Lost', s.byStatus.LOST],
      ['Win rate of decided leads (WON ÷ (WON + LOST))', fmt(s.winRateOfDecided)],
      ['First reply, median', s.response.medianHours == null ? '— (fill "First reply (UTC)")' : `${s.response.medianHours} h over ${s.response.measured} lead(s)`],
      ['First reply within 24 h', fmt(s.response.within24h)],
      ['Visitors (Vercel Web Analytics, entered with --visitors)', s.visitors == null ? '— not provided' : s.visitors],
      ['Leads per 100 visitors', s.leadRate == null ? '—' : s.leadRate],
      ['Qualified leads per 100 visitors', s.qualifiedRate == null ? '—' : s.qualifiedRate],
    ]),
    '',
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
    else if (!a.startsWith('--')) o.file = a;
    else throw new Error(`Unknown option ${a}`);
  }
  for (const k of ['from', 'to']) if (o[k] && !parseUtc(o[k])) throw new Error(`--${k} must be a date like 2026-10-01`);
  if (o.visitors !== undefined && !(Number(o.visitors) > 0)) throw new Error('--visitors must be a positive number');
  return o;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const o = args(process.argv.slice(2));
    if (!o.file) throw new Error('Usage: node scripts/lead-report.mjs tracker.csv [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--visitors N] [--json]');
    const s = summarize(parseTable(fs.readFileSync(o.file, 'utf8')), o);
    process.stdout.write(o.json ? `${JSON.stringify(s, null, 2)}\n` : render(s));
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    process.exitCode = 1;
  }
}
