import { Card } from '@/components/ui/primitives';
import { Stat } from '@/components/ui/controls';
import { useAppState } from '@/hooks/useAppState';
import { todayISO, addDays } from '@/engine/dates';
import { dayScore, executionStreak } from '@/engine/scoring';

/** Four numbers, each from state: plan score, active days this week, streak, focus minutes. */
export function StatsRow() {
  const state = useAppState();
  const today = todayISO();
  const score = dayScore(state, today);
  const activeDays = Array.from({ length: 7 }, (_, i) => addDays(today, -i)).filter(
    (d) => (state.days[d]?.completed.length ?? 0) > 0,
  ).length;
  const streak = executionStreak(state);
  const focus = state.deepWork.filter((d) => d.date === today).reduce((n, d) => n + d.actualMinutes, 0);

  return (
    <Card>
      <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
        <Stat
          value={score === undefined ? '—' : score}
          unit={score === undefined ? undefined : '%'}
          label="Plan today"
          tone={score !== undefined && score >= 70 ? 'success' : 'default'}
        />
        <Stat value={activeDays} unit="of 7" label="Days with a tick" />
        <Stat
          value={streak}
          unit={streak === 1 ? 'day' : 'days'}
          label="Execution streak"
          tone={streak > 0 ? 'success' : 'default'}
        />
        <Stat value={focus} unit="min" label="Focus today" tone={focus > 0 ? 'accent' : 'default'} />
      </div>
      <p className="mt-3 text-[11.5px] leading-relaxed text-faint">
        Plan score is planned items closed, so extra ticks never inflate it. The streak counts days at 50% or
        better, from yesterday back.
      </p>
    </Card>
  );
}
