import { motion } from 'framer-motion';
import { TriangleAlert, Flame, Code2, Trash2 } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle, ProgressBar, Chip, EmptyState } from '@/components/ui/primitives';
import { listContainer } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { QuickLog } from '@/components/today/QuickLog';
import { patternStats, weaknessReason, dsaTotals, dsaStreak } from '@/engine/dsa';
import { formatShort } from '@/engine/dates';

export function Dsa() {
  const state = useAppState();
  const update = useUpdateState();
  const stats = patternStats(state);
  const totals = dsaTotals(state);
  const streak = dsaStreak(state);
  const weak = stats.filter((s) => s.weaknessScore > 25).slice(0, 4);
  const recent = [...state.dsa].reverse().slice(0, 12);

  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-7">
      {/* ---- totals ---- */}
      <Card>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <Metric label="Logged" value={totals.total} />
          <Metric
            label="Clean solves"
            value={totals.total === 0 ? '—' : `${Math.round(totals.accuracy * 100)}%`}
            tone={totals.accuracy >= 0.7 ? 'success' : totals.total === 0 ? undefined : 'danger'}
          />
          <Metric label="Last 7 days" value={totals.last7} />
          <Metric
            label="Streak"
            value={streak}
            icon={<Flame size={14} />}
            tone={streak > 0 ? 'accent' : undefined}
          />
        </div>
        {totals.total > 0 && (
          <p className="tnum mt-4 border-t border-line pt-3 text-[12px] text-muted">
            {totals.easy} easy · {totals.medium} medium · {totals.hard} hard · {totals.avgMinutes}{' '}
            min average
          </p>
        )}
      </Card>

      {/* ---- weakness engine ---- */}
      <section>
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5">
            <TriangleAlert size={13} />
            Weakness engine
          </span>
        </SectionTitle>
        {weak.length === 0 ? (
          <Card>
            <p className="text-[14px]">
              {totals.total === 0 ? 'Nothing logged yet.' : 'No pattern is flagged right now.'}
            </p>
            <p className="mt-1 text-[13px] text-muted">
              {totals.total === 0
                ? 'Log a few problems and the engine will start scoring coverage, accuracy and staleness per pattern.'
                : 'Keep the coverage up — patterns decay after about two weeks without practice.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {weak.map((s) => (
              <Card key={s.pattern.id} className="border-danger/25">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium">{s.pattern.name}</p>
                    <p className="mt-1 text-[13px] text-muted">{weaknessReason(s)}</p>
                  </div>
                  <span className="tnum shrink-0 font-mono text-[13px] text-danger">
                    {s.weaknessScore}
                  </span>
                </div>
              </Card>
            ))}
            <p className="px-1 pt-1 text-[12px] text-faint">
              Flagged patterns get a +30 boost in the priority engine, so they surface as missions
              automatically.
            </p>
          </div>
        )}
      </section>

      {/* ---- coverage ---- */}
      <section>
        <SectionTitle>Pattern coverage</SectionTitle>
        <Card>
          <div className="space-y-3">
            {stats.map((s) => (
              <div key={s.pattern.id}>
                <div className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="min-w-0 truncate">{s.pattern.name}</span>
                  <span className="tnum shrink-0 font-mono text-[12px] text-muted">
                    {s.uniqueProblems}/{s.pattern.targetProblems}
                  </span>
                </div>
                <ProgressBar
                  value={s.coverage * 100}
                  tone={s.coverage >= 1 ? 'success' : s.weaknessScore > 25 ? 'danger' : 'info'}
                  className="mt-1.5"
                />
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ---- log ---- */}
      <QuickLog />

      {/* ---- recent ---- */}
      <section>
        <SectionTitle>Recent problems</SectionTitle>
        {recent.length === 0 ? (
          <EmptyState
            icon={<Code2 size={22} />}
            title="No problems logged"
            body="Every solve logged here feeds the weakness engine, the streak and the evening accountability email."
          />
        ) : (
          <Card>
            <div className="divide-y divide-[color:var(--color-line)]">
              {recent.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-2.5 text-[13px]">
                  <span
                    className={cn(
                      'size-[7px] shrink-0 rounded-full',
                      a.outcome === 'solved'
                        ? 'bg-success'
                        : a.outcome === 'failed'
                          ? 'bg-danger'
                          : 'bg-info',
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">{a.problem}</span>
                  <Chip>{a.difficulty}</Chip>
                  <span className="tnum hidden font-mono text-[11px] text-faint sm:inline">
                    {a.minutes}m
                  </span>
                  <span className="tnum hidden font-mono text-[11px] text-faint sm:inline">
                    {formatShort(a.date)}
                  </span>
                  <button
                    onClick={() =>
                      update((draft) => {
                        draft.dsa = draft.dsa.filter((x) => x.id !== a.id);
                      })
                    }
                    aria-label={`Delete ${a.problem}`}
                    className="shrink-0 text-faint transition-colors hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section>
    </motion.div>
  );
}

function Metric({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string | number;
  tone?: 'accent' | 'success' | 'danger';
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p
        className={cn(
          'tnum flex items-center gap-1.5 font-display text-[26px] font-bold leading-none',
          tone === 'accent' && 'text-accent',
          tone === 'success' && 'text-success',
          tone === 'danger' && 'text-danger',
        )}
      >
        {icon}
        {value}
      </p>
      <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
    </div>
  );
}
