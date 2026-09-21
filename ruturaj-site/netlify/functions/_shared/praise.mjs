// Mirrors src/engine/praise.ts so the evening mail names the same wins the app
// does. Every line is derived from a real delta against yesterday — praise that
// fires regardless of performance stops meaning anything within a week.

const stats = (state, date) => {
  const attempts = (state.dsa ?? []).filter((a) => a.date === date);
  const runs = (state.runs ?? []).filter((r) => r.date === date);
  const log = state.days?.[date];
  const planned = log?.planned?.length ?? 0;
  const completed = log?.completed?.length ?? 0;
  return {
    dsa: attempts.length,
    runs: runs.length,
    km: Number(runs.reduce((n, r) => n + r.km, 0).toFixed(1)),
    focus: (state.deepWork ?? [])
      .filter((d) => d.date === date)
      .reduce((n, d) => n + d.actualMinutes, 0),
    planned,
    completed,
    score: planned ? Math.round((completed / planned) * 100) : undefined,
  };
};

export function buildPraise(state, date, addDays) {
  const s = state ?? {};
  const t = stats(s, date);
  const y = stats(s, addDays(date, -1));
  const wins = [];

  if (y.dsa === 0 && t.dsa > 0)
    wins.push({
      label: 'DSA is off zero',
      detail: `Yesterday: nothing logged. Today: ${t.dsa}. Starting again is the hard part and you did it.`,
    });
  if (y.focus === 0 && t.focus > 0)
    wins.push({
      label: 'Focused work is back',
      detail: `${t.focus} minutes of deep work after a day with none.`,
    });
  if (y.runs === 0 && t.runs > 0)
    wins.push({ label: 'Back to running', detail: `${t.km} km after a rest day.` });
  if (y.dsa > 0 && t.dsa > y.dsa)
    wins.push({
      label: 'More DSA than yesterday',
      detail: `${y.dsa} → ${t.dsa} problems.`,
    });
  if (t.score !== undefined && y.score !== undefined && t.score > y.score)
    wins.push({
      label: 'Better day than yesterday',
      detail: `${y.score}% → ${t.score}% of what you planned.`,
    });
  if (y.focus > 0 && t.focus > y.focus)
    wins.push({ label: 'Longer focus', detail: `${y.focus} → ${t.focus} minutes.` });
  if (t.score === 100 && t.planned > 0)
    wins.push({
      label: 'Cleared everything you planned',
      detail: `${t.completed} of ${t.planned}. A clean day.`,
    });

  let headline;
  if (wins.length === 0) {
    headline =
      t.completed === 0 && t.dsa === 0 && t.focus === 0
        ? 'Nothing logged today'
        : 'Steady day';
  } else if (y.dsa === 0 && t.dsa > 0) {
    headline = 'You turned it around today';
  } else {
    headline = 'Better than yesterday';
  }

  return { hasWins: wins.length > 0, headline, wins, today: t, yesterday: y };
}
