import { CheckCircle2 } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { Card, SectionTitle, ProgressBar } from '@/components/ui/primitives';
import { Banner } from '@/components/ui/controls';
import { cn } from '@/lib/cn';
import { formatShort } from '@/engine/dates';
import { formatHM } from '@/engine/schedule';
import { programInfo } from '@/engine/program';
import { AMAZON_ITEMS } from '@/engine/amazon';
import type { AmazonSummary } from '@/engine/amazon-stats';
import type { AmazonItemLog } from '@/lib/schema';
import { AMAZON_PHASES } from '@/data/amazon';

/** Problems in a topic that needed a hint or the solution: the flag rule itself, counted so the reason is exact. */
function weakCount(logs: Record<string, AmazonItemLog>, topic: string): number {
  return AMAZON_ITEMS.filter((i) => {
    const o = logs[i.key]?.outcome;
    return i.topic === topic && (o === 'hint' || o === 'reviewed');
  }).length;
}

/**
 * Where the 28-day curriculum stands: per phase, per day, and the topics that
 * needed help. Counts only; there is deliberately no readiness percentage.
 */
export function PhaseBars({ summary }: { summary: AmazonSummary }) {
  const state = useAppState();
  const info = programInfo(state);
  const completedOn = state.program.phase === 'general' ? state.program.amazonCompletedOn : undefined;
  const currentDay = info.started && info.phase === 'amazon' ? info.amazon.day : null;

  return (
    <div className="space-y-7">
      {completedOn && (
        <Banner tone="success" icon={<CheckCircle2 size={15} className="text-success" />}>
          Amazon phase marked complete on {formatShort(completedOn)}. The counts below stay as the record of what was
          done.
        </Banner>
      )}

      <section>
        <SectionTitle>By phase</SectionTitle>
        <Card>
          <div className="space-y-4">
            {summary.byPhase.map((p) => {
              const name = AMAZON_PHASES.find((x) => x.n === p.phase)?.name ?? `Phase ${p.phase}`;
              const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
              return (
                <div key={p.phase}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0 truncate text-[14px] font-medium text-fg">
                      <span className="tnum mr-2 font-mono text-[12px] text-amazon">{p.phase}</span>
                      {name}
                    </p>
                    <span className="tnum shrink-0 font-mono text-[12px] text-muted">
                      {p.done}/{p.total}
                    </span>
                  </div>
                  <ProgressBar value={pct} tone="amazon" className="mt-1.5" />
                  <p className="tnum mt-1 text-[11px] text-faint">
                    {formatHM(p.minutesDone)} logged of {formatHM(p.minutesTotal)} planned
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section>
        <SectionTitle
          action={
            <span className="tnum text-[11px] text-faint">
              {summary.items.done}/{summary.items.total} items
            </span>
          }
        >
          The 28 days
        </SectionTitle>
        <Card>
          <div className="grid grid-cols-7 gap-1.5">
            {summary.byDay.map((d) => (
              <div
                key={d.n}
                title={`Day ${d.n}: ${d.done} of ${d.total} logged`}
                className={cn(
                  'relative h-[40px] overflow-hidden rounded-[8px] border bg-raised',
                  d.n === currentDay ? 'border-amazon ring-1 ring-amazon' : 'border-line',
                )}
              >
                <div className="absolute inset-x-0 bottom-0 bg-amazon/60" style={{ height: `${d.pct}%` }} />
                <span
                  className={cn(
                    'tnum absolute inset-0 grid place-items-center font-mono text-[11px]',
                    d.pct === 100 ? 'font-semibold text-amazon-ink' : 'text-muted',
                  )}
                >
                  {d.n}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-faint">
            Each cell fills with the share of that day&rsquo;s items logged
            {currentDay !== null && currentDay <= 28 ? `; today is day ${currentDay}` : ''}. Logged means an outcome was
            recorded, not that the problem is mastered.
          </p>
        </Card>
      </section>

      <section>
        <SectionTitle>Weak topics</SectionTitle>
        <Card>
          {summary.weakTopics.length === 0 ? (
            <p className="text-[13px] text-muted">
              None flagged. A topic is flagged once two or more of its problems needed a hint or the solution.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {summary.weakTopics.map((t) => (
                <li key={t} className="py-2.5 first:pt-0 last:pb-0">
                  <p className="text-[14px] font-medium text-fg">{t}</p>
                  <p className="mt-0.5 text-[12.5px] text-muted">
                    Why: {weakCount(state.amazon.items, t)} problems here needed a hint or the solution. Re-solve them
                    cold before moving on.
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}
