// Weekly website analytics from Vercel Web Analytics (docs/TERANGA-05C-growth-reporting.md).
// Read-only aggregates: page views, visitors (as Vercel counts them), pages, sources, language and
// the conversion events. Web Analytics holds no personal data; neither does this output.
//
//   VERCEL_TOKEN=<team-scoped token> node scripts/analytics-report.mjs --from 2026-10-19 --to 2026-10-25 [--json week.json]
//   node scripts/analytics-report.mjs --from … --to …        (uses the logged-in Vercel CLI: `vercel api`)
//
// The token is read from the environment only and never printed. --json writes the figures for
// scripts/lead-report.mjs --analytics. Events are interactions, never leads.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const DEFAULTS = { project: 'prj_pFf2inKU2qMVBZM0bP4tEQeLLJGo', team: 'team_Wp0z3ITrNPAmPWmCVhyFpIxF' };
export const EVENT_NAMES = ['service_cta_click', 'case_study_click', 'contact_form_start', 'contact_form_validation_error', 'lead_submit_success', 'lead_submit_failure', 'whatsapp_click', 'email_click'];

/** One Web Analytics query → its `data` array. `api(pathWithQuery)` returns the parsed JSON body. */
async function rows(api, kind, { project, team, since, until }, by, filter, limit = 50) {
  const q = new URLSearchParams({ projectId: project, teamId: team, since, until, by, limit: String(limit), filter });
  const body = await api(`/v1/query/web-analytics/${kind}/aggregate?${q}`);
  if (!body || !Array.isArray(body.data)) throw new Error((body && (body.error?.message || body.message)) || 'unexpected response');
  return body.data;
}

const PROD = "environment eq 'production'";
const ofEvent = (name) => `${PROD} and eventName eq '${name}'`;

/** Collects the week's figures. Every query that fails is reported as unavailable, not as zero. */
export async function collect(api, { from, to, project = DEFAULTS.project, team = DEFAULTS.team }) {
  const scope = { project, team, since: `${from}T00:00:00.000Z`, until: `${to}T23:59:59.999Z` };
  const unavailable = [];
  const safe = async (label, fn) => { try { return await fn(); } catch (err) { unavailable.push(`${label}: ${err.message}`); return null; } };
  const pick = (list, key) => (list || [])
    .map((r) => ({ name: r[key] === '' ? '(direct or none)' : String(r[key]), pageviews: r.pageviews, visitors: r.visitors, count: r.count }))
    .sort((a, b) => (b.pageviews ?? b.count ?? 0) - (a.pageviews ?? a.count ?? 0) || a.name.localeCompare(b.name));

  const total = await safe('total', () => rows(api, 'visits', scope, 'environment', PROD));
  const pagesAll = await safe('pages', () => rows(api, 'visits', scope, 'requestPath', PROD, 100));
  const referrers = await safe('referrers', () => rows(api, 'visits', scope, 'referrerHostname', PROD, 10));
  const devices = await safe('devices', () => rows(api, 'visits', scope, 'deviceType', PROD, 5));
  const utm = await safe('campaigns (utmSource; needs Web Analytics Plus)', () => rows(api, 'visits', scope, 'utmSource', PROD, 10));
  const events = await safe('events', () => rows(api, 'events', scope, 'eventName', PROD, 20));
  const sub = async (label, name, by) => pick(await safe(label, () => rows(api, 'events', scope, by, ofEvent(name), 20)), by);

  const fr = (pagesAll || []).filter((r) => r.requestPath === '/fr' || String(r.requestPath).startsWith('/fr/'));
  const sum = (list, k) => list.reduce((s, r) => s + (r[k] || 0), 0);
  const counts = Object.fromEntries(EVENT_NAMES.map((n) => [n, ((events || []).find((e) => e.eventName === n) || {}).count || 0]));
  return {
    period: { from, to },
    environment: 'production',
    pageviews: total ? sum(total, 'pageviews') : null,
    visitors: total ? sum(total, 'visitors') : null,
    topPages: pick(pagesAll, 'requestPath').slice(0, 10),
    languages: pagesAll ? { fr: sum(fr, 'pageviews'), en: sum(pagesAll, 'pageviews') - sum(fr, 'pageviews') } : null,
    referrers: pick(referrers, 'referrerHostname'),
    devices: pick(devices, 'deviceType'),
    campaigns: utm ? pick(utm, 'utmSource') : null,
    events: events ? counts : null,
    ctaByService: await sub('CTA by service', 'service_cta_click', 'eventData/service'),
    ctaByLocation: await sub('CTA by location', 'service_cta_click', 'eventData/location'),
    caseStudies: await sub('case studies', 'case_study_click', 'eventData/project'),
    validationFields: await sub('validation errors', 'contact_form_validation_error', 'eventData/fields'),
    failureReasons: await sub('submission failures', 'lead_submit_failure', 'eventData/reason'),
    unavailable,
  };
}

const table = (head, list) => [`| ${head.join(' | ')} |`, `| ${head.map(() => '---').join(' | ')} |`, ...list.map((r) => `| ${r.join(' | ')} |`)].join('\n');
const or = (v) => (v == null ? '— unavailable' : v);

/** Markdown summary for the owner. */
export function render(s) {
  const ev = s.events || {};
  const out = [
    `# Website analytics — ${s.period.from} → ${s.period.to} (production)`,
    '',
    'Source: Vercel Web Analytics (cookieless). Visitors are counted the way Vercel counts them; ad blockers hide some visits. **Events are interactions, not leads**: accepted leads come from the tracker (`scripts/lead-report.mjs`).',
    '',
    '## Acquisition',
    '',
    table(['Measure', 'Value'], [
      ['Page views', or(s.pageviews)],
      ['Visitors', or(s.visitors)],
      ['English / French page views', s.languages ? `${s.languages.en} / ${s.languages.fr}` : '— unavailable'],
    ]),
    '',
    '### Top pages',
    '',
    s.topPages.length ? table(['Page', 'Views', 'Visitors'], s.topPages.map((p) => [p.name, p.pageviews, p.visitors])) : '— none',
    '',
    '### Referring sites',
    '',
    s.referrers.length ? table(['Referrer', 'Views'], s.referrers.map((p) => [p.name, p.pageviews])) : '— none',
    '',
    `Campaigns (utm_source): ${s.campaigns == null ? 'unavailable on this plan (needs Web Analytics Plus); campaign tags of leads are in the tracker' : (s.campaigns.map((c) => `${c.name} ${c.pageviews}`).join(', ') || 'none')}.`,
    '',
    '## Engagement (events)',
    '',
    s.events ? table(['Event', 'Count'], EVENT_NAMES.map((n) => [n, ev[n]])) : '— unavailable',
    '',
    `- Service CTA clicks by service: ${s.ctaByService.length ? s.ctaByService.map((c) => `${c.name} ${c.count}`).join(', ') : 'none'}.`,
    `- Service CTA clicks by location: ${s.ctaByLocation.length ? s.ctaByLocation.map((c) => `${c.name} ${c.count}`).join(', ') : 'none'}.`,
    `- Case studies: ${s.caseStudies.length ? s.caseStudies.map((c) => `${c.name} ${c.count}`).join(', ') : 'none'}.`,
    `- Form fields flagged by the page: ${s.validationFields.length ? s.validationFields.map((c) => `${c.name} ${c.count}`).join(', ') : 'none'}.`,
    s.failureReasons.length
      ? `- **Submission failures** by reason: ${s.failureReasons.map((c) => `${c.name} ${c.count}`).join(', ')}. Check Vercel → Logs for "Lead rejected" (which check) or "Lead email failed".`
      : '- Submission failures: none.',
  ];
  if (s.unavailable.length) out.push('', '## Not available this week', '', ...s.unavailable.map((u) => `- ${u}`));
  return `${out.join('\n')}\n`;
}

// The CLI's JavaScript entry, run with this Node binary: no shell, so the query string is passed
// as one argument and never interpreted (Windows cannot spawn the vercel.cmd shim without a shell).
function cliCommand() {
  if (process.platform !== 'win32') return ['vercel', []];
  for (const dir of (process.env.PATH || '').split(path.delimiter)) {
    const entry = path.join(dir, 'node_modules', 'vercel', 'dist', 'vc.js');
    if (dir && fs.existsSync(entry)) return [process.execPath, [entry]];
  }
  return null;
}

// Access: VERCEL_TOKEN (never printed), else the Vercel CLI's own login.
function api() {
  const token = process.env.VERCEL_TOKEN;
  if (token) {
    return async (p) => (await fetch(`https://api.vercel.com${p}`, { headers: { Authorization: `Bearer ${token}` } })).json();
  }
  const cmd = cliCommand();
  if (!cmd) throw new Error('Vercel CLI not found: install it (npm i -g vercel) and run `vercel login`, or set VERCEL_TOKEN');
  return async (p) => {
    const r = spawnSync(cmd[0], [...cmd[1], 'api', p], { encoding: 'utf8', cwd: os.tmpdir(), timeout: 60000 });
    const outText = r.stdout || '';
    const i = outText.indexOf('{');
    if (i < 0) {
      const why = (r.stderr || '').split('\n').map((l) => l.trim()).find((l) => /error|not|login|forbidden|denied/i.test(l));
      throw new Error(why || 'no response from the Vercel CLI (run `vercel login`, or set VERCEL_TOKEN)');
    }
    return JSON.parse(outText.slice(i));
  };
}

function args(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (['--from', '--to', '--json', '--project', '--team'].includes(k)) o[k.slice(2)] = argv[++i];
    else throw new Error(`Unknown option ${k}`);
  }
  for (const k of ['from', 'to']) if (!/^\d{4}-\d{2}-\d{2}$/.test(o[k] || '')) throw new Error(`--${k} YYYY-MM-DD is required`);
  return o;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const o = args(process.argv.slice(2));
    const s = await collect(api(), o);
    if (o.json) fs.writeFileSync(o.json, `${JSON.stringify(s, null, 2)}\n`);
    process.stdout.write(render(s));
  } catch (err) {
    process.stderr.write(`${err.message}\n`);
    process.exitCode = 1;
  }
}
