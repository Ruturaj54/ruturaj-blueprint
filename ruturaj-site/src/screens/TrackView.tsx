import { motion } from 'framer-motion';
import { Lock, Target, FolderGit2 } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle, ProgressBar, Chip, PriorityPill, TaskCheckbox } from '@/components/ui/primitives';
import { listContainer } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { ALL_TASKS, TRACK_META, PROJECTS } from '@/data/tasks';
import { trackReadiness } from '@/engine/readiness';
import { gateStatus } from '@/engine/foundation';
import { scoreTask } from '@/engine/priority';
import { weakPatternIds } from '@/engine/dsa';
import { dayContext } from '@/engine/mission';
import { isBehindSchedule } from '@/engine/planner';
import { currentDay, todayISO } from '@/engine/dates';
import type { TrackId } from '@/engine/types';

/**
 * Shared body for the AI and SDE screens. Both are "here is the next thing in
 * these tracks, and here is where the tracks actually stand" — the difference
 * is which tracks and which framing.
 */
export function TrackView({
  tracks,
  headline,
  blurb,
  showProjects = false,
}: {
  tracks: TrackId[];
  headline: string;
  blurb: string;
  showProjects?: boolean;
}) {
  const state = useAppState();
  const update = useUpdateState();
  const gate = gateStatus(state);
  const locked = !gate.unlocked;
  const ctx = dayContext(currentDay());

  const scoreCtx = {
    state,
    phase: ctx.phase,
    weakPatterns: weakPatternIds(state),
    behindSchedule: isBehindSchedule(state),
  };

  const candidates = ALL_TASKS.filter(
    (t) => tracks.includes(t.track) && state.tasks[t.id]?.status !== 'done',
  )
    .map((t) => scoreTask(t, scoreCtx))
    .filter((s) => !s.blocked)
    .sort((a, b) => b.score - a.score);

  const next = candidates[0];

  const toggle = (id: string, done: boolean) => {
    if (locked) return;
    update((draft) => {
      draft.tasks[id] = {
        ...draft.tasks[id],
        status: done ? 'done' : 'todo',
        completedOn: done ? todayISO() : undefined,
      };
    });
  };

  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-7">
      {/* ---- today's task ---- */}
      <Card className={cn(!locked && 'border-accent/30')}>
        <div className="flex items-center gap-2 text-muted">
          <Target size={15} />
          <p className="text-[12px] uppercase tracking-[0.12em]">{headline}</p>
        </div>
        <p className="mt-2 text-[13px] text-muted">{blurb}</p>

        {locked ? (
          <div className="mt-4 flex items-start gap-2 rounded-[10px] border border-line bg-bg p-3">
            <Lock size={15} className="mt-0.5 shrink-0 text-accent" />
            <p className="text-[13px] text-muted">
              Locked until the Foundation Gate clears — {gate.mandatoryTotal - gate.mandatoryDone} mandatory
              milestones left. Everything below is visible so you know what is coming.
            </p>
          </div>
        ) : next ? (
          <div className="mt-4 rounded-[10px] border border-line bg-bg p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint">Do this next</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-medium">{next.task.title}</p>
              <PriorityPill priority={next.task.priority} />
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Chip>{next.task.estMinutes} min</Chip>
              <Chip>{next.task.proof}</Chip>
            </div>
            {next.task.rationale && (
              <p className="mt-2.5 border-t border-line pt-2.5 text-[12px] text-muted">
                {next.task.rationale}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-4 text-[13px] text-muted">
            Every unblocked task in these tracks is done.
          </p>
        )}
      </Card>

      {/* ---- tracks ---- */}
      {tracks.map((track) => {
        const readiness = trackReadiness(state, track);
        const tasks = ALL_TASKS.filter((t) => t.track === track);
        if (tasks.length === 0) return null;

        return (
          <section key={track}>
            <SectionTitle
              action={
                <span className="tnum text-[11px] text-faint">
                  {readiness.done}/{readiness.total}
                </span>
              }
            >
              {TRACK_META[track].name}
            </SectionTitle>
            <Card className="p-0">
              <div className="p-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-[13px] text-muted">{TRACK_META[track].blurb}</p>
                  <span className="tnum font-display text-[20px] font-bold">
                    {readiness.overall}%
                  </span>
                </div>
                <ProgressBar value={readiness.overall} className="mt-2.5" />
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
              </div>

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
                        {t.interviewCritical && <Chip tone="accent">Interview</Chip>}
                        {t.portfolioCritical && <Chip tone="info">Portfolio</Chip>}
                      </span>
                    }
                  />
                ))}
              </div>
            </Card>
          </section>
        );
      })}

      {/* ---- projects ---- */}
      {showProjects && (
        <section>
          <SectionTitle>
            <span className="inline-flex items-center gap-1.5">
              <FolderGit2 size={13} />
              Portfolio projects
            </span>
          </SectionTitle>
          <div className="space-y-3">
            {PROJECTS.map((p) => (
              <Card key={p.id}>
                <p className="text-[15px] font-medium">{p.name}</p>
                <p className="mt-1 text-[13px] text-muted">{p.tagline}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.stack.map((s) => (
                    <Chip key={s}>{s}</Chip>
                  ))}
                </div>
                <div className="mt-3 space-y-2 border-t border-line pt-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-faint">
                      Why this one
                    </p>
                    <p className="mt-1 text-[13px] text-muted">{p.why}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-faint">
                      What they should remember
                    </p>
                    <p className="mt-1 text-[13px]">{p.headline}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
