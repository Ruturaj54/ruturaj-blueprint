import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Lock, Search } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle, Chip, PriorityPill, ProgressBar, TaskCheckbox } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { ALL_TASKS, TRACK_META } from '@/data/tasks';
import { trackReadiness, READINESS_TRACKS } from '@/engine/readiness';
import { todayISO } from '@/engine/dates';
import type { TrackId } from '@/engine/types';

/**
 * All advanced-phase tracks with search and a per-track progress read.
 *
 * Stays visible while the gate is shut — seeing what is coming is motivating —
 * but ticking is disabled so Month 1 cannot be skipped by working ahead here.
 */
export function TrackBoard({ locked }: { locked: boolean }) {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const matches = (track: TrackId) =>
    ALL_TASKS.filter(
      (t) =>
        t.track === track &&
        (q === '' ||
          t.title.toLowerCase().includes(q) ||
          t.rationale?.toLowerCase().includes(q) ||
          t.source?.toLowerCase().includes(q)),
    );

  return (
    <section>
      <SectionTitle
        action={
          locked ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-faint">
              <Lock size={12} />
              Locked until the gate clears
            </span>
          ) : undefined
        }
      >
        Career tracks
      </SectionTitle>

      <div className="relative mb-3">
        <Search
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks, sources, rationale"
          className="h-[44px] w-full rounded-[10px] border border-line bg-surface pl-9 pr-3 text-[14px] text-fg outline-none placeholder:text-faint focus:border-line2"
        />
      </div>

      <div className="space-y-3">
        {READINESS_TRACKS.map((track) => {
          const tasks = matches(track);
          if (q !== '' && tasks.length === 0) return null;
          return <TrackCard key={track} track={track} tasks={tasks} locked={locked} forceOpen={q !== ''} />;
        })}
      </div>
    </section>
  );
}

function TrackCard({
  track,
  tasks,
  locked,
  forceOpen,
}: {
  track: TrackId;
  tasks: typeof ALL_TASKS;
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

  const toggle = (id: string, next: boolean) => {
    if (locked) return;
    update((draft) => {
      draft.tasks[id] = {
        ...draft.tasks[id],
        status: next ? 'done' : 'todo',
        completedOn: next ? todayISO() : undefined,
      };
    });
  };

  return (
    <Card className="p-0">
      <button onClick={() => setOpen((v) => !v)} className="w-full p-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[15px] font-medium">{meta.name}</p>
            <p className="mt-0.5 text-[12px] text-muted">{meta.blurb}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="tnum font-display text-[20px] font-bold">{readiness.overall}%</span>
            <motion.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={reduce ? { duration: 0 } : undefined}
              className="text-faint"
            >
              <ChevronDown size={16} />
            </motion.span>
          </div>
        </div>

        <ProgressBar value={readiness.overall} className="mt-3" />

        {/* The four dimensions, so a high "learning" number cannot masquerade
            as readiness. */}
        <div className="mt-3 grid grid-cols-4 gap-2">
          {(
            [
              ['Learning', readiness.progress.learning],
              ['Practice', readiness.progress.practice],
              ['Shipped', readiness.progress.demonstration],
              ['Interview', readiness.progress.interview],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <p className="tnum font-mono text-[13px]">{value}%</p>
              <p className="text-[10px] uppercase tracking-[0.08em] text-faint">{label}</p>
            </div>
          ))}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.22 }}
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
