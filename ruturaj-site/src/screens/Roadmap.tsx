import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Rocket, TriangleAlert } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle, Button, ProgressBar, Chip } from '@/components/ui/primitives';
import { listContainer } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { TIER_LABEL, MANDATORY_HOURS } from '@/data/foundation';
import { gateStatus, allSubjectProgress, FOUNDATION_UNLOCK_MESSAGE } from '@/engine/foundation';
import { SubjectCard } from '@/components/roadmap/SubjectCard';
import { MISSION_PHASES } from '@/engine/mission';
import { currentDay } from '@/engine/dates';
import { TrackBoard } from '@/components/roadmap/TrackBoard';

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

      {/* ---- subjects, grouped by your priority order ---- */}
      <section>
        <SectionTitle
          action={
            <span className="tnum text-[11px] text-faint">~{MANDATORY_HOURS}h budgeted</span>
          }
        >
          Foundation subjects
        </SectionTitle>
        {([1, 2, 3] as const).map((tier) => {
          const inTier = progress.filter((p) => p.subject.tier === tier);
          if (inTier.length === 0) return null;
          const hours = Math.round(
            inTier.reduce(
              (n, p) =>
                n +
                p.subject.milestones
                  .filter((m) => m.mandatory)
                  .reduce((x, m) => x + m.estMinutes, 0),
              0,
            ) / 60,
          );
          return (
            <div key={tier} className="mb-5">
              <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
                <p className="text-[11px] uppercase tracking-[0.12em] text-accent">
                  {tier}. {TIER_LABEL[tier]}
                </p>
                <span className="tnum text-[11px] text-faint">~{hours}h</span>
              </div>
              <div className="space-y-3">
                {inTier.map((p) => (
                  <SubjectCard key={p.subject.id} subjectId={p.subject.id} />
                ))}
              </div>
            </div>
          );
        })}
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
