import { motion } from 'framer-motion';
import { ArrowRight, Flame, Lock, Unlock, Footprints, Building2 } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { listContainer } from '@/lib/motion';
import { Card, SectionTitle, Button, ProgressBar, Chip } from '@/components/ui/primitives';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { MissionList } from '@/components/home/MissionList';
import { buildPlan, executionStreak } from '@/engine/planner';
import { gateStatus } from '@/engine/foundation';
import { interviewReadiness, trackReadiness } from '@/engine/readiness';
import { dsaTotals, dsaStreak } from '@/engine/dsa';
import { currentDay, todayISO, formatLong, TOTAL_DAYS } from '@/engine/dates';

export function Home({ navigate }: { navigate: (id: string) => void }) {
  const state = useAppState();
  const update = useUpdateState();

  const day = currentDay();
  const plan = buildPlan(state, day);
  const gate = gateStatus(state);
  const readiness = interviewReadiness(state);
  const totals = dsaTotals(state);
  const aiTrack = trackReadiness(state, 'ai');
  const streak = executionStreak(state);
  const dsaDays = dsaStreak(state);
  const today = todayISO();
  const todayRuns = state.runs.filter((r) => r.date === today);
  const dayStarted = Boolean(state.days[today]);

  const startToday = () => {
    update((draft) => {
      draft.days[today] = {
        planned: plan.plannedIds,
        completed: draft.days[today]?.completed ?? [],
        notes: draft.days[today]?.notes,
      };
    });
    navigate('today');
  };

  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-6">
      {/* ---- hero ---- */}
      <Card className="relative overflow-hidden p-5 sm:p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
          <ProgressRing value={(day / TOTAL_DAYS) * 100}>
            <div>
              <p className="font-display text-[11px] uppercase tracking-[0.18em] text-muted">
                Day
              </p>
              <p className="tnum font-display text-[52px] font-bold leading-none">
                {day}
              </p>
              <p className="tnum mt-1 text-[11px] text-faint">of {TOTAL_DAYS}</p>
            </div>
          </ProgressRing>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="font-display text-[11px] uppercase tracking-[0.18em] text-accent">
              161-day mission
            </p>
            <h1 className="mt-1.5 font-display text-[26px] font-bold leading-tight sm:text-[30px]">
              Become interview-ready for top-tier SDE and AI Engineer roles.
            </h1>
            <p className="mt-2 text-[13px] text-muted">{formatLong(today)}</p>

            <div className="mt-4 flex flex-wrap justify-center gap-4 sm:justify-start">
              <Stat label="Days left" value={TOTAL_DAYS - day} tone="accent" />
              <Stat label="Streak" value={streak} icon={<Flame size={13} />} />
              <Stat label="Interview ready" value={`${readiness.overall}%`} />
            </div>
          </div>
        </div>
      </Card>

      {/* ---- today's missions ---- */}
      <section>
        <SectionTitle
          action={
            <span className="tnum text-[11px] text-faint">
              ~{Math.round(plan.estimatedMinutes / 60)}h planned
            </span>
          }
        >
          Today&rsquo;s 3 missions
        </SectionTitle>
        <MissionList plan={plan} />
        <Button
          variant="primary"
          size="lg"
          onClick={startToday}
          className="mt-4 w-full"
        >
          {dayStarted ? 'Continue today' : 'Start today'}
          <ArrowRight size={17} />
        </Button>
      </section>

      {/* ---- foundation gate ---- */}
      <section>
        <SectionTitle>Foundation gate</SectionTitle>
        <Card>
          <button onClick={() => navigate('roadmap')} className="w-full text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {gate.unlocked ? (
                    <Unlock size={15} className="text-success" />
                  ) : (
                    <Lock size={15} className="text-accent" />
                  )}
                  <p className="text-[15px] font-medium">
                    {gate.unlocked ? 'Advanced Mode unlocked' : 'Phase 1 — finish what you started'}
                  </p>
                </div>
                <p className="mt-1.5 text-[13px] text-muted">
                  {gate.unlocked
                    ? gate.overridden
                      ? 'Unlocked by manual override, not by completion.'
                      : 'Earned. Every mandatory milestone cleared.'
                    : `${gate.mandatoryTotal - gate.mandatoryDone} mandatory milestones left across ${gate.blockingSubjects.length} subjects.`}
                </p>
              </div>
              <span className="tnum shrink-0 font-display text-[26px] font-bold text-accent">
                {gate.pct}%
              </span>
            </div>
            <ProgressBar
              value={gate.pct}
              tone={gate.unlocked ? 'success' : 'accent'}
              className="mt-3"
            />
          </button>
        </Card>
      </section>

      {/* ---- progress strip ---- */}
      <section>
        <SectionTitle>Where you stand</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <ProgressCard
            title="DSA"
            value={readiness.dsa}
            tone="info"
            onClick={() => navigate('dsa')}
            footer={
              totals.total === 0
                ? 'No problems logged yet.'
                : `${totals.total} logged · ${Math.round(totals.accuracy * 100)}% clean · ${dsaDays}-day streak`
            }
          />
          <ProgressCard
            title="AI engineering"
            value={aiTrack.overall}
            tone="accent"
            onClick={() => navigate('ai')}
            footer={`${aiTrack.done} of ${aiTrack.total} tasks · learning ${aiTrack.progress.learning}% · shipped ${aiTrack.progress.demonstration}%`}
          />
        </div>
        <Card className="mt-3">
          <p className="text-[13px] text-muted">
            Weakest area right now:{' '}
            <span className="text-fg">{readiness.weakest}</span>. That is where the
            next block of hours should go.
          </p>
        </Card>
      </section>

      {/* ---- work + fitness ---- */}
      <section className="grid gap-3 sm:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2 text-muted">
            <Building2 size={15} />
            <p className="text-[12px] uppercase tracking-[0.12em]">Current job</p>
          </div>
          <p className="tnum mt-2 font-display text-[28px] font-bold">
            {state.work.length}
          </p>
          <p className="text-[13px] text-muted">
            {state.work.length === 0
              ? 'No accomplishments logged yet.'
              : 'achievements captured at Parallel Wireless'}
          </p>
          <Button size="sm" className="mt-3" onClick={() => navigate('work')}>
            Log this week
          </Button>
        </Card>

        <Card>
          <div className="flex items-center gap-2 text-muted">
            <Footprints size={15} />
            <p className="text-[12px] uppercase tracking-[0.12em]">Today&rsquo;s run</p>
          </div>
          {todayRuns.length === 0 ? (
            <>
              <p className="tnum mt-2 font-display text-[28px] font-bold text-faint">
                —
              </p>
              <p className="text-[13px] text-muted">Nothing logged yet.</p>
            </>
          ) : (
            <>
              <p className="tnum mt-2 font-display text-[28px] font-bold">
                {todayRuns.reduce((s, r) => s + r.km, 0).toFixed(1)}
                <span className="ml-1 text-[14px] text-muted">km</span>
              </p>
              <div className="mt-1 flex gap-1.5">
                {todayRuns.map((r) => (
                  <Chip key={r.id} tone="success">
                    {r.slot}
                  </Chip>
                ))}
              </div>
            </>
          )}
          <Button size="sm" className="mt-3" onClick={() => navigate('health')}>
            Log a run
          </Button>
        </Card>
      </section>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string | number;
  tone?: 'accent';
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p
        className={`tnum flex items-center gap-1.5 font-display text-[24px] font-bold leading-none ${
          tone === 'accent' ? 'text-accent' : 'text-fg'
        }`}
      >
        {icon}
        {value}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
    </div>
  );
}

function ProgressCard({
  title,
  value,
  tone,
  footer,
  onClick,
}: {
  title: string;
  value: number;
  tone: 'accent' | 'info';
  footer: string;
  onClick: () => void;
}) {
  return (
    <Card>
      <button onClick={onClick} className="w-full text-left">
        <div className="flex items-baseline justify-between">
          <p className="text-[14px] font-medium">{title}</p>
          <span className="tnum font-display text-[22px] font-bold">{value}%</span>
        </div>
        <ProgressBar value={value} tone={tone} className="mt-2.5" />
        <p className="mt-2 text-[12px] text-muted">{footer}</p>
      </button>
    </Card>
  );
}
