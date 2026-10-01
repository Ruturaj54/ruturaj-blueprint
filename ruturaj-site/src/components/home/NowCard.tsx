import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Radio } from 'lucide-react';
import { Card, Chip } from '@/components/ui/primitives';
import { useAppState } from '@/hooks/useAppState';
import { useClock } from '@/hooks/useClock';
import { spring } from '@/lib/motion';
import { buildSchedule, slotAt, nextSlot, formatHM } from '@/engine/schedule';
import { DAY_TYPE_LABEL } from '@/data/routine';
import type { DailyPlan } from '@/engine/planner';

/**
 * "What should I be doing right now?" answered without opening the full
 * timetable: the current entry, what is in it, and what comes next.
 */
export function NowCard({ plan, onOpen }: { plan: DailyPlan; onOpen: () => void }) {
  const state = useAppState();
  const reduce = useReducedMotion();
  const clock = useClock();
  const schedule = buildSchedule(state, plan);
  const now = slotAt(schedule.slots, clock);
  const next = nextSlot(schedule.slots, clock) ?? schedule.slots[0] ?? null;
  const work = now?.items.find((i) => !(state.days[plan.ctx.date]?.completed ?? []).includes(i.id));

  return (
    <Card className="border-accent/20 p-0">
      <motion.button
        type="button"
        onClick={onOpen}
        whileTap={reduce ? undefined : { scale: 0.985 }}
        transition={spring}
        className="block w-full p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-accent" />
          <p className="text-[11px] uppercase tracking-[0.14em] text-accent">Right now · {clock}</p>
          <span className="ml-auto text-[11px] text-faint">{DAY_TYPE_LABEL[schedule.dayType]}</span>
        </div>

        <p className="mt-2 font-display text-[20px] font-bold leading-tight">
          {now ? now.label : 'Between blocks'}
        </p>
        {now && (
          <p className="tnum mt-0.5 font-mono text-[12px] text-muted">
            {now.start} – {now.end}
          </p>
        )}

        {work ? (
          <div className="mt-3 rounded-[10px] border border-line bg-bg/60 px-3 py-2.5">
            <p className="text-[13px] text-fg">{work.title}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Chip tone={work.kind === 'dsa' ? 'info' : 'accent'}>{formatHM(work.minutes)}</Chip>
              <Chip>{work.context}</Chip>
            </div>
          </div>
        ) : (
          now && <p className="mt-2 text-[13px] leading-relaxed text-muted">{now.note}</p>
        )}

        {next && next !== now && (
          <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-[13px]">
            <span className="text-faint">Next</span>
            <span className="tnum font-mono text-[12px] text-muted">{next.start}</span>
            <span className="min-w-0 flex-1 truncate text-fg/90">{next.label}</span>
            <ArrowRight size={14} className="shrink-0 text-faint" />
          </div>
        )}
      </motion.button>
    </Card>
  );
}
