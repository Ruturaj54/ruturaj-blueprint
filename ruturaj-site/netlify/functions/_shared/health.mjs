// The health part of the digest: his own tracking, what his doctor directed,
// and general evidence for the focus areas he switched on. Tracks and informs;
// never diagnoses, never sets a dose. Everything personal comes from the
// private state blob — the library text comes from src/data/health.ts.

import catalog from './catalog.json' with { type: 'json' };

const byDate = (a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);

/** Consecutive days, ending today or yesterday, on which `habitId` was ticked. */
function habitStreak(habits, habitId, today, addDays) {
  let cursor = (habits[today] ?? []).includes(habitId) ? today : addDays(today, -1);
  let n = 0;
  while ((habits[cursor] ?? []).includes(habitId)) {
    n += 1;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export function healthDigest(state, today, day, addDays) {
  const h = state.health ?? {};
  const habits = state.habits ?? {};

  const focus = (h.focus ?? [])
    .map((id) => catalog.healthFocus.find((f) => f.id === id))
    .filter(Boolean);

  // One "do" and one "avoid" a day, rotating through every focus area he
  // picked, so the mail says something different each morning.
  const dos = focus.flatMap((f) => f.do.map((line) => ({ area: f.label, line })));
  const avoids = focus.flatMap((f) => f.avoid.map((line) => ({ area: f.label, line })));
  const pick = (list, salt) => (list.length ? list[(day * 7 + salt) % list.length] : null);

  const active = (h.supplements ?? []).filter((s) => s.active);
  const taken = new Set(h.adherence?.[today] ?? []);
  const asItem = (s) => ({
    name: s.name,
    dose: s.dose || null,
    timing: s.timing ?? 'morning',
    taken: taken.has(s.id),
  });

  const weights = Object.entries(h.weight ?? {})
    .filter(([, kg]) => typeof kg === 'number' && kg > 0)
    .sort(byDate);
  const weight = weights.length
    ? {
        first: { date: weights[0][0], kg: weights[0][1] },
        latest: { date: weights.at(-1)[0], kg: weights.at(-1)[1] },
        change: Math.round((weights.at(-1)[1] - weights[0][1]) * 10) / 10,
        entries: weights.length,
      }
    : null;

  // Most recent value per marker, newest first, verbatim as he entered it.
  const latestByMarker = new Map();
  for (const lab of [...(h.labs ?? [])].sort((a, b) => (a.date < b.date ? 1 : -1))) {
    if (!latestByMarker.has(lab.marker)) latestByMarker.set(lab.marker, lab);
  }
  const labs = [...latestByMarker.values()].slice(0, 4).map((l) => ({
    marker: l.marker,
    value: `${l.value}${l.unit ? ` ${l.unit}` : ''}`,
    date: l.date,
  }));

  const daysToTest = h.nextTestDate
    ? Math.round((new Date(`${h.nextTestDate}T12:00:00`) - new Date(`${today}T12:00:00`)) / 86_400_000)
    : null;

  const doneToday = new Set(habits[today] ?? []);
  return {
    hasFocus: focus.length > 0,
    areas: focus.map((f) => f.label),
    tipDo: pick(dos, 0),
    tipAvoid: pick(avoids, 3),
    // A second, different line for the mail's "Avoid today" list.
    tipAvoidAlt: pick(avoids, 5),
    evidence: focus.length ? focus[day % focus.length].evidence : null,
    evidenceArea: focus.length ? focus[day % focus.length].label : null,
    doctor: active.filter((s) => s.directedBy === 'doctor').map(asItem),
    self: active.filter((s) => s.directedBy !== 'doctor').map(asItem),
    habits: {
      done: catalog.habits.filter((x) => doneToday.has(x.id)).map((x) => x.label),
      missed: catalog.habits.filter((x) => !doneToday.has(x.id)).map((x) => x.label),
      total: catalog.habits.length,
    },
    noSugarStreak: habitStreak(habits, 'no-sugar', today, addDays),
    weight,
    labs,
    nextTestDate: h.nextTestDate ?? null,
    daysToTest,
  };
}
