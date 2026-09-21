// Simulates what the planner surfaces across the mission, to check that
// "what to study when" is actually sequenced — not just scored.
import catalog from '../netlify/functions/_shared/catalog.json' with { type: 'json' };

const PHASES = [
  { id: 'P1', title: 'Foundation Gate', a: 1, b: 42 },
  { id: 'P2', title: 'SDE + AI', a: 43, b: 91 },
  { id: 'P3', title: 'Interview Prep', a: 92, b: 133 },
  { id: 'P4', title: 'Execution', a: 134, b: 161 },
];
const PRIORITY_BONUS = { P0: 45, P1: 25, P2: 8, P3: 0 };
const IW = { P1: 5, P2: 10, P3: 20, P4: 25 };
const PW = { P1: 0, P2: 15, P3: 15, P4: 5 };
const ORDER = { m1: 1, m2: 2, m3: 3, m4: 4 };
const PHASE_KEY = { P1: 'm1', P2: 'm2', P3: 'm3', P4: 'm4' };

function rank(done, phaseId, n = 3) {
  return catalog.tasks
    .filter((t) => !done.has(t.id))
    .filter((t) => (t.prereqs ?? []).every((p) => done.has(p)))
    .map((t) => ({
      t,
      s:
        t.careerValue * 8 +
        (PRIORITY_BONUS[t.priority] ?? 0) +
        (t.interviewCritical ? IW[phaseId] : 0) +
        (t.portfolioCritical ? PW[phaseId] : 0) +
        (ORDER[t.earliestPhase ?? 'm2'] > ORDER[PHASE_KEY[phaseId]] ? -70 : 0) -
        Math.round(t.estMinutes / 20),
    }))
    .sort((a, b) => b.s - a.s)
    .slice(0, n);
}

// Walk the post-gate phases, completing 3 tasks a day.
const done = new Set();
console.log('=== POST-GATE SEQUENCE (3 tasks/day) ===\n');
for (const ph of PHASES.slice(1)) {
  console.log(`--- ${ph.id} ${ph.title} (days ${ph.a}-${ph.b}) ---`);
  const seen = [];
  for (let d = ph.a; d <= ph.b; d++) {
    const top = rank(done, ph.id, 3);
    if (top.length === 0) break;
    for (const x of top) { if (ORDER[x.t.earliestPhase ?? 'm2'] > ORDER[PHASE_KEY[ph.id]]) continue; done.add(x.t.id); seen.push(x.t); }
  }
  const byTrack = {};
  for (const t of seen) byTrack[t.track] = (byTrack[t.track] ?? 0) + 1;
  console.log('  completed this phase:', seen.length, '| by track:', JSON.stringify(byTrack));
  console.log('  first 5:', seen.slice(0, 5).map((t) => `${t.priority} ${t.title.slice(0, 48)}`).join('\n            '));
  console.log('');
}
const remaining = catalog.tasks.filter((t) => !done.has(t.id));
console.log('=== LEFTOVER AFTER ALL PHASES:', remaining.length, '===');
if (remaining.length) {
  const blocked = remaining.filter((t) => (t.prereqs ?? []).some((p) => !done.has(p)));
  console.log('  permanently blocked by unmet prereqs:', blocked.length);
  for (const t of blocked.slice(0, 8)) console.log('   -', t.id, '<- needs', t.prereqs.filter((p)=>!done.has(p)).join(', '));
}
