import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Lock, Unlock, Rocket, TriangleAlert } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle, Button, ProgressBar, Chip, TaskCheckbox } from '@/components/ui/primitives';
import { listContainer } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { FOUNDATION_SUBJECTS } from '@/data/foundation';
import { gateStatus, allSubjectProgress, FOUNDATION_UNLOCK_MESSAGE } from '@/engine/foundation';
import { MISSION_PHASES } from '@/engine/mission';
import { currentDay } from '@/engine/dates';
import { TrackBoard } from '@/components/roadmap/TrackBoard';
import type { FoundationStatus } from '@/engine/types';

const STATUS_META: Record<FoundationStatus, { label: string; cls: string }> = {
  not_started: { label: 'Not started', cls: 'text-faint border-white/10 bg-white/[0.03]' },
  in_progress: { label: 'In progress', cls: 'text-accent border-accent/30 bg-accent/10' },
  completed: { label: 'Completed', cls: 'text-info border-info/30 bg-info/10' },
  verified: { label: 'Verified', cls: 'text-success border-success/30 bg-success/10' },
};

export function Roadmap() {
  const state = useAppState();
  const update = useUpdateState();
  const gate = gateStatus(state);
  const progress = allSubjectProgress(state);
  const day = currentDay();
  const [confirmOverride, setConfirmOverride] = useState(false);

  const unlock = (override: boolean) => {
    update((draft) => {
      draft.foundationUnlockedAt = new Date().toISOString();
      draft.foundationOverride = override;
    });
    setConfirmOverride(false);
  };

  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-7">
      {/* ---- gate ---- */}
      <section>
        <SectionTitle>Foundation gate</SectionTitle>
        <Card className={cn(gate.unlocked && 'border-success/30')}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {gate.unlocked ? (
                  <Unlock size={16} className="text-success" />
                ) : (
                  <Lock size={16} className="text-accent" />
                )}
                <p className="font-display text-[18px] font-bold">
                  {gate.unlocked ? 'Advanced Mode is open' : 'Month 1 — finish what you started'}
                </p>
              </div>
              <p className="mt-2 max-w-[560px] text-[13px] text-muted">
                {gate.unlocked
                  ? gate.overridden
                    ? 'Unlocked by manual override. The mandatory milestones below are still the real bar — they are worth closing anyway.'
                    : FOUNDATION_UNLOCK_MESSAGE
                  : 'Nothing new gets added this month. Advanced Mode opens when every mandatory milestone below is ticked — not when a button is pressed.'}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="tnum font-display text-[34px] font-bold leading-none text-accent">
                {gate.pct}%
              </p>
              <p className="tnum mt-1 text-[11px] text-faint">
                {gate.mandatoryDone}/{gate.mandatoryTotal}
              </p>
            </div>
          </div>

          <ProgressBar value={gate.pct} tone={gate.unlocked ? 'success' : 'accent'} className="mt-4" />

          {!gate.unlocked && (
            <div className="mt-4 space-y-3">
              <Button
                variant={gate.earned ? 'primary' : 'outline'}
                size="lg"
                disabled={!gate.earned}
                onClick={() => unlock(false)}
                className="w-full"
              >
                <Rocket size={17} />
                {gate.earned ? 'Unlock Advanced SDE + AI Engineer Mode' : 'Foundation complete'}
              </Button>

              {!gate.earned && (
                <>
                  <p className="text-center text-[12px] text-faint">
                    Still blocking: {gate.blockingSubjects.join(', ')}
                  </p>
                  {!confirmOverride ? (
                    <button
                      onClick={() => setConfirmOverride(true)}
                      className="w-full text-center text-[12px] text-faint underline underline-offset-4 hover:text-muted"
                    >
                      Override and unlock anyway
                    </button>
                  ) : (
                    <Card animate={false} className="border-danger/30 bg-danger/[0.04]">
                      <div className="flex items-start gap-2">
                        <TriangleAlert size={15} className="mt-0.5 shrink-0 text-danger" />
                        <div className="min-w-0">
                          <p className="text-[13px]">
                            {gate.mandatoryTotal - gate.mandatoryDone} mandatory milestones are still
                            open. Overriding is recorded and shown on every screen — it will not read
                            as earned.
                          </p>
                          <div className="mt-3 flex gap-2">
                            <Button variant="danger" size="sm" onClick={() => unlock(true)}>
                              Override anyway
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setConfirmOverride(false)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}
        </Card>
      </section>

      {/* ---- subjects ---- */}
      <section>
        <SectionTitle>Foundation subjects</SectionTitle>
        <div className="space-y-3">
          {progress.map((p) => (
            <SubjectCard key={p.subject.id} subjectId={p.subject.id} />
          ))}
        </div>
      </section>

      {/* ---- phases ---- */}
      <section>
        <SectionTitle>The four months</SectionTitle>
        <div className="space-y-3">
          {MISSION_PHASES.map((phase) => {
            const active = day >= phase.startDay && day <= phase.endDay;
            const done = day > phase.endDay;
            return (
              <Card
                key={phase.id}
                className={cn(active && 'border-accent/35', done && 'opacity-60')}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'tnum mt-0.5 grid size-[34px] shrink-0 place-items-center rounded-[9px] border font-mono text-[12px]',
                      active
                        ? 'border-accent/40 bg-accent/10 text-accent'
                        : 'border-line text-faint',
                    )}
                  >
                    {phase.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-medium">{phase.title}</p>
                      {active && <Chip tone="accent">Current</Chip>}
                    </div>
                    <p className="tnum mt-0.5 text-[11px] uppercase tracking-[0.1em] text-faint">
                      Days {phase.startDay}–{phase.endDay} · {phase.focus}
                    </p>
                    <p className="mt-2 text-[13px] text-muted">{phase.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ---- tracks ---- */}
      <TrackBoard locked={!gate.unlocked} />
    </motion.div>
  );
}

function SubjectCard({ subjectId }: { subjectId: string }) {
  const state = useAppState();
  const update = useUpdateState();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  const subject = FOUNDATION_SUBJECTS.find((s) => s.id === subjectId);
  if (!subject) return null;
  const p = allSubjectProgress(state).find((x) => x.subject.id === subjectId)!;
  const meta = STATUS_META[p.status];

  const toggle = (id: string, next: boolean) => {
    update((draft) => {
      if (next) draft.foundation[id] = true;
      else delete draft.foundation[id];
    });
  };

  return (
    <Card className="p-0">
      <button onClick={() => setOpen((v) => !v)} className="w-full p-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-medium">{subject.name}</p>
              <span
                className={cn(
                  'rounded-full border px-2 py-[2px] text-[10px] uppercase tracking-wide',
                  meta.cls,
                )}
              >
                {meta.label}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-faint">{subject.source}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="tnum font-mono text-[12px] text-muted">
              {p.done}/{p.total}
            </span>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={reduce ? { duration: 0 } : undefined}
              className="text-faint"
            >
              <ChevronDown size={16} />
            </motion.span>
          </div>
        </div>
        <ProgressBar
          value={p.pct}
          tone={p.status === 'verified' ? 'success' : 'accent'}
          className="mt-3"
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-line px-2 pb-2">
              <p className="px-2 py-3 text-[13px] text-muted">{subject.blurb}</p>
              {subject.milestones.map((m) => (
                <TaskCheckbox
                  key={m.id}
                  checked={Boolean(state.foundation[m.id])}
                  onChange={(v) => toggle(m.id, v)}
                  label={m.title}
                  sublabel={
                    <span className="flex gap-1.5">
                      <Chip>{m.proof}</Chip>
                      {m.mandatory ? (
                        <Chip tone="accent">Gates the unlock</Chip>
                      ) : (
                        <Chip>Optional</Chip>
                      )}
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
