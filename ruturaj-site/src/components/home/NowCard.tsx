import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Card, Chip, ProgressBar } from '@/components/ui/primitives';
import { useAppState } from '@/hooks/useAppState';
import { useClock } from '@/hooks/useClock';
import { spring } from '@/lib/motion';
import { buildSchedule, dayTypeOf, slotAt, nextSlot, formatHM, blockMinutes, dayClock, type SlotItem } from '@/engine/schedule';
import { exerciseSlotFor } from '@/engine/fitness';
import { dayModeFor } from '@/engine/today-items';
import { DAY_TYPE_LABEL } from '@/data/routine';
import { withDinner } from '@/data/meals';

/** A dot with a ring that keeps breathing outward: this card is live. */
function LiveDot({ reduce }: { reduce: boolean }) {
  return (
    <span className="relative grid size-[14px] place-items-center" aria-hidden>
      {!reduce && (
        <motion.span
          className="absolute inset-0 rounded-full bg-accent"
          animate={{ scale: [1, 2.3], opacity: [0.45, 0] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <span className="relative size-[8px] rounded-full bg-accent" />
    </span>
  );
}

/**
 * "What should I be doing right now?" without opening the full timetable:
 * the current entry with how much of it is left, the first open item inside
 * it, and what comes next. The title cross-fades when the block changes.
 * Tapping anywhere opens the timetable section.
 */
export function NowCard({ items, date, onOpen }: { items: SlotItem[]; date: string; onOpen: () => void }) {
  const state = useAppState();
  const reduce = useReducedMotion();
  const clock = useClock();
  const schedule = buildSchedule(state.settings, items, dayTypeOf(date), exerciseSlotFor(state, date), dayModeFor(state, date));
  const slots = withDinner(schedule.slots, date, state.settings.walkTargetKm);
  const now = slotAt(slots, clock);
  const next = nextSlot(slots, clock) ?? slots[0] ?? null;
  const completed = new Set(state.days[date]?.completed ?? []);
  const open = now?.items.filter((i) => !completed.has(i.id)) ?? [];
  const lead = open[0];
  const total = now ? blockMinutes(now.start, now.end) : 0;
  const elapsed = now ? (((dayClock(clock) - dayClock(now.start)) % 1440) + 1440) % 1440 : 0;
  const left = Math.max(0, total - elapsed);

  return (
    <Card className="border-accent/25 p-0">
      <motion.button
        type="button"
        onClick={onOpen}
        whileTap={reduce ? undefined : { scale: 0.985 }}
        transition={spring}
        className="block w-full p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <LiveDot reduce={Boolean(reduce)} />
          <p className="tnum text-[11px] uppercase tracking-[0.14em] text-accent">Right now · {clock}</p>
          <span className="ml-auto text-[11px] text-faint">{DAY_TYPE_LABEL[schedule.dayType]}</span>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={now?.id ?? 'between'}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={spring}
          >
            <p className="mt-2 font-display text-[20px] font-bold leading-tight text-fg">{now ? now.label : 'Between entries'}</p>
            {now && (
              <div className="mt-1.5">
                <div className="tnum flex items-baseline justify-between font-mono text-[12px] text-muted">
                  <span>
                    {now.start} – {now.end}
                  </span>
                  <span className="text-accent">{left > 0 ? `${formatHM(left)} left` : 'ending'}</span>
                </div>
                <ProgressBar value={total ? (elapsed / total) * 100 : 0} tone="accent" className="mt-1.5" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {lead ? (
          <div className="mt-3 rounded-[10px] border border-line bg-raised px-3 py-2.5">
            <p className="text-[13px] text-fg">{lead.title}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Chip tone={lead.kind === 'dsa' ? 'info' : 'accent'}>{formatHM(lead.minutes)}</Chip>
              <Chip>{lead.context}</Chip>
              {open.length > 1 && <Chip>+{open.length - 1} more in this block</Chip>}
            </div>
          </div>
        ) : (
          now && (
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              {now.items.length > 0 ? 'Everything placed in this block is ticked. Use the time for the next block or rest.' : now.note}
            </p>
          )
        )}

        {next && next !== now && (
          <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-[13px]">
            <span className="text-faint">Next</span>
            <span className="tnum font-mono text-[12px] text-muted">{next.start}</span>
            <span className="min-w-0 flex-1 truncate text-fg">{next.label}</span>
            <ArrowRight size={14} className="shrink-0 text-faint" />
          </div>
        )}
      </motion.button>
    </Card>
  );
}
