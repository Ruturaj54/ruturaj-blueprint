import { Leaf } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle, Chip } from '@/components/ui/primitives';
import { TaskCheckbox } from '@/components/ui/controls';
import { todayISO, addDays } from '@/engine/dates';
import { DAILY_HABITS } from '@/data/health';

const WHEN_LABEL = { morning: 'Morning', day: 'All day', night: 'Night' } as const;

/** Consecutive low-sugar days ending today, or yesterday when today is not ticked yet. */
function lowSugarStreak(habits: Record<string, string[]>, today: string): number {
  let streak = 0;
  let cursor = (habits[today] ?? []).includes('no-sugar') ? today : addDays(today, -1);
  while ((habits[cursor] ?? []).includes('no-sugar')) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/** The two daily habits, ticked for today, with the low-sugar streak. */
export function HabitsCard() {
  const state = useAppState();
  const update = useUpdateState();
  const today = todayISO();
  const done = new Set(state.habits[today] ?? []);
  const streak = lowSugarStreak(state.habits, today);
  const ticked = DAILY_HABITS.filter((h) => done.has(h.id)).length;

  const toggle = (id: string, next: boolean) =>
    update((draft) => {
      const set = new Set(draft.habits[today] ?? []);
      if (next) set.add(id);
      else set.delete(id);
      draft.habits[today] = [...set];
    });

  return (
    <section>
      <SectionTitle
        action={
          <span className="tnum text-[11px] text-faint">
            {ticked} of {DAILY_HABITS.length}
          </span>
        }
      >
        <span className="inline-flex items-center gap-1.5">
          <Leaf size={13} />
          Daily habits
        </span>
      </SectionTitle>
      <Card className="p-1.5">
        {DAILY_HABITS.map((h) => (
          <TaskCheckbox
            key={h.id}
            checked={done.has(h.id)}
            onChange={(v) => toggle(h.id, v)}
            label={h.label}
            sublabel={WHEN_LABEL[h.when]}
          />
        ))}
        <div className="px-3 pb-2 pt-1 text-[12px] text-muted">
          {streak > 0 ? (
            <Chip tone="success">{streak}-day low-sugar streak</Chip>
          ) : (
            <span>No low-sugar streak yet. It starts the first day you tick it.</span>
          )}
        </div>
      </Card>
    </section>
  );
}
