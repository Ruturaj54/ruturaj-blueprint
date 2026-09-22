// Boundary verification for the 117-day mission engine.
// Mirrors src/engine logic in plain JS so it runs with no build step.
const MISSION_START = '2026-09-23';
const TOTAL_DAYS = 161;
const MS = 86400000;
const parse = (s) => new Date(`${s}T12:00:00`);
const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dateForDay = (n) => { const d = parse(MISSION_START); d.setDate(d.getDate() + (n - 1)); return fmt(d); };
const dayForDate = (s) => Math.round((parse(s) - parse(MISSION_START)) / MS) + 1;
const weekOfDay = (n) => Math.ceil(n / 7);

const PHASES = [
  { id: 'm1', title: 'Foundation Gate', startDay: 1, endDay: 42 },
  { id: 'm2', title: 'SDE Fundamentals + AI', startDay: 43, endDay: 91 },
  { id: 'm3', title: 'Interview-Level Prep', startDay: 92, endDay: 133 },
  { id: 'm4', title: 'Interview Execution', startDay: 134, endDay: TOTAL_DAYS },
];
const phaseFor = (n) => PHASES.find((p) => n >= p.startDay && n <= p.endDay);

let fail = 0;
const check = (label, actual, expected) => {
  const ok = String(actual) === String(expected);
  if (!ok) fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(44)} ${actual}${ok ? '' : `   (expected ${expected})`}`);
};

console.log('\n=== PHASE TILING (no gaps, no overlaps, covers 1..117) ===');
let covered = 0;
for (let i = 0; i < PHASES.length; i++) {
  const p = PHASES[i];
  covered += p.endDay - p.startDay + 1;
  if (i > 0) check(`${p.id} starts right after ${PHASES[i - 1].id}`, p.startDay, PHASES[i - 1].endDay + 1);
}
check('total days covered by phases', covered, TOTAL_DAYS);
check('last phase ends on TOTAL_DAYS', PHASES.at(-1).endDay, TOTAL_DAYS);

console.log('\n=== BOUNDARY DAYS → PHASE ===');
const bounds = [
  [1, 'm1'], [42, 'm1'], [43, 'm2'], [91, 'm2'],
  [92, 'm3'], [133, 'm3'], [134, 'm4'], [161, 'm4'],
];
for (const [day, expected] of bounds) {
  const p = phaseFor(day);
  check(`day ${String(day).padStart(3)} → phase`, p.id, expected);
}

console.log('\n=== BOUNDARY DAYS → DATE ===');
const dates = [
  [1, '2026-09-23'], [42, '2026-11-03'], [43, '2026-11-04'], [91, '2026-12-22'],
  [92, '2026-12-23'], [133, '2027-02-02'], [134, '2027-02-03'], [161, '2027-03-02'],
];
for (const [day, expected] of dates) check(`day ${String(day).padStart(3)} → date`, dateForDay(day), expected);

console.log('\n=== ROUND TRIP day → date → day ===');
for (const [day] of dates) check(`round trip day ${String(day).padStart(3)}`, dayForDate(dateForDay(day)), day);

console.log('\n=== WEEKS ===');
check('day 1 is week 1', weekOfDay(1), 1);
check('day 7 is week 1', weekOfDay(7), 1);
check('day 8 is week 2', weekOfDay(8), 2);
check('day 161 is week 23', weekOfDay(161), 23);

console.log('\n=== DAY 1 SANITY ===');
check('Day 1 is a Wednesday', parse(dateForDay(1)).getDay(), 3);
check('Day 161 is a Tuesday', parse(dateForDay(161)).getDay(), 2);
check('days remaining on day 1', TOTAL_DAYS - 1, 160);

console.log(`\n${fail === 0 ? 'ALL CHECKS PASSED' : `${fail} CHECK(S) FAILED`}\n`);
process.exit(fail === 0 ? 0 : 1);
