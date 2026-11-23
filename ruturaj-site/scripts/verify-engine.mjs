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
    settings: { settingsVersion: 3, ...(extra.settings ?? {}) },
    ...(extra.rest ?? {}),
  });

console.log('\n=== Program: Day 1 is the date Start was pressed ===');
const info = E.programInfo(fresh(), TODAY);
check('started two days ago is Day 3', info.day, 3);
check('Amazon day matches', info.amazon.day, 3);
check('a 14-day window ends 13 days after Day 1', info.amazon.endsOn, E.addDays(startedOn, 13));
check('12 days left in the window, counting today', info.amazon.daysLeft, 12);
check('not overrun', info.amazon.overrun, false);
check('before Start the day is 0', E.programInfo(E.parseState({}), TODAY).day, 0);

console.log('\n=== His day: the timetable he described on 23 Nov 2026 ===');
const s = E.DEFAULT_SETTINGS;
const wd = E.daySlots(s, 'weekday', 'morning');
check('the weekday runs wake, run, office, own time, prep, freelance, dinner, lecture, walk, revise, sleep', wd.map((x) => x.id), ['wake', 'am-move', 'ready', 'office', 'settle', 'block1', 'freelance', 'dinner', 'block2', 'walk', 'block3', 'sleep']);
check('times: run, home, prep, dinner, lecture, walk, lights out', [wd[1].start, wd[1].end, wd[4].start, wd[5].start, wd[7].start, wd[8].start, wd[9].start, wd[10].end], ['08:05', '08:30', '17:15', '17:30', '20:15', '21:00', '22:15', '23:45']);
check('weekday study is prep 120 + lecture 75', E.studyCapacity(s, 'weekday', 'morning'), 195);
check('the lecture block is 75 minutes', E.roleCapacity(s, 'weekday', 'lecture', 'morning'), 75);
check('freelance off gives block 1 the time to dinner', E.studyCapacity({ ...s, freelanceEnabled: false }, 'weekday', 'morning'), 240);
check('the revise-and-plan block holds no items', wd.find((x) => x.id === 'block3')?.capacity, 0);
const satSlots = E.daySlots(s, 'saturday', 'morning').filter((x) => x.capacity > 0);
check('Saturday capacity is the sum of its study blocks', E.studyCapacity(s, 'saturday', 'morning'), satSlots.reduce((n, x) => n + x.capacity, 0));
check('Saturday blocks', satSlots.map((x) => [x.id, x.capacity]), [['sat-a', 180], ['sat-lecture', 120], ['sat-c', 60]]);
check('Sunday blocks', E.daySlots(s, 'sunday', 'morning').filter((x) => x.capacity > 0).map((x) => [x.id, x.capacity]), [['sun-a', 180], ['sun-mock', 120], ['sun-lecture', 60]]);
check('every day type has the evening walk', ['weekday', 'saturday', 'sunday'].map((t) => E.daySlots(s, t, 'morning').some((x) => x.kind === 'walk')), [true, true, true]);
check('weekday sleep is about eight hours', E.weekdaySleepHours(s), 8.3);
check('a rest morning swaps the run for a stretch', E.daySlots(s, 'weekday', 'rest').map((x) => x.id).slice(0, 3), ['wake', 'am-rest', 'ready']);
check('after prep the deep block wears its roadmap label', E.daySlots(s, 'weekday', 'morning', 'general').find((x) => x.id === 'block1')?.label, 'Deep block — DSA and builds');

console.log('\n=== The prep planner ===');
const plan = E.buildAmazonDay(fresh(), TODAY);
check('fresh state plans in curriculum mode', plan.mode, 'curriculum');
truthy('the plan is not empty', plan.planned.length > 0);
truthy('total minutes fit the budget', plan.totalMinutes <= plan.budget);
truthy('at least one P0 item', plan.planned.some((p) => p.tier === 'P0'));
truthy('every item has a reason', plan.planned.every((p) => p.reason.length > 0));
check('prep capacity leaves the lecture block alone', [plan.capacity, E.prepCapacity(fresh(), TODAY)], [120, 120]);
check('the budget is 85% of the prep block', plan.budget, Math.round(120 * 0.85));
check('with the lecture off, prep gets block 2 too', E.buildAmazonDay(fresh({ settings: { parallelLecture: false } }), TODAY).capacity, 195);

const tight = E.buildAmazonDay(fresh({ program: { amazonWindowDays: 7 } }), TODAY);
truthy('a 7-day window keeps the floor at P0 or P1', tight.tierFloor === 'P0' || tight.tierFloor === 'P1');
truthy('the pace note talks in hours', /\d+h/.test(tight.pace.note));

const soon = E.buildAmazonDay(fresh({ amazon: { stage: 'interview_scheduled', interviewDate: E.addDays(TODAY, 4) } }), TODAY);
check('four days out is interview mode', [soon.mode, soon.daysToInterview], ['interview', 4]);
check('the first planned item is from Phase 3', soon.planned.find((p) => !p.revision)?.item.phase, 3);

console.log('\n=== The parallel lecture: one Apna College module a night ===');
{
  const work = E.todayWork(fresh(), TODAY);
  check('tonight holds the first Apna module, capped at its block', work.lecture.map((m) => [m.milestone.id, m.minutes]), [['ap-03', 30]]);
  check('the lecture is planned and scored with the prep set', work.plannedIds.includes('ap-03'), true);
  const sched = E.buildSchedule(E.DEFAULT_SETTINGS, work.items, 'weekday', 'morning');
  check('the lecture sits in the lecture block, prep in block 1', [sched.slots.find((x) => x.id === 'block2')?.items.map((i) => i.id), sched.slots.find((x) => x.id === 'block1')?.items.every((i) => i.kind !== 'lecture')], [['ap-03'], true]);
  const ticked = fresh({ rest: { foundation: { 'ap-03': true } } });
  check('a ticked module moves the lecture to the next one', E.todayWork(ticked, TODAY).lecture.map((m) => [m.milestone.id, m.minutes]), [['ap-04', 75]]);
  check('ten days from an interview the lecture pauses', E.lectureActive(fresh({ amazon: { stage: 'interview_scheduled', interviewDate: E.addDays(TODAY, 8) } }), TODAY), false);
  check('the setting turns it off', E.todayWork(fresh({ settings: { parallelLecture: false } }), TODAY).lecture.length, 0);
  check('after prep the roadmap plans Apna itself', E.lectureActive(fresh({ program: { phase: 'general', generalStartedOn: TODAY } }), TODAY), false);
}

console.log('\n=== Today’s numbers, dinners, rest days ===');
{
  const st = E.parseState({ activity: { [TODAY]: { steps: 9240.6, walkKm: 5.234, activeKcal: -5, totalKcal: 99999, runKm: 'x' }, bad: { steps: 1 } } });
  check('activity keeps sane numbers only, rounded', st.activity, { [TODAY]: { walkKm: 5.23, steps: 9241 } });
  const draft = structuredClone(st);
  E.setActivity(draft, TODAY, 'runKm', 3.1);
  E.setActivity(draft, TODAY, 'steps', undefined);
  check('setActivity sets and clears one number', draft.activity[TODAY], { walkKm: 5.23, runKm: 3.1 });
  check('the activity line lists only what was entered', E.activityLine(draft.activity[TODAY]), 'run 3.1 km · walk 5.2 km');
  const week = E.activityWeek(draft, 5, TODAY);
  check('the week counts walks that reached the target', [week.loggedDays, week.walkTargetDays, week.totals.walkKm], [1, 1, 5.2]);
  check('Monday is egg bhurji, Sunday is rajma or chole', [E.dinnerFor('2026-11-23').id, E.dinnerFor('2026-11-29').id], ['egg-bhurji', 'rajma-curd']);
  check('every dinner is vegetarian or eggs', E.PROTEIN_DINNERS.every((d) => !/chicken|fish|mutton|meat|prawn/i.test(d.name + d.plate)), true);
  const ov = E.parseState({ exerciseOverrides: { '2026-11-24': 'evening', '2026-11-25': 'rest' } });
  check('an old evening override is a normal morning; rest stays', [ov.exerciseOverrides, E.exerciseSlotFor(ov, '2026-11-24'), E.exerciseSlotFor(ov, '2026-11-25')], [{ '2026-11-25': 'rest' }, 'morning', 'rest']);
}

console.log('\n=== Settings v3: an older timetable takes his new day, preferences stay ===');
{
  const old = E.parseState({ settings: { settingsVersion: 2, wakeTime: '07:00', eveningEmailTime: '17:00', emailEnabled: false, dsaTargetPerDay: 4, theme: 'dark' } });
  check('timetable and mail times reset to the new defaults', [old.settings.wakeTime, old.settings.officeEnd, old.settings.morningEmailTime, old.settings.eveningEmailTime], ['08:00', '17:15', '07:45', '17:15']);
  check('preferences survive', [old.settings.emailEnabled, old.settings.dsaTargetPerDay, old.settings.theme], [false, 4, 'dark']);
  check('a v3 blob keeps its own times', E.parseState({ settings: { settingsVersion: 3, wakeTime: '07:30', walkTargetKm: 6 } }).settings.wakeTime, '07:30');
  check('the target is the end of February 2027', E.TARGET_DATE, '2027-02-28');
}

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

console.log('\n=== Epoch 6: old progress is forgotten, Day 1 re-anchors to today ===');
{
  const old = E.parseState({
    dataEpoch: 5,
    program: { startedOn: '2026-10-25', phase: 'amazon', amazonWindowDays: 14, amazonExtendedDays: 7 },
    amazon: { stage: 'awaiting_invite', oaDate: '2026-10-19', items: { 'two-sum': { doneOn: '2026-10-26', outcome: 'independent', revisits: 0 } }, extras: {}, solidTopics: [] },
    foundation: { 'ap-03': true, 'ap-04': true },
    days: { '2026-10-20': { planned: ['ap-03'], completed: ['ap-03'] } },
    dsa: [{ id: 'a', date: '2026-10-20', problem: 'X', pattern: 'arrays', difficulty: 'easy', outcome: 'solved', minutes: 10, revision: false }],
    runs: [{ id: 'r', date: '2026-10-20', slot: 'morning', kind: 'run', minutes: 30 }],
    activity: { '2026-10-20': { steps: 8000 } },
    work: [{ id: 'w', date: '2026-10-20', raw: 'did a thing', metricNeeded: true, tags: [] }],
    health: { labs: [{ id: 'l', date: '2026-09-10', marker: 'HDL', value: '50' }], weight: { '2026-10-01': 80 } },
    settings: { settingsVersion: 2, emailEnabled: false, dsaTargetPerDay: 4 },
  });
  truthy('an epoch-5 blob is stale', E.isStaleEpoch(old));
  const fresh6 = E.freshForNewEpoch(old, TODAY);
  check('fresh state is on the current epoch', [fresh6.dataEpoch, E.DATA_EPOCH], [6, 6]);
  check('course ticks, day logs and DSA attempts are forgotten', [Object.keys(fresh6.foundation).length, Object.keys(fresh6.days).length, fresh6.dsa.length], [0, 0, 0]);
  check('real-life records survive: runs and daily numbers', [fresh6.runs.length, Object.keys(fresh6.activity).length], [1, 1]);
  check('the prep tracker survives', Object.keys(fresh6.amazon.items), ['two-sum']);
  check('Day 1 re-anchors to today, the window is the full 28 days', [fresh6.program.startedOn, fresh6.program.amazonWindowDays, fresh6.program.amazonExtendedDays], [TODAY, 28, 0]);
  check('work, labs, weight and preferences survive', [fresh6.work.length, fresh6.health.labs.length, Object.keys(fresh6.health.weight).length, fresh6.settings.emailEnabled, fresh6.settings.dsaTargetPerDay], [1, 1, 1, false, 4]);
  check('a never-started programme stays not started', Boolean(E.freshForNewEpoch(E.parseState({ dataEpoch: 5 }), TODAY).program.startedOn), false);
  check('programInfo on the fresh state is Day 1 of 28 today', [E.programInfo(fresh6, TODAY).day, E.programInfo(fresh6, TODAY).amazon.windowDays], [1, 28]);
  const reset = E.freshKeepingSettings({ ...fresh6, settings: { ...fresh6.settings, wakeTime: '07:30' } });
  check('the manual reset starts over: not started, tracker empty, timetable kept', [Boolean(reset.program.startedOn), Object.keys(reset.amazon.items).length, reset.settings.wakeTime, reset.runs.length], [false, 0, '07:30', 1]);
}

console.log(`\n${fail === 0 ? 'ALL ENGINE CHECKS PASSED' : `${fail} ENGINE CHECK(S) FAILED`}\n`);
process.exit(fail === 0 ? 0 : 1);
