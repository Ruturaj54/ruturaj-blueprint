// Engine checks against the generated bundle, so the numbers the mail and
// the app both rely on are pinned: day numbers, the Amazon window, study
// capacity, the planner's tiers and revisions. Run: npm run verify

import * as E from '../netlify/functions/_shared/engine.mjs';

let fail = 0;
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) fail += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(58)} ${JSON.stringify(actual)}${ok ? '' : `   (expected ${JSON.stringify(expected)})`}`);
};
const truthy = (label, v) => check(label, Boolean(v), true);

const TODAY = '2026-10-29'; // a Thursday
const startedOn = E.addDays(TODAY, -2);
const fresh = (extra = {}) =>
  E.parseState({
    program: { startedOn, phase: 'amazon', amazonWindowDays: 14, amazonExtendedDays: 0, ...(extra.program ?? {}) },
    amazon: { stage: 'awaiting_invite', oaDate: '2026-10-19', items: {}, extras: {}, solidTopics: [], ...(extra.amazon ?? {}) },
    settings: { settingsVersion: 2, ...(extra.settings ?? {}) },
  });

console.log('\n=== Program: Day 1 is the date Start was pressed ===');
const info = E.programInfo(fresh(), TODAY);
check('started two days ago is Day 3', info.day, 3);
check('Amazon day matches', info.amazon.day, 3);
check('a 14-day window ends 13 days after Day 1', info.amazon.endsOn, E.addDays(startedOn, 13));
check('12 days left in the window, counting today', info.amazon.daysLeft, 12);
check('not overrun', info.amazon.overrun, false);
check('before Start the day is 0', E.programInfo(E.parseState({}), TODAY).day, 0);

console.log('\n=== Study capacity from the timetable ===');
const s = E.DEFAULT_SETTINGS;
check('weekday with the final block is 330 minutes', E.studyCapacity(s, 'weekday', 'morning'), 330);
check('weekday without the final block is 240', E.studyCapacity({ ...s, studyBlock3Enabled: false }, 'weekday', 'morning'), 240);
const satSlots = E.daySlots(s, 'saturday', 'morning').filter((x) => x.capacity > 0);
check('Saturday capacity is the sum of its study blocks', E.studyCapacity(s, 'saturday', 'morning'), satSlots.reduce((n, x) => n + x.capacity, 0));
check('Saturday blocks', satSlots.map((x) => [x.id, x.capacity]), [['sat-a', 180], ['sat-b', 180], ['sat-c', 120]]);
check('weekday sleep defaults to 6 hours', E.weekdaySleepHours(s), 6);

console.log('\n=== The Amazon planner ===');
const plan = E.buildAmazonDay(fresh(), TODAY);
check('fresh state plans in curriculum mode', plan.mode, 'curriculum');
truthy('the plan is not empty', plan.planned.length > 0);
truthy('total minutes fit the budget', plan.totalMinutes <= plan.budget);
truthy('at least one P0 item', plan.planned.some((p) => p.tier === 'P0'));
truthy('every item has a reason', plan.planned.every((p) => p.reason.length > 0));
check('the budget is 85% of weekday capacity', plan.budget, Math.round(330 * 0.85));

const tight = E.buildAmazonDay(fresh({ program: { amazonWindowDays: 7 } }), TODAY);
truthy('a 7-day window keeps the floor at P0 or P1', tight.tierFloor === 'P0' || tight.tierFloor === 'P1');
truthy('the pace note talks in hours', /\d+h/.test(tight.pace.note));

const soon = E.buildAmazonDay(fresh({ amazon: { stage: 'interview_scheduled', interviewDate: E.addDays(TODAY, 4) } }), TODAY);
check('four days out is interview mode', [soon.mode, soon.daysToInterview], ['interview', 4]);
check('the first planned item is from Phase 3', soon.planned.find((p) => !p.revision)?.item.phase, 3);

console.log('\n=== Spaced revision ===');
// nextRevisit: a hint comes back in 3 days (logAmazonItem writes revisitOn = doneOn + 3).
const hinted = fresh({ amazon: { items: { 'two-sum': { doneOn: TODAY, outcome: 'hint', revisitOn: E.addDays(TODAY, 3), revisits: 0 } } } });
check('not due two days later', E.revisionsDue(hinted, E.addDays(TODAY, 2)).map((i) => i.key), []);
check('due three days later', E.revisionsDue(hinted, E.addDays(TODAY, 3)).map((i) => i.key), ['two-sum']);
const revPlan = E.buildAmazonDay(hinted, E.addDays(TODAY, 3));
check('the revision leads the plan as a P0 re-solve', [revPlan.planned[0]?.id, revPlan.planned[0]?.tier, revPlan.planned[0]?.revision], ['rev:two-sum', 'P0', true]);
check('a logged item leaves the curriculum pool', E.buildAmazonDay(hinted, TODAY).planned.some((p) => p.id === 'two-sum'), false);

console.log('\n=== Dates ===');
check('todayISO rolls at 04:00 IST', E.todayISO(new Date('2026-10-29T22:29:00Z')), '2026-10-29');
check('istClock 22:30Z is 04:00', E.istClock(new Date('2026-10-29T22:30:00Z')), '04:00');
check('todayISO after the roll-over', E.todayISO(new Date('2026-10-29T22:30:00Z')), '2026-10-30');
check('daysBetween across a month', E.daysBetween('2026-10-29', '2026-11-02'), 4);

console.log(`\n${fail === 0 ? 'ALL ENGINE CHECKS PASSED' : `${fail} ENGINE CHECK(S) FAILED`}\n`);
process.exit(fail === 0 ? 0 : 1);
