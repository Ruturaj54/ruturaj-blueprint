import { Sparkles, Pill } from 'lucide-react';
import { Card, SectionTitle, TaskCheckbox, Chip } from '@/components/ui/primitives';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { todayISO, addDays } from '@/engine/dates';
import { DAILY_HABITS } from '@/data/health';

/**
 * The small things that make the big thing sustainable: skin and hair care,
 * the low-sugar day, the kitchen closing after dinner, and whatever his doctor
 * directed. Ticked here, reported in the end-of-day mail.
 */
export function DailyCare() {
  const state = useAppState();
  const update = useUpdateState();
  const today = todayISO();
  const done = new Set(state.habits[today] ?? []);
  const taken = new Set(state.health.adherence[today] ?? []);
  const items = state.health.supplements.filter((s) => s.active);

  const toggleHabit = (id: string, next: boolean) =>
    update((draft) => {
      const set = new Set(draft.habits[today] ?? []);
      if (next) set.add(id);
      else set.delete(id);
      draft.habits[today] = [...set];
    });

  const toggleItem = (id: string, next: boolean) =>
    update((draft) => {
      const set = new Set(draft.health.adherence[today] ?? []);
      if (next) set.add(id);
      else set.delete(id);
      draft.health.adherence[today] = [...set];
    });

  // Consecutive low-sugar days ending today (or yesterday, if today is not ticked yet).
  let streak = 0;
  let cursor = done.has('no-sugar') ? today : addDays(today, -1);
  while ((state.habits[cursor] ?? []).includes('no-sugar')) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  const total = DAILY_HABITS.length + items.length;
  const ticked = DAILY_HABITS.filter((h) => done.has(h.id)).length + items.filter((s) => taken.has(s.id)).length;

  return (
    <section>
      <SectionTitle
        action={
          <span className="tnum text-[11px] text-faint">
            {ticked} of {total}
            {streak > 0 && <span className="text-success"> · {streak}-day low-sugar streak</span>}
          </span>
        }
      >
        <span className="inline-flex items-center gap-1.5">
          <Sparkles size={13} />
          Daily care
        </span>
      </SectionTitle>
      <Card className="p-1.5">
        <div className="grid sm:grid-cols-2">
          {DAILY_HABITS.map((h) => (
            <TaskCheckbox
              key={h.id}
              checked={done.has(h.id)}
              onChange={(v) => toggleHabit(h.id, v)}
              label={h.label}
              sublabel={h.when === 'morning' ? 'Morning' : h.when === 'night' ? 'Night' : 'All day'}
            />
          ))}
        </div>

        <div className="mt-1 border-t border-line px-2.5 pb-1 pt-3">
          <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-faint">
            <Pill size={12} />
            Directed items
          </p>
          {items.length === 0 ? (
            <p className="mt-1.5 pb-2 text-[12px] text-muted">
              Add what your doctor directed on the Health page — it shows up here to tick, morning or night.
            </p>
          ) : (
            <div className="-mx-1.5 mt-1 grid sm:grid-cols-2">
              {items.map((s) => (
                <TaskCheckbox
                  key={s.id}
                  checked={taken.has(s.id)}
                  onChange={(v) => toggleItem(s.id, v)}
                  label={s.name}
                  sublabel={
                    <span className="flex flex-wrap items-center gap-1.5">
                      <Chip tone={s.directedBy === 'doctor' ? 'success' : 'accent'}>
                        {s.directedBy === 'doctor' ? 'Doctor-directed' : 'Self-added'}
                      </Chip>
                      <span>{s.timing === 'night' ? 'Night' : 'Morning'}</span>
                      {s.dose && <span>· {s.dose}</span>}
                    </span>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
