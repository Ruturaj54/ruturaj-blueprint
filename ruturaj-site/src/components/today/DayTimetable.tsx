import { useCallback, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronDown, Clock } from 'lucide-react';
import { Card } from '@/components/ui/primitives';
import { Segmented } from '@/components/ui/controls';
import { spring } from '@/lib/motion';
import { useAppState } from '@/hooks/useAppState';
import { useClock } from '@/hooks/useClock';
import {
  buildSchedule,
  dayTypeOf,
  slotAt,
  dayClock,
  formatHM,
  type Slot,
  type SlotItem,
  type ExerciseSlot,
} from '@/engine/schedule';
import { exerciseSlotFor } from '@/engine/fitness';
import { DAY_TYPE_LABEL, type DayType } from '@/data/routine';
import { TimelineRow, type RowTime } from './TimelineRow';
import { TIMETABLE_ANCHOR_ID, useTimetableReveal } from './timetableReveal';

const VIEWS: readonly DayType[] = ['weekday', 'saturday', 'sunday'];

/** Open by default where there is room; a phone gets the one-line summary. */
const startOpen = (): boolean => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches;

/**
 * The whole day as a timetable: every entry with its time, today's work placed
 * into the study blocks, a marker on what is happening now. Other day types
 * can be previewed, so Friday night can see what Saturday asks for.
 */
export function DayTimetable({ items, date }: { items: SlotItem[]; date: string }) {
  const state = useAppState();
  const reduce = useReducedMotion();
  const clock = useClock();
  const todayType = dayTypeOf(date);
  const [view, setView] = useState<DayType>(todayType);
  const [open, setOpen] = useState(startOpen);
  useTimetableReveal(useCallback(() => setOpen(true), []));

  const live = view === todayType;
  // A weekday preview from a weekend uses his default slot; weekends run in the morning by design.
  const exercise: ExerciseSlot = live ? exerciseSlotFor(state, date) : view === 'weekday' ? state.settings.exerciseSlot : 'morning';
  const schedule = buildSchedule(state.settings, items, view, exercise);
  const slots = schedule.slots;
  const completed = new Set(state.days[date]?.completed ?? []);

  const now = live ? slotAt(slots, clock) : null;
  // Before the first entry the day has not begun, so nothing reads as past.
  const begun = live && dayClock(clock) >= dayClock(slots[0]?.start ?? '00:00');
  const timeOf = (slot: Slot): RowTime => {
    if (!live) return 'future';
    if (slot === now) return 'now';
    if (!begun) return 'future';
    let end = dayClock(slot.end);
    if (end <= dayClock(slot.start)) end += 1440;
    return end <= dayClock(clock) ? 'past' : 'future';
  };

  const summary = `${formatHM(schedule.totalPlanned)} of ${formatHM(schedule.totalCapacity)} study`;

  return (
    <section id={TIMETABLE_ANCHOR_ID} className="scroll-mt-[64px]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mb-3 flex min-h-[44px] w-full items-center gap-3 text-left"
      >
        <h2 className="inline-flex items-center gap-1.5 font-display text-[13px] font-bold uppercase tracking-[0.12em] text-muted">
          <Clock size={13} />
          {live ? 'Today, hour by hour' : `${DAY_TYPE_LABEL[view]} preview`}
        </h2>
        <span className="tnum ml-auto text-[11px] text-faint">{summary}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={reduce ? { duration: 0 } : spring} className="text-faint">
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="timetable"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.22 }}
            className="overflow-hidden"
          >
            <Segmented
              value={view}
              onChange={setView}
              layoutId="day-view"
              className="mb-3"
              options={VIEWS.map((id) => ({ id, label: DAY_TYPE_LABEL[id], hint: id === todayType ? 'today' : undefined }))}
            />
            {!live && (
              <p className="mb-3 text-[12px] text-muted">
                Preview: today&rsquo;s items placed into the {DAY_TYPE_LABEL[view].toLowerCase()} timetable.
              </p>
            )}

            <div>
              {slots.map((slot, i) => (
                <TimelineRow
                  key={`${view}-${slot.id}`}
                  slot={slot}
                  time={timeOf(slot)}
                  completed={completed}
                  last={i === slots.length - 1}
                />
              ))}
            </div>

            {schedule.overflow.length > 0 && <OverflowCard items={schedule.overflow} />}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function OverflowCard({ items }: { items: SlotItem[] }) {
  return (
    <Card tone="accent" className="mt-2.5" animate={false}>
      <div className="flex items-start gap-2">
        <ArrowRight size={15} className="mt-0.5 shrink-0 text-accent" />
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-fg">Continues tomorrow</p>
          {items.map((i) => (
            <p key={i.id} className="mt-1 text-[12px] text-muted">
              {i.title} <span className="tnum text-faint">— {formatHM(i.minutes)} left</span>
            </p>
          ))}
          <p className="mt-1.5 text-[12px] text-faint">
            Today&rsquo;s blocks are full. This moves to the top of tomorrow rather than coming out of your sleep.
          </p>
        </div>
      </div>
    </Card>
  );
}
