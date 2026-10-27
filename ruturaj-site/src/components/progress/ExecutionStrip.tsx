import { motion, useReducedMotion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { Card, SectionTitle } from '@/components/ui/primitives';
import { Stat } from '@/components/ui/controls';
import { cn } from '@/lib/cn';
import { todayISO, addDays, formatShort } from '@/engine/dates';
import { dayScore, executionStreak } from '@/engine/scoring';

/**
 * The last 14 days scored against their own plans. A flat bar is a day with
 * no plan; extra work beyond the plan never inflates a bar.
 */
export function ExecutionStrip() {
  const state = useAppState();
  const reduce = useReducedMotion();
  const today = todayISO();
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, -13 + i));
  const scores = days.map((date) => ({ date, score: dayScore(state, date) }));
  const streak = executionStreak(state);
  const scored = scores.filter((s) => s.score !== undefined);
  const avg = scored.length ? Math.round(scored.reduce((n, s) => n + (s.score ?? 0), 0) / scored.length) : null;

  return (
    <section>
      <SectionTitle>
        <span className="inline-flex items-center gap-1.5">
          <TrendingUp size={13} />
          Execution, last 14 days
        </span>
      </SectionTitle>
      <Card>
        <div className="flex h-[96px] items-end gap-1">
          {scores.map(({ date, score }, i) => (
            <div
              key={date}
              className="flex h-full flex-1 items-end"
              title={`${formatShort(date)}: ${score === undefined ? 'no plan' : `${score}%`}`}
            >
              <motion.div
                initial={reduce ? false : { height: '4%' }}
                animate={{ height: score === undefined ? '4%' : `${Math.max(6, score)}%` }}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 160, damping: 26, delay: i * 0.02 }}
                className={cn(
                  'w-full rounded-[3px]',
                  score === undefined ? 'bg-line' : score >= 70 ? 'bg-success' : score >= 40 ? 'bg-accent' : 'bg-danger',
                )}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-faint">
          <span>{formatShort(days[0] ?? today)}</span>
          <span>Today</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4">
          <Stat value={streak} label="Execution streak" tone={streak > 0 ? 'success' : 'default'} />
          <Stat value={scored.length} unit="/ 14" label="Days planned" />
          <Stat value={avg === null ? '–' : `${avg}%`} label="Average score" />
        </div>
        <p className="mt-3 text-[12px] text-faint">
          A bar is the share of that day&rsquo;s plan that got closed. The streak counts consecutive days at 50% or
          better, from yesterday back.
        </p>
      </Card>
    </section>
  );
}
