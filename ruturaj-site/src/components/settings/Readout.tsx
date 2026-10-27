import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'default' | 'muted' | 'accent' | 'amazon' | 'success' | 'warn';

const COLOR: Record<Tone, string> = {
  default: 'text-fg',
  muted: 'text-muted',
  accent: 'text-accent',
  amazon: 'text-amazon-ink',
  success: 'text-success',
  warn: 'text-warn',
};

/** A label on the left and a value on the right; wraps when the value is long. */
export function Readout({ label, value, tone = 'default' }: { label: string; value: ReactNode; tone?: Tone }) {
  return (
    <div className="flex min-h-[40px] flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-line py-2 last:border-b-0">
      <span className="text-[12.5px] text-muted">{label}</span>
      <span className={cn('tnum text-right text-[14px] font-medium', COLOR[tone])}>{value}</span>
    </div>
  );
}
