import { motion, useReducedMotion } from 'framer-motion';
import { Moon, Check } from 'lucide-react';
import { Card, SectionTitle, Button } from '@/components/ui/primitives';
import { Stat } from '@/components/ui/controls';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { spring } from '@/lib/motion';
import { todayISO, istClock } from '@/engine/dates';
import { programInfo } from '@/engine/program';
import { buildPraise } from '@/engine/praise';
import { dayScore, dayExtras, plannedHits } from '@/engine/scoring';
import { PraiseCard } from '@/components/PraiseCard';

/**
 * The night check-in. He closes the day, the app scores the plan and names
 * what changed against yesterday. The evening mail is scheduled, so there is
 * no send button here; reopening is one tap if he closed too early.
 */
export function CloseDay() {
  const state = useAppState();
  const update = useUpdateState();
  const reduce = useReducedMotion();
  const today = todayISO();
  const log = state.days[today];
  const closed = Boolean(log?.closedAt);
  const started = programInfo(state, today).started;
  const praise = buildPraise(state, today);
  const planned = log?.planned.length ?? 0;
  const focus = state.deepWork.filter((d) => d.date === today).reduce((n, d) => n + d.actualMinutes, 0);
  const sessions = state.runs.filter((r) => r.date === today && r.kind !== 'rest').length;

  const close = () => {
    // Score the plan, not the running total: planned work that got done.
    const score = dayScore(state, today);
    update((draft) => {
      const d = (draft.days[today] ??= { planned: [], completed: [] });
      d.closedAt = new Date().toISOString();
      if (score !== undefined) d.score = score;
    });
  };

  const reopen = () => {
    update((draft) => {
      const d = draft.days[today];
      if (d) delete d.closedAt;
    });
  };

  return (
    <section>
      <SectionTitle>
        <span className="inline-flex items-center gap-1.5">
          <Moon size={13} />
          Close the day
        </span>
      </SectionTitle>

      {!closed ? (
        <Card>
          <p className="text-[13px] leading-relaxed text-muted">
            Before you sleep: tick what you actually did, log the session and any extra problems, then close the
            day. Tonight is compared with yesterday and the difference is named plainly.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-5">
            <Stat value={`${plannedHits(state, today)}/${planned}`} label="Planned" />
            <Stat value={dayExtras(state, today)} label="Extra" />
            <Stat value={state.dsa.filter((a) => a.date === today).length} label="DSA" />
            <Stat value={sessions} label="Sessions" />
            <Stat value={focus} unit="min" label="Focus" />
          </div>
          {started && planned === 0 && (
            <p className="mt-3 text-[12px] text-faint">
              Nothing was planned today, so there is no plan score to give. Closing still records your notes.
            </p>
          )}
          <Button variant="primary" size="lg" className="mt-4 w-full" onClick={close} disabled={!started}>
            <Check size={17} />
            Close today
          </Button>
          {!started && (
            <p className="mt-2 text-[12px] text-faint">Start Day 1 above first; a day is scored against the plan it opened with.</p>
          )}
        </Card>
      ) : (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={spring}
        >
          <PraiseCard praise={praise} />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="tnum text-[12px] text-faint">
              Closed at {istClock(new Date(log?.closedAt ?? Date.now()))} IST.
              {state.settings.emailEnabled && ` Tomorrow’s ${state.settings.morningEmailTime} mail reads this.`}
            </p>
            <Button variant="ghost" onClick={reopen}>
              Reopen day
            </Button>
          </div>
        </motion.div>
      )}
    </section>
  );
}
