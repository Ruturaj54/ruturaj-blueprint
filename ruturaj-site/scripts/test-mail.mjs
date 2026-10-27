// Assertions for the mail pipeline. Sends nothing; exits 1 on any failure.
// Run: npm run test:mail (regenerates engine.mjs first).

import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { todayISO, istMinutes, istClock } from '../netlify/functions/_shared/engine.mjs';
import { buildDigest } from '../netlify/functions/_shared/digest.mjs';
import { buildMorning, buildEvening } from '../netlify/functions/_shared/templates.mjs';
import { shouldSendNow, alreadySent, recordEntry, prune, recentEntries } from '../netlify/functions/_shared/maillog.mjs';
import { mask } from '../netlify/functions/_shared/auth.mjs';
import { runScheduled } from '../netlify/functions/_shared/scheduled.mjs';
import { CRONS } from '../netlify/functions/_shared/crons.mjs';
import * as F from './fixtures.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const functionsDir = resolve(here, '../netlify/functions');

let failures = 0;
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n        got      ${JSON.stringify(actual)}\n        expected ${JSON.stringify(expected)}`}`);
};
const truthy = (label, value) => check(label, Boolean(value), true);

/** Any object with get(key, { type: 'json' }) and setJSON(key, value). */
const memoryStore = () => {
  const data = new Map();
  return {
    data,
    async get(key) {
      return data.has(key) ? JSON.parse(data.get(key)) : null;
    },
    async setJSON(key, value) {
      data.set(key, JSON.stringify(value));
    },
  };
};

const sendOk = (id = 'msg-1') => async () => ({ ok: true, messageId: id });
const sendFail = async () => ({ ok: false, error: 'SMTP refused' });

console.log('\n=== 1. IST day boundaries (04:00 roll-over) ===');
check('03:59 IST belongs to the previous day', todayISO(F.ist('2026-10-30', '03:59')), '2026-10-29');
check('04:00 IST starts the new day', todayISO(F.ist('2026-10-30', '04:00')), '2026-10-30');
check('06:00 IST on a date is that date', todayISO(F.ist('2026-10-30', '06:00')), '2026-10-30');
check('00:30 UTC is 06:00 IST', istClock(new Date('2026-10-30T00:30:00Z')), '06:00');
check('00:30 UTC is 360 IST minutes', istMinutes(new Date('2026-10-30T00:30:00Z')), 360);

console.log('\n=== 2. The send window: at or after the target, inside four hours ===');
check('05:59 is before a 06:00 target', shouldSendNow({ nowMinutes: 359, targetHHMM: '06:00' }), false);
check('06:00 sends', shouldSendNow({ nowMinutes: 360, targetHHMM: '06:00' }), true);
check('06:14 still sends', shouldSendNow({ nowMinutes: 374, targetHHMM: '06:00' }), true);
check('10:01 is beyond target + 240', shouldSendNow({ nowMinutes: 601, targetHHMM: '06:00' }), false);

console.log('\n=== 3. runScheduled: once per day, retried on failure, morning and evening independent ===');
{
  const store = memoryStore();
  const state = F.weekday();
  const readState = async () => state;
  const tick = F.ist(F.FRI, '06:00');
  const first = await runScheduled({ type: 'morning', now: tick, store, readState, send: sendOk() });
  truthy(`first tick sends: ${first}`, first.startsWith('sent:'));
  const second = await runScheduled({ type: 'morning', now: tick, store, readState, send: sendOk('msg-2') });
  truthy(`same tick again skips: ${second}`, second.includes('already sent'));
  const later = await runScheduled({ type: 'morning', now: F.ist(F.FRI, '06:15'), store, readState, send: sendOk('msg-3') });
  truthy('the 06:15 tick skips too', later.includes('already sent'));
  const log = JSON.parse(store.data.get('mail-log'));
  check('exactly one morning entry for the day', [log.days[F.FRI].morning.ok, log.days[F.FRI].morning.messageId], [true, 'msg-1']);

  const evening = await runScheduled({ type: 'evening', now: F.ist(F.FRI, '17:00'), store, readState, send: sendOk('msg-e') });
  truthy(`the morning send never blocks the evening: ${evening}`, evening.startsWith('sent:'));
  const early = await runScheduled({ type: 'evening', now: F.ist(F.SAT, '15:30'), store, readState, send: sendOk() });
  truthy(`before the target the tick waits: ${early}`, early.includes('before window'));
}
{
  const store = memoryStore();
  const readState = async () => F.weekday();
  const failed = await runScheduled({ type: 'morning', now: F.ist(F.FRI, '06:00'), store, readState, send: sendFail });
  truthy(`a failed send is reported: ${failed}`, failed.startsWith('failed:'));
  const log1 = JSON.parse(store.data.get('mail-log'));
  check('the failure is recorded with its error', [log1.days[F.FRI].morning.ok, log1.days[F.FRI].morning.error], [false, 'SMTP refused']);
  const retry = await runScheduled({ type: 'morning', now: F.ist(F.FRI, '06:15'), store, readState, send: sendOk('msg-r') });
  truthy(`the next tick retries and sends: ${retry}`, retry.startsWith('sent:'));
  const log2 = JSON.parse(store.data.get('mail-log'));
  check('the retry overwrites the failed entry', [log2.days[F.FRI].morning.ok, log2.days[F.FRI].morning.messageId], [true, 'msg-r']);
}
{
  // Reads that fail must never send; the next tick retries.
  const brokenStore = { async get() { throw new Error('blobs GET 503'); }, async setJSON() {} };
  const r1 = await runScheduled({ type: 'morning', now: F.ist(F.FRI, '06:00'), store: brokenStore, readState: async () => F.weekday(), send: sendOk() });
  truthy(`an unreadable mail log sends nothing: ${r1}`, r1.startsWith('failed:') && r1.includes('log unreadable'));
  const r2 = await runScheduled({ type: 'morning', now: F.ist(F.FRI, '06:00'), store: memoryStore(), readState: async () => { throw new Error('blobs down'); }, send: sendOk() });
  truthy(`an unreadable state sends nothing: ${r2}`, r2.startsWith('failed:') && r2.includes('state unreadable'));

  // A claim is written before the send, so a crash after SMTP accepted the
  // mail cannot resend it on the next tick.
  const inner = memoryStore();
  let sends = 0;
  const flaky = {
    calls: 0,
    async get(k) { return inner.get(k); },
    async setJSON(k, v) { this.calls += 1; if (this.calls === 2) throw new Error('blobs PUT 503'); return inner.setJSON(k, v); },
  };
  const sendCount = async () => { sends += 1; return { ok: true, messageId: `m${sends}` }; };
  const r3 = await runScheduled({ type: 'morning', now: F.ist(F.FRI, '06:00'), store: flaky, readState: async () => F.weekday(), send: sendCount });
  truthy(`the send happened once although the result write failed: ${r3}`, sends === 1 && r3.startsWith('sent:'));
  const r4 = await runScheduled({ type: 'morning', now: F.ist(F.FRI, '06:15'), store: flaky, readState: async () => F.weekday(), send: sendCount });
  truthy(`the next tick honours the pending claim: ${r4}`, sends === 1 && r4.includes('already sent'));
  const r5 = await runScheduled({ type: 'morning', now: F.ist(F.FRI, '06:45'), store: flaky, readState: async () => F.weekday(), send: sendCount });
  truthy(`an abandoned claim older than 20 minutes is retried: ${r5}`, sends === 2 && r5.startsWith('sent:'));
  const late = await runScheduled({ type: 'morning', now: F.ist(F.FRI, '11:00'), store: memoryStore(), readState: async () => F.weekday(), send: sendOk() });
  truthy(`past the window is reported as such: ${late}`, late.includes('past the window'));
}
{
  const store = memoryStore();
  const readState = async () => F.amazonState({ settings: { emailEnabled: false } });
  const off = await runScheduled({ type: 'morning', now: F.ist(F.FRI, '06:00'), store, readState, send: sendOk() });
  truthy(`emailEnabled false skips: ${off}`, off.includes('turned off'));
  check('nothing is written when mail is off', store.data.size, 0);
}

console.log('\n=== 4. The log helpers ===');
{
  const log = { days: {} };
  recordEntry(log, '2026-09-20', 'morning', { sentAt: 'a', subject: 's', ok: true });
  recordEntry(log, '2026-10-29', 'evening', { sentAt: 'b', subject: 'e', ok: true });
  recordEntry(log, '2026-10-30', 'test', { type: 'evening', sentAt: 'c', subject: 't', ok: true });
  check('alreadySent is true only for a successful entry', [alreadySent(log, '2026-09-20', 'morning'), alreadySent(log, '2026-09-20', 'evening')], [true, false]);
  check('a test entry goes to tests[] and is flagged', [log.days['2026-10-30'].tests[0].test, log.days['2026-10-30'].tests[0].type], [true, 'evening']);
  check('a test send never counts as the routine mail', alreadySent(log, '2026-10-30', 'evening'), false);
  prune(log, 30, '2026-10-30');
  check('prune drops days older than 30 days', Object.keys(log.days), ['2026-10-29', '2026-10-30']);
  check('recentEntries flattens newest first, with the mail type and test flag', recentEntries(log, 14, '2026-10-30').map((e) => [e.type, e.test]), [['evening', true], ['evening', false]]);
  check('mask never returns the full address', [mask('ruturaj@example.com'), mask(''), mask('nope')], ['r•••@example.com', null, '•••']);
}

console.log('\n=== 5. Exactly two scheduled functions, with the agreed cron strings ===');
{
  const files = (await readdir(functionsDir)).filter((f) => f.endsWith('.mjs'));
  const scheduled = [];
  for (const f of files) {
    const src = await readFile(resolve(functionsDir, f), 'utf-8');
    const m = /schedule:\s*'([^']+)'/.exec(src);
    if (m) scheduled.push([f, m[1]]);
  }
  check('two scheduled functions', scheduled.map(([f]) => f).sort(), ['send-evening-email.mjs', 'send-morning-email.mjs']);
  check('morning cron', scheduled.find(([f]) => f === 'send-morning-email.mjs')?.[1], CRONS.morning.cron);
  check('evening cron', scheduled.find(([f]) => f === 'send-evening-email.mjs')?.[1], CRONS.evening.cron);
}

console.log('\n=== 6. Rendering ===');
const morningFri = buildDigest(F.weekday(), F.ist(F.FRI, '06:00'));
const renders = {
  'before-start': [buildDigest(F.beforeStart(), F.ist(F.THU, '06:00')), buildDigest(F.beforeStart(), F.ist(F.THU, '17:00'))],
  weekday: [morningFri, buildDigest(F.weekdayEvening(morningFri), F.ist(F.FRI, '17:00'))],
  thursday: [buildDigest(F.weekday(), F.ist(F.THU, '06:00')), buildDigest(F.weekday(), F.ist(F.THU, '17:00'))],
  'evening-run': [buildDigest(F.eveningRun(), F.ist(F.THU, '06:00')), buildDigest(F.eveningRun(), F.ist(F.THU, '17:00'))],
  saturday: [buildDigest(F.saturday(), F.ist(F.SAT, '06:00')), buildDigest(F.saturday(), F.ist(F.SAT, '17:00'))],
  sunday: [buildDigest(F.sunday(), F.ist(F.SUN, '06:00')), buildDigest(F.sunday(), F.ist(F.SUN, '17:00'))],
  general: [buildDigest(F.general(), new Date()), buildDigest(F.general(), new Date())],
  'interview-4d': [buildDigest(F.interviewSoon(), F.ist(F.THU, '06:00')), buildDigest(F.interviewSoon(), F.ist(F.THU, '17:00'))],
};
const before = buildMorning(renders['before-start'][0]);
truthy('before start: morning says Day 1 is waiting', before.html.includes('Day 1 is waiting') && before.text.includes('Day 1 is waiting'));
truthy('before start: the Day-1 set is previewed', renders['before-start'][0].items.length > 0 && before.html.includes('Day 1 set, previewed'));
truthy('before start: CTA is Start Day 1', before.html.includes('Start Day 1'));
check('two Amazon days have different subjects', buildMorning(renders.thursday[0]).subject === buildMorning(renders.weekday[0]).subject, false);
truthy('Friday has two re-solves due in the subject', buildMorning(renders.weekday[0]).subject.includes('2 re-solves'));
truthy('the morning mail has the exercise section', before.html.includes('Morning exercise') && before.html.includes(renders['before-start'][0].exercise.name));
truthy('the morning mail has the timetable rows', renders['before-start'][0].timetable.every((r) => before.html.includes(r.time)));
truthy('the morning mail has the Amazon set with reasons', buildMorning(renders.weekday[0]).html.includes(renders.weekday[0].items[0].reason.replace(/&/g, '&amp;')));
truthy('the evening mail contains 18:00', buildEvening(renders.weekday[1]).html.includes('18:00'));
truthy('the evening mail lists what was already done', buildEvening(renders.weekday[1]).html.includes('Already done today'));
truthy('an evening-run day shows the run first tonight', renders['evening-run'][1].tonight[0]?.id === 'pm-move');
truthy('an evening-run morning says the run moved', buildMorning(renders['evening-run'][0]).html.includes('Run moved to 17:15'));
truthy('Sunday evening mentions the weekly review at 20:30', buildEvening(renders.sunday[1]).html.includes('20:30') && buildEvening(renders.sunday[1]).subject.includes('20:30'));
truthy('interview mode leads with a Phase 3 item', renders['interview-4d'][0].items.find((i) => !i.revision)?.id === renders['interview-4d'][0].plan.planned.find((p) => !p.revision)?.item.key && renders['interview-4d'][0].plan.planned.find((p) => !p.revision)?.item.phase === 3);
truthy('general phase renders a roadmap subject', buildMorning(renders.general[0]).subject.includes('Roadmap'));
for (const [label, [m, e]] of Object.entries(renders)) {
  const mm = buildMorning(m);
  const ee = buildEvening(e);
  truthy(`${label}: no "undefined" or "NaN" in either mail`, !/undefined|NaN/.test(mm.html + mm.text + ee.html + ee.text + mm.subject + ee.subject));
  truthy(`${label}: no dark colour-scheme meta`, !mm.html.includes('color-scheme') && !ee.html.includes('color-scheme'));
  // Prose is the unindented lines; the indented ones are the timetable and item rows.
  const prose = (t) => t.split('\n').filter((l) => l && !l.startsWith('  ')).join(' ').split(/\s+/).length;
  truthy(`${label}: both mails stay under 300 words of prose (${prose(mm.text)} / ${prose(ee.text)})`, prose(mm.text) < 300 && prose(ee.text) < 300);
}

console.log(`\n${failures === 0 ? 'ALL MAIL CHECKS PASSED' : `${failures} MAIL CHECK(S) FAILED`}\n`);
process.exit(failures === 0 ? 0 : 1);
