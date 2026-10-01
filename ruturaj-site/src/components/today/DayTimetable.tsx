import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { Card, SectionTitle } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import { useAppState } from '@/hooks/useAppState';
import { useClock } from '@/hooks/useClock';
import { buildSchedule, dayTypeOf, slotAt, dayClock, formatHM } from '@/engine/schedule';
import { DAY_TYPE_LABEL, type DayType } from '@/data/routine';
import type { DailyPlan } from '@/engine/planner';
import { TimelineRow, type RowTime } from './TimelineRow';

const VIEWS: Array<{ id: DayType; label: string }> = [
  { id: 'weekday', label: 'Weekday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

/**
 * The whole day as a timetable — every entry with its time, today's work
 * inside the study blocks, and a marker on whatever is happening now. The
 * other day types can be previewed, so Friday night can see Saturday's plan.
 */
export function DayTimetable({ plan }: { plan: DailyPlan }) {
  const state = useAppState();
  const reduce = useReducedMotion();
  const todayType = dayTypeOf(plan.ctx.date);
  const [view, setView] = useState<DayType>(todayType);
  const clock = useClock();

  const schedule = buildSchedule(state, plan, view);
  const slots = schedule.slots;
  const completed = new Set(state.days[plan.ctx.date]?.completed ?? []);

  const live = view === todayType;
  const now = live ? slotAt(slots, clock) : null;
  // Before the first entry (say 05:00) the day has not begun: nothing is past.
  const started = live && dayClock(clock) >= dayClock(slots[0]?.start ?? '00:00');
  const timeOf = (i: number): RowTime => {
    if (!live) return 'future';
    if (now && slots[i] === now) return 'now';
    if (!started) return 'future';
    const s = slots[i]!;
    let end = dayClock(s.end);
    if (end <= dayClock(s.start)) end += 1440;
    return end <= dayClock(clock) ? 'past' : 'future';
  };

  return (
    <section>
      <SectionTitle
        action={
          <span className="tnum text-[11px] text-faint">
            {formatHM(schedule.totalPlanned)} of {formatHM(schedule.totalCapacity)} study
          </span>
        }
      >
        <span className="inline-flex items-center gap-1.5">
          <Clock size={13} />
          {live ? 'Today, hour by hour' : DAY_TYPE_LABEL[view]}
        </span>
      </SectionTitle>

      <div role="tablist" aria-label="Day type" className="mb-3 flex rounded-[12px] border border-line bg-surface p-1">
        {VIEWS.map((v) => {
          const active = v.id === view;
          return (
            <button
              key={v.id}
              role="tab"
              aria-selected={active}
              onClick={() => setView(v.id)}
              className={cn('relative min-h-[36px] flex-1 rounded-[9px] text-[12px] transition-colors', active ? 'text-black' : 'text-muted hover:text-fg')}
            >
              {active && (
                <motion.span
                  layoutId="day-view"
                  transition={reduce ? { duration: 0 } : spring}
                  className="absolute inset-0 rounded-[9px] bg-accent"
                />
              )}
              <span className="relative font-medium">
                {v.label}
                {v.id === todayType && <span className={cn('ml-1', active ? 'text-black/60' : 'text-accent')}>· today</span>}
              </span>
            </button>
          );
        })}
      </div>

      {!live && (
        <p className="mb-3 text-[12px] text-muted">
          Preview — today&rsquo;s missions placed into the {view} timetable.
        </p>
      )}

      <div>
        {slots.map((slot, i) => (
          <TimelineRow
            key={`${view}-${slot.id}`}
            slot={slot}
            time={timeOf(i)}
            completed={completed}
            last={i === slots.length - 1}
          />
        ))}
      </div>

      {schedule.overflow.length > 0 && (
        <Card className="mt-2.5 border-accent/25">
          <div className="flex items-start gap-2">
            <ArrowRight size={15} className="mt-0.5 shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="text-[13px]">Continues tomorrow</p>
              {schedule.overflow.map((i) => (
                <p key={i.id} className="mt-1 text-[12px] text-muted">
                  {i.title} <span className="tnum text-faint">— {formatHM(i.minutes)} left</span>
                </p>
              ))}
              <p className="mt-1.5 text-[12px] text-faint">
                Today&rsquo;s blocks are full. It moves to the top of tomorrow&rsquo;s plan rather than coming out of your sleep.
              </p>
            </div>
          </div>
        </Card>
      )}
    </section>
  );
}
