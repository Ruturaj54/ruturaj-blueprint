// Assertions for the mail pipeline, one per real bug that reached Ruturaj's
// inbox. Run with `npm run test:mail`. Sends nothing.

import { buildDigest, istToday, addDays } from '../netlify/functions/_shared/digest.mjs';
import { buildMorning, buildEvening } from '../netlify/functions/_shared/templates.mjs';

let failures = 0;
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n        got      ${JSON.stringify(actual)}\n        expected ${JSON.stringify(expected)}`}`);
};
const truthy = (label, value) => check(label, Boolean(value), true);

// IST wall-clock helper: build a Date for a given IST time.
const ist = (iso, hhmm) => new Date(`${iso}T${hhmm}:00+05:30`);
const DAY2 = '2026-09-24';
const morning = ist(DAY2, '07:00');

console.log('\n=== 1. Day boundary: the night block belongs to the day it was planned on ===');
check('07:00 IST on 24 Sep is 24 Sep', istToday(ist(DAY2, '07:00')), DAY2);
check('23:30 IST on 24 Sep is 24 Sep', istToday(ist(DAY2, '23:30')), DAY2);
check('01:15 IST on 25 Sep still counts as 24 Sep', istToday(ist('2026-09-25', '01:15')), DAY2);
check('02:30 IST end-of-day send reports 24 Sep', istToday(ist('2026-09-25', '02:30')), DAY2);
check('04:00 IST on 25 Sep is 25 Sep', istToday(ist('2026-09-25', '04:00')), '2026-09-25');

console.log('\n=== 2. His actual blob: old epoch with 24 gate ticks he never did ===');
const staleBlob = {
  // no dataEpoch — written before the reset
  foundation: Object.fromEntries(
    ['f-python-1', 'f-python-2', 'f-python-3', 'f-data-1', 'f-data-2', 'f-data-3', 'f-math-1', 'f-math-2',
     'f-math-3', 'f-ml-1', 'f-ml-2', 'f-ml-3', 'f-ml-4', 'f-ml-5', 'f-ml-6', 'f-ml-7', 'f-tools-1',
     'f-tools-2', 'f-tools-3', 'f-dl-1', 'f-python-4', 'f-python-5', 'f-python-6', 'f-data-4'].map((k) => [k, true]),
  ),
  days: { '2026-09-23': { planned: ['f-ml-8', 'f-dl-1', 'f-apps-1'], completed: Array.from({ length: 24 }, (_, i) => `x${i}`) } },
  dsa: [{ date: '2026-09-23', problem: 'Test', pattern: 'arrays', outcome: 'solved', minutes: 5 }],
  settings: { dsaTargetPerDay: 3, emailEnabled: true, studyBlock2Start: '22:00', studyBlock2End: '02:00' },
};
const d1 = buildDigest(staleBlob, morning);
check('gate reads 0 done — the fake ticks are gone', d1.gate.done, 0);
check('gate total is the rebuilt 102', d1.gate.total, 102);
check('missions start at the first Apna modules', d1.missions.map((m) => m.id), ['ap-03', 'ap-04', 'ap-05']);
check('old DSA test log is ignored', d1.dsa.total, 0);
check('schedule settings survive the reset', d1.schedule.slots.find((s) => s.id === 'block2').start, '22:00');

console.log('\n=== 3. Missed work carries to the next day, first ===');
const carryState = {
  dataEpoch: 3,
  foundation: { 'ap-03': true },
  days: {
    '2026-09-23': { planned: ['ap-03', 'ap-04', 'ap-05'], completed: ['ap-03'] },
  },
  settings: { dsaTargetPerDay: 3 },
};
const d2 = buildDigest(carryState, morning);
check('the two missed modules come first', d2.missions.slice(0, 2).map((m) => m.id), ['ap-04', 'ap-05']);
check('both are flagged as carried over', d2.missions.slice(0, 2).map((m) => Boolean(m.carriedFrom)), [true, true]);
check('the third slot is the next new module', d2.missions[2].id, 'ap-06');
check('carriedCount is 2', d2.carriedCount, 2);
truthy('morning mail says items were carried', buildMorning(d2).text.includes('carried over'));

console.log('\n=== 4. End-of-day mail lists what carries to tomorrow ===');
const endState = {
  dataEpoch: 3,
  foundation: { 'ap-03': true },
  days: { [DAY2]: { planned: ['ap-03', 'ap-04', 'ap-05'], completed: ['ap-03'] } },
  settings: { dsaTargetPerDay: 3 },
};
const d3 = buildDigest(endState, ist('2026-09-25', '02:30'));
check('02:30 digest reports the day that is ending', d3.today, DAY2);
check('open items listed for tomorrow', d3.todayLog.missed.length, 2);
const eve = buildEvening(d3);
truthy('HTML has a "Carries to tomorrow" section', eve.html.includes('Carries to tomorrow'));
truthy('plaintext lists what carries', eve.text.includes('Carries to tomorrow'));

console.log('\n=== 5. Score never exceeds 100 (the 800% bug, everywhere) ===');
const inflated = {
  dataEpoch: 3,
  foundation: { 'ap-03': true, 'ap-04': true },
  days: { [DAY2]: { planned: ['ap-03', 'ap-04', 'ap-05'], completed: ['ap-03', 'ap-04', ...Array.from({ length: 22 }, (_, i) => `ap-x${i}`)] } },
  settings: {},
};
const d4 = buildDigest(inflated, ist('2026-09-25', '02:30'));
check('day score is 67, not 800', d4.todayLog.score, 67);
check('extra work credited separately', d4.todayLog.extras, 22);
truthy('praise never claims more than planned', !/\d{2,} of 3/.test(JSON.stringify(d4.praise)));

console.log('\n=== 6. No mission ever vanishes from the mail ===');
const bigDay = {
  dataEpoch: 3,
  foundation: Object.fromEntries(
    ['ap-03','ap-04','ap-05','ap-06','ap-07','ap-08','ap-09','ap-10','ap-11','ap-12','ap-13','ap-14','ap-15','ap-16','ap-17','ap-19','ap-20','ap-21','ap-22','ap-23','ap-24','ap-25','ap-26','ap-27','ap-28','ap-29'].map((k) => [k, true]),
  ),
  settings: { dsaTargetPerDay: 3, officeStudyHours: 0 },
};
const d5 = buildDigest(bigDay, morning);
const placed = new Set(d5.schedule.slots.flatMap((s) => s.items.map((i) => i.title)));
const overflowed = new Set(d5.schedule.overflow.map((i) => i.title));
for (const m of d5.missions) {
  truthy(`"${m.title}" is in a block or continues tomorrow`, placed.has(m.title) || overflowed.has(m.title));
}
const mm = buildMorning(d5);
for (const m of d5.missions) truthy(`HTML mail shows "${m.title.slice(0, 40)}"`, mm.html.includes(m.title.replace(/&/g, '&amp;')));

console.log('\n=== 7. A day too full for its blocks shows the overflow, not silence ===');
const tight = {
  dataEpoch: 3,
  foundation: {},
  // No office time and a short evening: today's three Apna modules cannot all
  // fit — exactly how two missions vanished from his mail on Day 2.
  settings: {
    dsaTargetPerDay: 3,
    officeStudyHours: 0,
    studyBlock1Start: '18:00',
    studyBlock1End: '19:00',
    studyBlock2Start: '22:00',
    studyBlock2End: '23:30',
  },
};
const d6 = buildDigest(tight, morning);
truthy('there is overflow to show', d6.schedule.overflow.length > 0);
const tm = buildMorning(d6);
const afterOverflow = tm.html.split('Continues tomorrow')[1] ?? '';
truthy('HTML mail renders a "Continues tomorrow" block', afterOverflow.length > 0);
for (const o of d6.schedule.overflow) {
  truthy(`overflow "${o.title}" is inside that block`, afterOverflow.includes(o.title));
}
const split = d6.schedule.slots.flatMap((s) => s.items).filter((i) => i.partial);
console.log(`      (${split.length} piece(s) split across blocks, ${d6.schedule.overflow.length} continuing tomorrow)`);

console.log(`\n${failures === 0 ? 'ALL MAIL CHECKS PASSED' : `${failures} MAIL CHECK(S) FAILED`}\n`);
process.exit(failures === 0 ? 0 : 1);
