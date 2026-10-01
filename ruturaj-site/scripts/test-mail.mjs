// Assertions for the mail pipeline, one per real bug that reached Ruturaj's
// inbox, plus the 1 Oct 2026 fresh start: his real timetable, weekends,
// course order and health. Run with `npm run test:mail`. Sends nothing.

import { buildDigest, istToday } from '../netlify/functions/_shared/digest.mjs';
import { buildMorning, buildEvening } from '../netlify/functions/_shared/templates.mjs';
import catalog from '../netlify/functions/_shared/catalog.json' with { type: 'json' };

let failures = 0;
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `\n        got      ${JSON.stringify(actual)}\n        expected ${JSON.stringify(expected)}`}`);
};
const truthy = (label, value) => check(label, Boolean(value), true);

// IST wall-clock helper: build a Date for a given IST time.
const ist = (iso, hhmm) => new Date(`${iso}T${hhmm}:00+05:30`);
// 1 Oct is Day 1 (a Thursday); 3 and 4 Oct are the first weekend.
const TODAY = '2026-10-01';
const morning = ist(TODAY, '07:00');
const slot = (d, id) => d.schedule.slots.find((s) => s.id === id);

console.log('\n=== 1. Day 1 is 1 October, and the night block belongs to its own day ===');
check('07:00 IST on 1 Oct is 1 Oct', istToday(ist(TODAY, '07:00')), TODAY);
check('00:45 IST on 2 Oct still counts as 1 Oct', istToday(ist('2026-10-02', '00:45')), TODAY);
check('02:30 IST end-of-day send reports 1 Oct', istToday(ist('2026-10-02', '02:30')), TODAY);
check('04:00 IST on 2 Oct is 2 Oct', istToday(ist('2026-10-02', '04:00')), '2026-10-02');
const fresh = buildDigest(null, morning);
check('1 Oct is Day 1', fresh.day, 1);
check('160 days left on Day 1', fresh.daysLeft, 160);
check('30 Sep is before the mission', buildDigest(null, ist('2026-09-30', '09:00')).beforeStart, true);

console.log('\n=== 2. Old blob (epoch 3): progress resets, records and preferences survive ===');
const staleBlob = {
  dataEpoch: 3,
  foundation: { 'ap-03': true, 'ap-04': true, 'ap-05': true, 'ap-06': true },
  days: { '2026-09-30': { planned: ['ap-06', 'ap-07', 'ap-08'], completed: ['ap-06'] } },
  dsa: [{ date: '2026-09-30', problem: 'Test', pattern: 'arrays', outcome: 'solved', minutes: 5 }],
  health: { labs: [{ id: 'l', date: '2026-09-10', marker: 'Marker', value: '1' }], supplements: [] },
  settings: { dsaTargetPerDay: 4, studyBlock2End: '02:00', eveningRunTime: '20:30' },
};
const d1 = buildDigest(staleBlob, morning);
check('gate reads 0 done', d1.gate.done, 0);
check('gate total is 102', d1.gate.total, 102);
check('missions restart at Apna module 3', d1.missions.map((m) => m.id), ['ap-03', 'ap-04', 'ap-05']);
check('nothing carried from before Day 1', d1.carriedCount, 0);
check('old DSA log is ignored', d1.dsa.total, 0);
check('the DSA target preference survives', d1.dsa.target, 4);
check('the old 02:00 night block is replaced by 01:00', slot(d1, 'block2').end, '01:00');
check('the old 20:30 run is replaced by 20:00', slot(d1, 'pm-move').start, '20:00');
check('lab records survive the reset', d1.health.labs.length, 1);

console.log('\n=== 3. Missed work carries to the next day, first ===');
const carryState = {
  dataEpoch: 4,
  foundation: { 'ap-03': true },
  days: { [TODAY]: { planned: ['ap-03', 'ap-04', 'ap-05'], completed: ['ap-03'] } },
  settings: { dsaTargetPerDay: 3 },
};
const d2 = buildDigest(carryState, ist('2026-10-02', '07:00'));
check('the two missed modules come first', d2.missions.slice(0, 2).map((m) => m.id), ['ap-04', 'ap-05']);
check('both are flagged as carried over', d2.missions.slice(0, 2).map((m) => Boolean(m.carriedFrom)), [true, true]);
check('the third slot is the next new module', d2.missions[2].id, 'ap-06');
truthy('morning mail says items were carried', buildMorning(d2).text.includes('carried over'));

console.log('\n=== 4. End-of-day mail lists what carries to tomorrow ===');
const d3 = buildDigest(carryState, ist('2026-10-02', '02:30'));
check('02:30 digest reports the day that is ending', d3.today, TODAY);
check('open items listed for tomorrow', d3.todayLog.missed.length, 2);
const eve = buildEvening(d3);
truthy('HTML has a "Carries to tomorrow" section', eve.html.includes('Carries to tomorrow'));
truthy('plaintext lists what carries', eve.text.includes('Carries to tomorrow'));

console.log('\n=== 5. Score never exceeds 100 (the 800% bug) ===');
const inflated = {
  dataEpoch: 4,
  foundation: { 'ap-03': true, 'ap-04': true },
  days: { [TODAY]: { planned: ['ap-03', 'ap-04', 'ap-05'], completed: ['ap-03', 'ap-04', ...Array.from({ length: 22 }, (_, i) => `ap-x${i}`)] } },
  settings: {},
};
const d4 = buildDigest(inflated, ist('2026-10-02', '02:30'));
check('day score is 67, not 800', d4.todayLog.score, 67);
check('extra work credited separately', d4.todayLog.extras, 22);
truthy('praise never claims more than planned', !/\d{2,} of 3/.test(JSON.stringify(d4.praise)));

console.log('\n=== 6. No mission ever vanishes from the mail ===');
const bigDay = {
  dataEpoch: 4,
  foundation: Object.fromEntries(
    ['ap-03','ap-04','ap-05','ap-06','ap-07','ap-08','ap-09','ap-10','ap-11','ap-12','ap-13','ap-14','ap-15','ap-16','ap-17','ap-19','ap-20','ap-21','ap-22','ap-23','ap-24','ap-25','ap-26','ap-27','ap-28','ap-29'].map((k) => [k, true]),
  ),
  settings: { dsaTargetPerDay: 3, officeStudyHours: 0 },
};
for (const when of [morning, ist('2026-10-03', '09:00'), ist('2026-10-04', '09:00')]) {
  const d5 = buildDigest(bigDay, when);
  const placed = new Set(d5.schedule.slots.flatMap((s) => s.items.map((i) => i.title)));
  const overflowed = new Set(d5.schedule.overflow.map((i) => i.title));
  const html = buildMorning(d5).html;
  for (const m of d5.missions) {
    truthy(`${d5.dayType}: "${m.title.slice(0, 34)}" is placed or continues`, placed.has(m.title) || overflowed.has(m.title));
    truthy(`${d5.dayType}: HTML shows "${m.title.slice(0, 34)}"`, html.includes(m.title.replace(/&/g, '&amp;')));
  }
}

console.log('\n=== 7. A day too full for its blocks shows the overflow, not silence ===');
const tight = {
  dataEpoch: 4,
  foundation: {},
  settings: { dsaTargetPerDay: 3, officeStudyHours: 0, studyBlock1Start: '18:00', studyBlock1End: '19:00', studyBlock2Start: '22:00', studyBlock2End: '23:30' },
};
const d6 = buildDigest(tight, morning);
truthy('there is overflow to show', d6.schedule.overflow.length > 0);
const afterOverflow = buildMorning(d6).html.split('Continues tomorrow')[1] ?? '';
truthy('HTML mail renders a "Continues tomorrow" block', afterOverflow.length > 0);
for (const o of d6.schedule.overflow) truthy(`overflow "${o.title}" is inside that block`, afterOverflow.includes(o.title));

console.log('\n=== 8. The whole weekday, as he described it ===');
const wk = fresh.schedule.slots;
check('day starts with waking at 07:00', [wk[0].start, wk[0].kind], ['07:00', 'care']);
check('run until 08:15', [slot(fresh, 'am-move').start, slot(fresh, 'am-move').end], ['07:15', '08:15']);
check('office 10:00 to 17:30', [slot(fresh, 'office').start, slot(fresh, 'office').end], ['10:00', '17:30']);
check('course block 18:00 to 20:00', [slot(fresh, 'block1').start, slot(fresh, 'block1').end], ['18:00', '20:00']);
check('evening run 20:00 to 21:15', [slot(fresh, 'pm-move').start, slot(fresh, 'pm-move').end], ['20:00', '21:15']);
check('night block 22:00 to 01:00', [slot(fresh, 'block2').start, slot(fresh, 'block2').end], ['22:00', '01:00']);
check('sleep 01:00 to 07:00 — six hours', [wk.at(-1).start, wk.at(-1).end], ['01:00', '07:00']);
check('skin care morning and night, hair care at night', wk.filter((s) => s.kind === 'care').map((s) => s.id), ['wake', 'am-care', 'pm-care']);
check('no gaps or overlaps across the day', wk.every((s, i) => i === 0 || s.start === wk[i - 1].end), true);
check('study capacity is 7h (2h office + 2h + 3h)', fresh.schedule.totalCapacity, 420);
truthy('every entry appears in the mail with its time', wk.every((s) => buildMorning(fresh).html.includes(s.start)));

console.log('\n=== 9. Weekends: different day, different mail ===');
const sat = buildDigest(null, ist('2026-10-03', '09:00'));
const sun = buildDigest(null, ist('2026-10-04', '09:00'));
check('3 Oct is a Saturday', sat.dayType, 'saturday');
check('4 Oct is a Sunday', sun.dayType, 'sunday');
check('Saturday wakes at 08:30', sat.schedule.slots[0].start, '08:30');
truthy('Saturday has the evening ride', sat.schedule.slots.some((s) => s.kind === 'ride' && s.start === '16:00'));
truthy('Sunday has a ride and the weekly review', sun.schedule.slots.some((s) => s.kind === 'ride') && sun.schedule.slots.some((s) => s.study === 'review'));
check('Sunday DSA is the weekly timed set', sun.dsa.headline, 'Weekly timed set');
const subjects = new Set([buildMorning(fresh).subject, buildMorning(sat).subject, buildMorning(sun).subject]);
check('weekday, Saturday and Sunday subjects all differ', subjects.size, 3);
truthy('Saturday mail has the ride card', buildMorning(sat).html.includes('Ride smart'));
truthy('Sunday mail has the review card', buildMorning(sun).html.includes('Sunday review'));
truthy('Saturday mail is not the Sunday mail', !buildMorning(sat).html.includes('Sunday review'));
check('Sunday end-of-day subject closes the week', buildEvening(buildDigest(null, ist('2026-10-05', '02:30'))).subject.startsWith('Week 1 closed'), true);

console.log('\n=== 10. Course order: Apna first, Five Minute Engineering second ===');
const apnaDone = {
  dataEpoch: 4,
  foundation: Object.fromEntries(catalog.foundation.filter((s) => s.tier === 1).flatMap((s) => s.milestones.filter((m) => m.mandatory).map((m) => [m.id, true]))),
  settings: {},
};
check('Day 1 missions are all Course 1', fresh.missions.map((m) => m.tier), [1, 1, 1]);
check('with Apna done, Course 2 starts at NLP', buildDigest(apnaDone, morning).missions.map((m) => m.id), ['fm-nlp-1', 'fm-nlp-2', 'fm-nlp-3']);
check('plan lists Course 1, Course 2, Practice in order', fresh.courses.map((c) => c.status), ['active', 'next', 'queued']);
const plan = buildMorning(fresh).html;
truthy('the mail shows Course 1 before Course 2', plan.indexOf('Course 1 · Apna College Prime AI/ML') < plan.indexOf('Course 2 · Five Minute Engineering'));
truthy('every Day 1 mission has a coaching card', fresh.missions.every((m) => m.coach && m.coach.doThis && m.coach.why && m.coach.proof));
truthy('"Ruturaj, do this today" leads the mail', plan.includes('Ruturaj, do this today'));

console.log('\n=== 11. Health: tracks and informs, never a dose it was not given ===');
truthy('no focus set: the mail asks him to set it up', buildMorning(fresh).html.includes('Set up your health focus'));
const healthy = {
  dataEpoch: 4,
  health: { focus: ['weight', 'triglycerides'], supplements: [{ id: 's', name: 'Item', dose: '', directedBy: 'doctor', active: true }], labs: [], weight: {} },
  settings: {},
};
const dh = buildDigest(healthy, morning);
const mh = buildMorning(dh).html;
truthy('focus set: general evidence is labelled as such', mh.includes('General evidence'));
truthy('weight focus without a weigh-in says Metric needed', mh.includes('Metric needed'));
truthy('doctor-directed item shown with no invented dose', mh.includes('Item') && !/\d+\s?(mg|mcg|IU|ml)\b/i.test(mh));
truthy('the disclaimer is present', mh.includes('never a diagnosis or a dose'));

console.log('\n=== 12. Every mail renders cleanly ===');
for (const [label, d] of [['weekday', fresh], ['saturday', sat], ['sunday', sun], ['health', dh], ['carry', d2]]) {
  const m = buildMorning(d);
  const e = buildEvening(d);
  truthy(`${label}: no "undefined" or "NaN" anywhere`, !/undefined|NaN/.test(m.html + m.text + e.html + e.text));
}

console.log(`\n${failures === 0 ? 'ALL MAIL CHECKS PASSED' : `${failures} MAIL CHECK(S) FAILED`}\n`);
process.exit(failures === 0 ? 0 : 1);
