// "You are growing" — real totals since Day 1, and the week in numbers for
// the weekend mails. Every figure is counted from the state blob; nothing is
// estimated, and a zero is reported as a zero.

const plannedHits = (log) => {
  const planned = new Set(log?.planned ?? []);
  return (log?.completed ?? []).filter((id) => planned.has(id)).length;
};

/** Totals across the whole mission so far. */
export function growthSince(state, missionStart, today) {
  const inMission = (d) => d >= missionStart && d <= today;
  const runs = (state.runs ?? []).filter((r) => inMission(r.date));
  const focus = (state.deepWork ?? []).filter((d) => inMission(d.date));
  const days = Object.entries(state.days ?? {}).filter(([d]) => inMission(d));
  return {
    modules: Object.values(state.foundation ?? {}).filter(Boolean).length,
    tasks: Object.values(state.tasks ?? {}).filter((t) => t?.status === 'done').length,
    problems: (state.dsa ?? []).filter((a) => inMission(a.date) && a.outcome === 'solved').length,
    runs: runs.length,
    km: Math.round(runs.reduce((n, r) => n + (Number(r.km) || 0), 0) * 10) / 10,
    focusHours: Math.round(focus.reduce((n, d) => n + (Number(d.actualMinutes) || 0), 0) / 6) / 10,
    daysStarted: days.length,
    cleanDays: days.filter(([, log]) => (log.planned?.length ?? 0) > 0 && plannedHits(log) >= log.planned.length).length,
  };
}

/**
 * Monday to `today`. Saturday's mail reads it as "the week so far", Sunday's
 * as the week's close.
 */
export function weekSummary(state, today, addDays, missionStart) {
  const dow = new Date(`${today}T12:00:00`).getDay();
  const monday = addDays(today, -(dow === 0 ? 6 : dow - 1));
  const dates = [];
  for (let d = monday; d <= today; d = addDays(d, 1)) if (d >= missionStart) dates.push(d);

  let planned = 0;
  let hits = 0;
  let best = null;
  const quiet = [];
  for (const d of dates) {
    const log = state.days?.[d];
    const p = log?.planned?.length ?? 0;
    const h = plannedHits(log);
    planned += p;
    hits += h;
    if (!log || h === 0) quiet.push(d);
    const score = p ? Math.round((Math.min(h, p) / p) * 100) : null;
    if (score !== null && (!best || score > best.score)) best = { date: d, score };
  }

  const inWeek = (x) => dates.includes(x.date);
  const runs = (state.runs ?? []).filter(inWeek);
  return {
    monday,
    days: dates.length,
    planned,
    hits,
    pct: planned ? Math.round((hits / planned) * 100) : null,
    best,
    quietDays: quiet.length,
    problems: (state.dsa ?? []).filter((a) => inWeek(a) && a.outcome === 'solved').length,
    runs: runs.length,
    km: Math.round(runs.reduce((n, r) => n + (Number(r.km) || 0), 0) * 10) / 10,
    focusMinutes: (state.deepWork ?? []).filter(inWeek).reduce((n, d) => n + (Number(d.actualMinutes) || 0), 0),
  };
}
