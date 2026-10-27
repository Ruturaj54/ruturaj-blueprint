import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button, inputCls, textareaCls } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import type { AmazonOutcome } from '@/lib/schema';
import { OUTCOME_LABEL } from './badges';

/**
 * The inline chooser that opens when a problem is ticked. The three outcomes
 * drive the spaced revision rules in engine/amazon.ts, so each one says
 * when the problem comes back.
 */

export interface OutcomeInput {
  outcome: AmazonOutcome;
  minutes: number;
  note?: string;
}

const OPTIONS: ReadonlyArray<{ id: AmazonOutcome; why: string }> = [
  { id: 'independent', why: 'No hints, no peeking. Asked problems come back in 7 days to stay warm; others are closed.' },
  { id: 'hint', why: 'Comes back as a cold re-solve in 3 days.' },
  { id: 'reviewed', why: 'Comes back as a cold re-solve in 2 days.' },
];

const expand = { type: 'spring', stiffness: 300, damping: 34 } as const;

export function OutcomeSheet({
  defaultMinutes,
  onSubmit,
  onCancel,
}: {
  defaultMinutes: number;
  onSubmit: (input: OutcomeInput) => void;
  onCancel: () => void;
}) {
  const reduce = useReducedMotion();
  const [outcome, setOutcome] = useState<AmazonOutcome>('independent');
  const [minutes, setMinutes] = useState(String(defaultMinutes));
  const [note, setNote] = useState('');

  const submit = () => {
    const parsed = Math.round(Number(minutes));
    const m = Number.isFinite(parsed) && parsed > 0 ? Math.min(600, parsed) : defaultMinutes;
    const trimmed = note.trim();
    onSubmit({ outcome, minutes: m, ...(trimmed ? { note: trimmed } : {}) });
  };

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
      transition={expand}
      className="overflow-hidden"
    >
      <div className="mb-2 ml-[44px] rounded-[12px] border border-amazon/30 bg-amazon-soft p-3">
        <p className="text-[13px] font-medium text-amazon-ink">How did it go?</p>
        <div role="radiogroup" aria-label="Outcome" className="mt-2 space-y-1">
          {OPTIONS.map((o) => {
            const on = outcome === o.id;
            return (
              <motion.button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setOutcome(o.id)}
                whileTap={reduce ? undefined : { scale: 0.985 }}
                transition={spring}
                className={cn(
                  'flex min-h-[44px] w-full items-center gap-3 rounded-[10px] border px-3 py-2 text-left transition-colors',
                  on ? 'border-amazon bg-surface' : 'border-transparent hover:bg-surface/70',
                )}
              >
                <span
                  className={cn(
                    'grid size-[16px] shrink-0 place-items-center rounded-full border-2',
                    on ? 'border-amazon bg-amazon' : 'border-line2 bg-surface',
                  )}
                >
                  {on && <span className="size-[6px] rounded-full bg-white" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] text-fg">{OUTCOME_LABEL[o.id]}</span>
                  <span className="block text-[11.5px] leading-snug text-muted">{o.why}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-start gap-3">
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-muted">Minutes</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              max={600}
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              className={cn(inputCls, 'w-24')}
            />
          </label>
          <label className="block min-w-[200px] flex-1">
            <span className="mb-1 block text-[12px] font-medium text-muted">Mistake or lesson (optional)</span>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="One honest line is enough"
              className={textareaCls}
            />
          </label>
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="amazon" onClick={submit}>
            Log it
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
