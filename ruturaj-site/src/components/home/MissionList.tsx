import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Code2, Info } from 'lucide-react';
import { Card, PriorityPill, Chip, TaskCheckbox } from '@/components/ui/primitives';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { spring } from '@/lib/motion';
import { todayISO } from '@/engine/dates';
import type { DailyPlan } from '@/engine/planner';
import type { ScoreReason } from '@/engine/priority';

/**
 * The three missions plus the DSA block. Each card can expand to show why the
 * priority engine ranked it here — an unexplained ranking is just a number.
 */
export function MissionList({ plan }: { plan: DailyPlan }) {
  const state = useAppState();
  const update = useUpdateState();
  const today = todayISO();

  const isDone = (id: string): boolean => {
    if (!plan.gateOpen) return Boolean(state.foundation[id]);
    return state.tasks[id]?.status === 'done';
  };

  const toggle = (id: string, next: boolean) => {
    update((draft) => {
      if (!plan.gateOpen) {
        if (next) draft.foundation[id] = true;
        else delete draft.foundation[id];
      } else {
        draft.tasks[id] = {
          ...draft.tasks[id],
          status: next ? 'done' : 'todo',
          completedOn: next ? today : undefined,
        };
      }

      const log = (draft.days[today] ??= { planned: plan.plannedIds, completed: [] });
      const set = new Set(log.completed);
      if (next) set.add(id);
      else set.delete(id);
      log.completed = [...set];
    });
  };

  if (plan.missions.length === 0) {
    return (
      <Card>
        <p className="text-[14px]">Nothing queued.</p>
        <p className="mt-1 text-[13px] text-muted">
          {plan.gateOpen
            ? 'Every unblocked task is done. Open the roadmap and pull the next milestone forward.'
            : 'All foundation milestones are ticked. Open the roadmap to clear the gate.'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {plan.missions.map((m, i) => {
        if (m.kind === 'foundation') {
          return (
            <MissionCard
              key={m.milestone.id}
              index={i}
              id={m.milestone.id}
              title={m.milestone.title}
              meta={
                <>
                  <Chip>{m.subject.name}</Chip>
                  <Chip>{m.subject.source}</Chip>
                  <Chip tone={m.milestone.mandatory ? 'accent' : 'default'}>
                    {m.milestone.mandatory ? 'Gates the unlock' : 'Optional'}
                  </Chip>
                </>
              }
              checked={isDone(m.milestone.id)}
              onToggle={(v) => toggle(m.milestone.id, v)}
            />
          );
        }

        const { task, reasons, score } = m.scored;
        return (
          <MissionCard
            key={task.id}
            index={i}
            id={task.id}
            title={task.title}
            priority={<PriorityPill priority={task.priority} />}
            meta={
              <>
                <Chip>{task.estMinutes} min</Chip>
                {task.source && <Chip>{task.source}</Chip>}
                {task.interviewCritical && <Chip tone="accent">Interview-critical</Chip>}
                {task.portfolioCritical && <Chip tone="info">Portfolio</Chip>}
              </>
            }
            rationale={task.rationale}
            reasons={reasons}
            score={score}
            checked={isDone(task.id)}
            onToggle={(v) => toggle(task.id, v)}
          />
        );
      })}

      {/* ---- DSA block, always present ---- */}
      <Card>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-info">
            <Code2 size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-medium">{plan.dsa.headline}</p>
              <Chip tone="info">DSA</Chip>
            </div>
            <p className="mt-1.5 text-[13px] text-muted">{plan.dsa.note}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function MissionCard({
  index,
  title,
  priority,
  meta,
  rationale,
  reasons,
  score,
  checked,
  onToggle,
}: {
  index: number;
  id: string;
  title: string;
  priority?: React.ReactNode;
  meta: React.ReactNode;
  rationale?: string;
  reasons?: ScoreReason[];
  score?: number;
  checked: boolean;
  onToggle: (next: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const hasDetail = Boolean(rationale || reasons?.length);

  return (
    <Card className="p-0">
      <div className="flex items-start gap-2 p-1">
        <span className="tnum mt-[18px] pl-3 font-mono text-[11px] text-faint">
          {index + 1}
        </span>
        <TaskCheckbox
          checked={checked}
          onChange={onToggle}
          label={
            <span className="flex flex-wrap items-center gap-2">
              {title}
              {priority}
            </span>
          }
          sublabel={<span className="mt-1.5 flex flex-wrap gap-1.5">{meta}</span>}
        />
      </div>

      {hasDetail && (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex min-h-[40px] w-full items-center gap-1.5 border-t border-line px-4 text-[12px] text-muted transition-colors hover:text-fg"
          >
            <Info size={13} />
            Why this
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={reduce ? { duration: 0 } : spring}
              className="ml-auto"
            >
              <ChevronDown size={14} />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-3 border-t border-line px-4 py-3">
                  {rationale && (
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-faint">
                        Evidence
                      </p>
                      <p className="mt-1 text-[13px] text-muted">{rationale}</p>
                    </div>
                  )}
                  {reasons && reasons.length > 0 && (
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-faint">
                        Ranking · score {score}
                      </p>
                      <ul className="mt-1.5 space-y-1">
                        {reasons.map((r) => (
                          <li
                            key={r.label}
                            className="flex items-baseline justify-between gap-3 text-[12px]"
                          >
                            <span className="text-muted">{r.label}</span>
                            <span
                              className={`tnum font-mono ${
                                r.points >= 0 ? 'text-success' : 'text-danger'
                              }`}
                            >
                              {r.points > 0 ? '+' : ''}
                              {r.points}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </Card>
  );
}
