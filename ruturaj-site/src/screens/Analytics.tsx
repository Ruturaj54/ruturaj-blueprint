import { motion } from 'framer-motion';
import { TrendingUp, Gauge } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { Card, SectionTitle, ProgressBar } from '@/components/ui/primitives';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { listContainer } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { allTrackReadiness, interviewReadiness } from '@/engine/readiness';
import { TRACK_META } from '@/data/tasks';
import { dayScore, executionStreak } from '@/engine/planner';
import { dsaTotals } from '@/engine/dsa';
import { todayISO, addDays, formatShort, currentDay, TOTAL_DAYS } from '@/engine/dates';

export function Analytics() {
  const state = useAppState();
  const readiness = interviewReadiness(state);
  const tracks = allTrackReadiness(state).filter((t) => t.total > 0);
  const totals = dsaTotals(state);
  const streak = executionStreak(state);
  const day = currentDay();

  const last14 = Array.from({ length: 14 }, (_, i) => addDays(todayISO(), -13 + i));
  const scores = last14.map((d) => ({ date: d, score: dayScore(state, d) }));

  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-7">
      {/* ---- interview readiness ---- */}
      <Card>
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <ProgressRing
            value={readiness.overall}
            size={140}
            tone={readiness.overall >= 60 ? 'var(--color-success)' : 'var(--color-accent)'}
          >
            <div>
              <p className="tnum font-display text-[36px] font-bold leading-none">
                {readiness.overall}%
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-muted">Ready</p>
            </div>
          </ProgressRing>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-muted">
              <Gauge size={15} />
              <p className="text-[12px] uppercase tracking-[0.12em]">Interview readiness</p>
            </div>
            <p className="mt-2 text-[13px] text-muted">
              Built from what gets tested, not from course completion. Weakest component:{' '}
              <span className="text-fg">{readiness.weakest}</span>.
            </p>
            <div className="mt-3 space-y-2">
              {(
                [
                  ['DSA', readiness.dsa, 0.3],
                  ['System design', readiness.systemDesign, 0.2],
                  ['AI engineering', readiness.ai, 0.25],
                  ['CS fundamentals', readiness.fundamentals, 0.15],
                  ['Projects', readiness.projects, 0.1],
                ] as const
              ).map(([label, value, weight]) => (
                <div key={label}>
                  <div className="flex items-baseline justify-between text-[12px]">
                    <span className="text-muted">
                      {label}
                      <span className="ml-1.5 text-faint">{Math.round(weight * 100)}% weight</span>
                    </span>
                    <span className="tnum font-mono">{value}%</span>
                  </div>
                  <ProgressBar
                    value={value}
                    tone={label === readiness.weakest ? 'danger' : 'info'}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* ---- execution ---- */}
      <section>
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp size={13} />
            Execution, last 14 days
          </span>
        </SectionTitle>
        <Card>
          <div className="flex items-end gap-1" style={{ height: 96 }}>
            {scores.map(({ date, score }) => (
              <div key={date} className="flex flex-1 flex-col items-center justify-end gap-1">
                <div className="flex w-full flex-1 items-end">
                  <div
                    className={cn(
                      'w-full rounded-[3px] transition-all',
                      score === undefined
                        ? 'bg-white/[0.04]'
                        : score >= 70
                          ? 'bg-success'
                          : score >= 40
                            ? 'bg-accent'
                            : 'bg-danger',
                    )}
                    style={{ height: score === undefined ? 4 : `${Math.max(6, score)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-faint">
            <span>{formatShort(last14[0]!)}</span>
            <span>{formatShort(last14[13]!)}</span>
          </div>
          <div className="mt-4 flex gap-6 border-t border-line pt-4">
            <Stat value={streak} label="Execution streak" />
            <Stat value={totals.total} label="Problems logged" />
            <Stat value={`${day}/${TOTAL_DAYS}`} label="Mission day" />
          </div>
        </Card>
      </section>

      {/* ---- tracks ---- */}
      <section>
        <SectionTitle>Track readiness</SectionTitle>
        <Card>
          <div className="space-y-4">
            {tracks.map((t) => (
              <div key={t.track}>
                <div className="flex items-baseline justify-between text-[13px]">
                  <span>{TRACK_META[t.track].name}</span>
                  <span className="tnum font-mono text-[12px] text-muted">
                    {t.done}/{t.total} · {t.overall}%
                  </span>
                </div>
                <ProgressBar value={t.overall} className="mt-1.5" />
                <div className="mt-1.5 flex gap-3 text-[10px] text-faint">
                  <span>learn {t.progress.learning}%</span>
                  <span>practice {t.progress.practice}%</span>
                  <span>shipped {t.progress.demonstration}%</span>
                  <span>interview {t.progress.interview}%</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-line pt-3 text-[12px] text-faint">
            A high &ldquo;learn&rdquo; number with a low &ldquo;shipped&rdquo; number means the
            reading is ahead of the building. That gap is what an interview finds.
          </p>
        </Card>
      </section>
    </motion.div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <p className="tnum font-display text-[22px] font-bold leading-none">{value}</p>
      <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
    </div>
  );
}
