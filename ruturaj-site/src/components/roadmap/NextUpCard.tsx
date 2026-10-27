import { Lock, Target, Play, Check } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, Button, Chip, PriorityPill } from '@/components/ui/primitives';
import { TRACK_META } from '@/data/tasks';
import { gateStatus } from '@/engine/foundation';
import { rankTasks } from '@/engine/priority';
import { weakPatternIds } from '@/engine/dsa';
import { isBehindSchedule } from '@/engine/scoring';
import { dayContext } from '@/engine/mission';
import { READINESS_TRACKS } from '@/engine/readiness';
import { currentDay, todayISO } from '@/engine/dates';

/**
 * "Do this next": the highest-scoring unblocked task across the advanced
 * tracks, with its rationale, the named scoring reasons, and why it ranks
 * now. Visible while the gate is shut; actions only once it clears.
 */
export function NextUpCard() {
  const state = useAppState();
  const update = useUpdateState();
  const gate = gateStatus(state);
  const locked = !gate.unlocked;
  const ctx = dayContext(currentDay());

  const ranked = rankTasks({
    state,
    phase: ctx.phase,
    weakPatterns: weakPatternIds(state),
    behindSchedule: isBehindSchedule(state),
  }).filter((s) => READINESS_TRACKS.includes(s.task.track));
  const next = ranked[0];
  const status = next ? (state.tasks[next.task.id]?.status ?? 'todo') : 'todo';
  const reasons = next ? [...next.reasons].sort((a, b) => Math.abs(b.points) - Math.abs(a.points)).slice(0, 4) : [];

  const setStatus = (id: string, to: 'in_progress' | 'done') => {
    if (locked) return;
    update((draft) => {
      draft.tasks[id] = { ...draft.tasks[id], status: to, completedOn: to === 'done' ? todayISO() : undefined };
    });
  };

  return (
    <Card tone={locked ? 'default' : 'accent'}>
      <div className="flex items-center gap-2 text-muted">
        <Target size={15} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">Do this next</p>
      </div>

      {locked && (
        <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-line bg-raised p-3">
          <Lock size={15} className="mt-0.5 shrink-0 text-accent" />
          <p className="text-[13px] leading-relaxed text-muted">
            Locked until the Foundation Gate clears: {gate.mandatoryTotal - gate.mandatoryDone} mandatory milestones
            left. The pick below is what comes first once it does.
          </p>
        </div>
      )}

      {next ? (
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-semibold leading-snug">{next.task.title}</p>
            <PriorityPill priority={next.task.priority} />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip tone="accent">{TRACK_META[next.task.track].name}</Chip>
            <Chip>{next.task.estMinutes} min</Chip>
            <Chip>{next.task.proof}</Chip>
            {next.task.source && <Chip>{next.task.source}</Chip>}
            {status === 'in_progress' && <Chip tone="info">In progress</Chip>}
          </div>
          {next.task.rationale && (
            <p className="mt-3 text-[13px] leading-relaxed text-muted">
              <span className="font-medium text-fg">Why this one: </span>
              {next.task.rationale}
            </p>
          )}
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            <span className="font-medium text-fg">Why now: </span>
            {ranked.length - 1} other unblocked task{ranked.length === 2 ? '' : 's'} across the tracks; this one scored
            highest for {ctx.phase.label} {ctx.phase.title}.
          </p>
          <p className="tnum mt-2 font-mono text-[11px] leading-relaxed text-faint">
            {reasons.map((r) => `${r.label} ${r.points > 0 ? '+' : ''}${r.points}`).join(' · ')} → {next.score}
          </p>
          {!locked && (
            <div className="mt-3 flex flex-wrap gap-2">
              {status !== 'in_progress' && (
                <Button variant="outline" onClick={() => setStatus(next.task.id, 'in_progress')}>
                  <Play size={14} />
                  Start it
                </Button>
              )}
              <Button variant="primary" onClick={() => setStatus(next.task.id, 'done')}>
                <Check size={14} />
                Mark done
              </Button>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-muted">Every unblocked task across the tracks is done.</p>
      )}
    </Card>
  );
}
