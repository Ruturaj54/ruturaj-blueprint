import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, Chip, PriorityPill, ProgressBar } from '@/components/ui/primitives';
import { TaskCheckbox } from '@/components/ui/controls';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import { TRACK_META } from '@/data/tasks';
import { trackReadiness } from '@/engine/readiness';
import { todayISO } from '@/engine/dates';
import type { Task, TrackId } from '@/engine/types';

/**
 * One track: the weighted readiness number, its four dimensions (so a high
 * "learning" figure cannot pass as readiness), and the task list behind a fold.
 */
export function TrackCard({
  track,
  tasks,
  locked,
  forceOpen,
}: {
  track: TrackId;
  tasks: readonly Task[];
  locked: boolean;
  forceOpen: boolean;
}) {
  const state = useAppState();
  const update = useUpdateState();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const expanded = forceOpen || open;

  const readiness = trackReadiness(state, track);
  const meta = TRACK_META[track];
  const dims = [
    ['Learning', readiness.progress.learning],
    ['Practice', readiness.progress.practice],
    ['Shipped', readiness.progress.demonstration],
    ['Interview', readiness.progress.interview],
  ] as const;

  const toggle = (id: string, next: boolean) => {
    if (locked) return;
    update((draft) => {
      draft.tasks[id] = { ...draft.tasks[id], status: next ? 'done' : 'todo', completedOn: next ? todayISO() : undefined };
    });
  };

  return (
    <Card className="p-0">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={reduce ? undefined : { scale: 0.99 }}
        transition={spring}
        aria-expanded={expanded}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[15px] font-medium leading-snug">{meta.name}</p>
            <p className="mt-0.5 text-[12px] text-muted">{meta.blurb}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="tnum font-display text-[20px] font-bold">{readiness.overall}%</span>
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={reduce ? { duration: 0 } : spring} className="text-faint">
              <ChevronDown size={16} />
            </motion.span>
          </div>
        </div>

        <ProgressBar value={readiness.overall} className="mt-3" />

        <div className="mt-3 grid grid-cols-4 gap-2">
          {dims.map(([label, value]) => (
            <div key={label}>
              <p className="tnum font-mono text-[13px]">{value}%</p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-faint">{label}</p>
            </div>
          ))}
        </div>
      </motion.button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : spring}
            className="overflow-hidden"
          >
            <div className={cn('border-t border-line px-2 pb-2', locked && 'opacity-55')}>
              {tasks.map((t) => (
                <TaskCheckbox
                  key={t.id}
                  checked={state.tasks[t.id]?.status === 'done'}
                  onChange={(v) => toggle(t.id, v)}
                  label={
                    <span className="flex flex-wrap items-center gap-2">
                      {t.title}
                      <PriorityPill priority={t.priority} />
                    </span>
                  }
                  sublabel={
                    <span className="flex flex-wrap gap-1.5">
                      <Chip>{t.estMinutes} min</Chip>
                      <Chip>{t.proof}</Chip>
                      {t.source && <Chip>{t.source}</Chip>}
                      {t.interviewCritical && <Chip tone="accent">Interview</Chip>}
                      {t.portfolioCritical && <Chip tone="info">Portfolio</Chip>}
                    </span>
                  }
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
