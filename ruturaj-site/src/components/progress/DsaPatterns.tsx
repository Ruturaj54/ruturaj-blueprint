import { TriangleAlert } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { Card, SectionTitle, ProgressBar } from '@/components/ui/primitives';
import { Stat } from '@/components/ui/controls';
import { patternStats, weaknessReason, dsaTotals, dsaStreak } from '@/engine/dsa';

/**
 * The DSA weakness engine on the light kit: totals, the patterns actually
 * costing interviews (with the engine's own reason), and coverage per pattern.
 */
export function DsaPatterns() {
  const state = useAppState();
  const stats = patternStats(state);
  const totals = dsaTotals(state);
  const streak = dsaStreak(state);
  const weak = stats.filter((s) => s.weaknessScore > 25).slice(0, 4);

  return (
    <>
      <Card>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat value={totals.total} label="Logged" />
          <Stat
            value={totals.total === 0 ? '–' : `${Math.round(totals.accuracy * 100)}%`}
            label="Clean solves"
            tone={totals.total === 0 ? 'default' : totals.accuracy >= 0.7 ? 'success' : 'danger'}
          />
          <Stat value={totals.last7} label="Last 7 days" />
          <Stat value={streak} label="Streak" tone={streak > 0 ? 'accent' : 'default'} />
        </div>
        {totals.total > 0 && (
          <p className="tnum mt-4 border-t border-line pt-3 text-[12px] text-muted">
            {totals.easy} easy · {totals.medium} medium · {totals.hard} hard · {totals.avgMinutes} min average
          </p>
        )}
      </Card>

      <section>
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5">
            <TriangleAlert size={13} />
            Weakness engine
          </span>
        </SectionTitle>
        {weak.length === 0 ? (
          <Card>
            <p className="text-[14px] text-fg">{totals.total === 0 ? 'Nothing logged yet.' : 'No pattern is flagged right now.'}</p>
            <p className="mt-1 text-[13px] text-muted">
              {totals.total === 0
                ? 'Log a few problems and the engine starts scoring coverage, accuracy and staleness per pattern.'
                : 'Keep the coverage up. Patterns decay after about two weeks without practice.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {weak.map((s) => (
              <Card key={s.pattern.id} tone="danger">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-fg">{s.pattern.name}</p>
                    <p className="mt-1 text-[13px] text-muted">Why: {weaknessReason(s)}</p>
                  </div>
                  <span className="tnum shrink-0 font-mono text-[13px] text-danger">{s.weaknessScore}</span>
                </div>
              </Card>
            ))}
            <p className="px-1 pt-1 text-[12px] text-faint">
              Flagged patterns get a +30 boost in the roadmap priority engine, so they surface as missions on their own.
            </p>
          </div>
        )}
      </section>

      <section>
        <SectionTitle>Pattern coverage</SectionTitle>
        <Card>
          <div className="space-y-3">
            {stats.map((s) => (
              <div key={s.pattern.id}>
                <div className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="min-w-0 truncate text-fg">{s.pattern.name}</span>
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
          <p className="mt-4 border-t border-line pt-3 text-[12px] text-faint">
            Coverage is distinct problems solved against each pattern&rsquo;s target. Green is covered, red is flagged.
          </p>
        </Card>
      </section>
    </>
  );
}
