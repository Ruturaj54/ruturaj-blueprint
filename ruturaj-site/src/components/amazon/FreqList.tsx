import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { AMAZON_FREQ, type FreqRow } from '@/data/amazon';
import { Card, Button } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import { DayChip, Difficulty, LcLink } from './badges';
import { useAmazonActions } from './useAmazonActions';

/**
 * Amazon's 120 most frequent LeetCode problems. Rows in the curriculum
 * link to their day; the rest carry an "Extra" tick. Rendered in chunks of
 * 40 so the first paint on a phone stays quick.
 */

const CHUNK = 40;

export function FreqList({ onGoDay }: { onGoDay: (n: number) => void }) {
  const state = useAppState();
  const act = useAmazonActions();
  const [shown, setShown] = useState(CHUNK);
  const rows = AMAZON_FREQ.slice(0, shown);
  const left = AMAZON_FREQ.length - shown;

  return (
    <div className="space-y-3">
      <p className="text-[13px] leading-relaxed text-muted">
        The {AMAZON_FREQ.length} problems LeetCode tags most often for Amazon, from the liquidslr dataset updated 20 Oct 2026.
        The bar is the 3-month score. Rows in the plan link to their day; tick the rest here as extras once solved.
      </p>
      <Card className="divide-y divide-line p-0" animate={false}>
        {rows.map((r) => {
          const done = r.keys ? r.keys.some((k) => Boolean(state.amazon.items[k])) : r.xkey ? Boolean(state.amazon.extras[r.xkey]) : false;
          return <Row key={r.rank} row={r} done={done} onGoDay={onGoDay} onExtra={act.toggleExtra} />;
        })}
      </Card>
      {left > 0 && (
        <Button variant="outline" className="w-full" onClick={() => setShown((n) => n + CHUNK)}>
          Show more · {left} left
        </Button>
      )}
    </div>
  );
}

function Row({
  row,
  done,
  onGoDay,
  onExtra,
}: {
  row: FreqRow;
  done: boolean;
  onGoDay: (n: number) => void;
  onExtra: (xkey: string) => void;
}) {
  const reduce = useReducedMotion();
  const xkey = row.xkey;
  return (
    <div className={cn('flex items-start gap-3 px-4 py-3', done && 'opacity-60')}>
      <span className="tnum w-[28px] shrink-0 pt-[3px] text-right font-mono text-[12px] text-faint">{row.rank}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] leading-snug">
          <LcLink slug={row.slug} n={row.n} name={row.name} className={done ? 'text-faint' : undefined} />
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Difficulty d={row.d} />
          <span className="tnum text-[11.5px] text-muted">
            3 months {row.f3} · 30 days {row.f30 ?? 'not listed'}
          </span>
        </div>
        <div className="mt-1.5 h-[4px] w-full max-w-[220px] overflow-hidden rounded-full bg-line" aria-hidden>
          <div className="h-full rounded-full bg-amazon" style={{ width: `${Math.max(0, Math.min(100, row.f3))}%` }} />
        </div>
        {row.contest && <p className="mt-1 text-[11.5px] text-warn">Recent contest problem, most likely from online assessments</p>}
        {row.days && row.days.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {row.days.map((d) => (
              <DayChip key={d} day={d} onClick={() => onGoDay(d)} />
            ))}
          </div>
        )}
      </div>
      {xkey && (
        <motion.button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={`Extra: ${row.name}`}
          onClick={() => onExtra(xkey)}
          whileTap={reduce ? undefined : { scale: 0.94 }}
          transition={spring}
          className={cn(
            'inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium transition-colors',
            done ? 'border-amazon/40 bg-amazon-soft text-amazon-ink' : 'border-line2 bg-surface text-muted hover:text-fg',
          )}
        >
          {done && <Check size={14} strokeWidth={3} />}
          Extra
        </motion.button>
      )}
    </div>
  );
}
