import { CheckCircle2 } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { Card, SectionTitle, Chip } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { todayISO, addDays, weekStartISO, weekdayOf, formatShort } from '@/engine/dates';
import { SESSIONS, WEEKLY_SESSION, sessionById } from '@/data/fitness';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Monday to Sunday of this week: which session each day holds, today marked,
 * logged days ticked, and the progression note behind each session.
 */
export function WeekPlan() {
  const state = useAppState();
  const today = todayISO();
  const start = weekStartISO(today);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const loggedDates = new Set(state.runs.filter((r) => r.kind !== 'rest').map((r) => r.date));

  return (
    <section>
      <SectionTitle
        action={
          <span className="tnum text-[11px] text-faint">
            {formatShort(start)} – {formatShort(addDays(start, 6))}
          </span>
        }
      >
        This week
      </SectionTitle>
      <Card>
        <ol className="divide-y divide-line">
          {days.map((date) => {
            const session = sessionById(WEEKLY_SESSION[weekdayOf(date)] ?? 'run-easy') ?? SESSIONS[0];
            const isToday = date === today;
            const rest = state.exerciseOverrides[date] === 'rest';
            const done = loggedDates.has(date);
            return (
              <li
                key={date}
                className={cn('flex items-center gap-3 py-2.5', isToday && '-mx-2 rounded-[10px] bg-accent-soft px-2')}
              >
                <span className={cn('tnum w-[34px] shrink-0 font-mono text-[12px]', isToday ? 'text-accent' : 'text-faint')}>
                  {DOW[weekdayOf(date)]}
                </span>
                <span className={cn('min-w-0 flex-1 truncate text-[14px]', rest ? 'text-muted line-through' : 'text-fg')}>
                  {session?.name}
                </span>
                {rest && <Chip>Rest</Chip>}
                <span className="tnum shrink-0 font-mono text-[12px] text-muted">{session?.minutes} min</span>
                {done ? <CheckCircle2 size={16} className="shrink-0 text-success" /> : <span className="size-[16px] shrink-0" />}
              </li>
            );
          })}
        </ol>

        <div className="mt-4 border-t border-line pt-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-faint">How each session progresses</p>
          <ul className="mt-2 space-y-1.5">
            {SESSIONS.map((s) => (
              <li key={s.id} className="text-[12.5px] leading-snug text-muted">
                <span className="font-medium text-fg">{s.name}:</span> {s.note}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </section>
  );
}
