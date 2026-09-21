import { motion } from 'framer-motion';
import { CalendarDays, Target, NotebookPen } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle, ProgressBar, Chip, EmptyState } from '@/components/ui/primitives';
import { listContainer } from '@/lib/motion';
import { MissionList } from '@/components/home/MissionList';
import { DayTimetable } from '@/components/today/DayTimetable';
import { DeepWork } from '@/components/today/DeepWork';
import { QuickLog } from '@/components/today/QuickLog';
import { CloseDay } from '@/components/today/CloseDay';
import { buildPlan, dayScore } from '@/engine/planner';
import { currentDay, todayISO, formatLong } from '@/engine/dates';
import { taskById } from '@/data/tasks';
import { FOUNDATION_SUBJECTS } from '@/data/foundation';

function titleForId(id: string): string {
  const task = taskById(id);
  if (task) return task.title;
  for (const s of FOUNDATION_SUBJECTS) {
    const m = s.milestones.find((x) => x.id === id);
    if (m) return m.title;
  }
  return id;
}

export function Today() {
  const state = useAppState();
  const update = useUpdateState();
  const today = todayISO();
  const plan = buildPlan(state, currentDay());
  const log = state.days[today];
  const score = dayScore(state, today);

  const sessions = state.deepWork.filter((d) => d.date === today);
  const focusedMinutes = sessions.reduce((s, d) => s + d.actualMinutes, 0);

  const firstOpen = plan.missions[0];
  const defaultLabel = firstOpen
    ? firstOpen.kind === 'foundation'
      ? firstOpen.milestone.title
      : firstOpen.scored.task.title
    : 'Deep work';

  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-7">
      {/* ---- header ---- */}
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-muted">
              <CalendarDays size={15} />
              <p className="text-[12px] uppercase tracking-[0.12em]">{formatLong(today)}</p>
            </div>
            <p className="mt-2 font-display text-[24px] font-bold">
              Day {plan.ctx.day}
              <span className="ml-2 text-[14px] font-normal text-muted">
                {plan.ctx.phase.label} · {plan.ctx.phase.title}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="tnum font-display text-[30px] font-bold leading-none">
              {score === undefined ? '—' : `${score}%`}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">Day score</p>
          </div>
        </div>

        {log && log.planned.length > 0 && (
          <>
            <ProgressBar
              value={(log.completed.length / log.planned.length) * 100}
              tone={score !== undefined && score >= 70 ? 'success' : 'accent'}
              className="mt-4"
            />
            <p className="tnum mt-2 text-[12px] text-muted">
              {log.completed.length} of {log.planned.length} planned items closed ·{' '}
              {focusedMinutes} focused minutes logged
            </p>
          </>
        )}
      </Card>

      {/* ---- timetable: what, and when ---- */}
      <DayTimetable plan={plan} />

      {/* ---- planned vs actual ---- */}
      {log && log.planned.length > 0 && (
        <section>
          <SectionTitle>Planned vs actual</SectionTitle>
          <Card>
            <div className="space-y-2">
              {log.planned.map((id) => {
                const done = log.completed.includes(id);
                return (
                  <div key={id} className="flex items-start gap-3 text-[13px]">
                    <span
                      className={`mt-[7px] size-[6px] shrink-0 rounded-full ${
                        done ? 'bg-success' : 'bg-faint'
                      }`}
                    />
                    <span className={done ? 'text-faint line-through' : 'text-fg'}>
                      {titleForId(id)}
                    </span>
                    {!done && (
                      <span className="ml-auto shrink-0">
                        <Chip>Open</Chip>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </section>
      )}

      {/* ---- missions ---- */}
      <section>
        <SectionTitle
          action={
            <span className="inline-flex items-center gap-1.5 text-[11px] text-faint">
              <Target size={12} />
              Top {plan.missions.length}
            </span>
          }
        >
          Next up
        </SectionTitle>
        <MissionList plan={plan} />
      </section>

      {/* ---- deep work ---- */}
      <section>
        <SectionTitle>Focus</SectionTitle>
        <DeepWork defaultLabel={defaultLabel} />
        {sessions.length > 0 && (
          <Card className="mt-3">
            <p className="text-[12px] uppercase tracking-[0.12em] text-muted">
              Sessions today
            </p>
            <div className="mt-2 space-y-1.5">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 text-[13px]">
                  <span className="tnum font-mono text-[12px] text-faint">
                    {s.actualMinutes}m
                  </span>
                  <span className="min-w-0 flex-1 truncate">{s.label}</span>
                  <Chip
                    tone={
                      s.outcome === 'completed'
                        ? 'success'
                        : s.outcome === 'partial'
                          ? 'accent'
                          : 'default'
                    }
                  >
                    {s.outcome}
                  </Chip>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section>

      {/* ---- quick log ---- */}
      <QuickLog />

      {/* ---- close the day ---- */}
      <CloseDay />

      {/* ---- notes ---- */}
      <section>
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5">
            <NotebookPen size={13} />
            Notes &amp; blockers
          </span>
        </SectionTitle>
        <Card>
          <textarea
            value={log?.notes ?? ''}
            onChange={(e) => {
              const value = e.target.value;
              update((draft) => {
                const d = (draft.days[today] ??= { planned: plan.plannedIds, completed: [] });
                d.notes = value;
              });
            }}
            rows={4}
            placeholder="What blocked you? What went better than expected? One honest line is enough."
            className="w-full resize-y rounded-[10px] border border-line bg-bg p-3 text-[14px] leading-relaxed text-fg outline-none placeholder:text-faint focus:border-line2"
          />
        </Card>
      </section>

      {!log && (
        <EmptyState
          icon={<Target size={22} />}
          title="Today has not been started"
          body="Open Home and hit Start today to lock in your three missions. That is what the evening accountability email measures against."
        />
      )}
    </motion.div>
  );
}
