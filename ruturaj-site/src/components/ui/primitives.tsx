import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { spring, listItem } from '@/lib/motion';
import type { Priority } from '@/engine/types';

/* ---------- Card ---------------------------------------------------------- */

export type Tone = 'default' | 'accent' | 'success' | 'warn' | 'danger' | 'info' | 'amazon';

export function Card({
  children,
  className,
  animate = true,
  tone = 'default',
}: {
  children: ReactNode;
  className?: string;
  animate?: boolean;
  /** A tinted card for emphasis; default is plain white. */
  tone?: Tone;
}) {
  const Comp = animate ? motion.div : 'div';
  const tint = {
    default: 'border-line bg-surface',
    accent: 'border-accent/25 bg-accent-soft',
    success: 'border-success/25 bg-success-soft',
    warn: 'border-warn/30 bg-warn-soft',
    danger: 'border-danger/25 bg-danger-soft',
    info: 'border-info/25 bg-info-soft',
    amazon: 'border-amazon/30 bg-amazon-soft',
  }[tone];
  return (
    <Comp
      {...(animate ? { variants: listItem } : {})}
      className={cn('rounded-[16px] border p-4 shadow-card', tint, className)}
    >
      {children}
    </Comp>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="font-display text-[13px] font-bold uppercase tracking-[0.12em] text-muted">{children}</h2>
      {action}
    </div>
  );
}

/* ---------- Button -------------------------------------------------------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger' | 'amazon' | 'success';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({ variant = 'outline', size = 'md', className, children, ...rest }: ButtonProps) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={spring}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-[12px] font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:border disabled:border-line disabled:bg-raised disabled:text-faint',
        size === 'sm' && 'min-h-[36px] px-3 text-[13px]',
        size === 'md' && 'min-h-[44px] px-4 text-[14px]',
        size === 'lg' && 'min-h-[52px] px-6 text-[15px]',
        variant === 'primary' && 'bg-accent text-on-accent hover:brightness-110',
        variant === 'amazon' && 'bg-amazon text-on-accent hover:brightness-110',
        variant === 'success' && 'bg-success text-on-accent hover:brightness-110',
        variant === 'outline' && 'border border-line2 bg-surface text-fg hover:bg-raised',
        variant === 'ghost' && 'text-muted hover:bg-raised hover:text-fg',
        variant === 'danger' && 'border border-danger/40 bg-surface text-danger hover:bg-danger-soft',
        className,
      )}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}

/* ---------- Progress ------------------------------------------------------ */

export function ProgressBar({
  value,
  tone = 'accent',
  className,
}: {
  value: number;
  tone?: 'accent' | 'success' | 'info' | 'danger' | 'warn' | 'amazon';
  className?: string;
}) {
  const toneClass = {
    accent: 'bg-accent',
    success: 'bg-success',
    info: 'bg-info',
    danger: 'bg-danger',
    warn: 'bg-warn',
    amazon: 'bg-amazon',
  }[tone];
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-[6px] w-full overflow-hidden rounded-full bg-line', className)}
    >
      <motion.div
        className={cn('h-full rounded-full', toneClass)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ type: 'spring', stiffness: 160, damping: 26 }}
      />
    </div>
  );
}

/* ---------- Pills and chips ------------------------------------------------- */

const PRIORITY_CLASS: Record<Priority, string> = {
  P0: 'border-danger/30 bg-danger-soft text-danger',
  P1: 'border-warn/30 bg-warn-soft text-warn',
  P2: 'border-info/30 bg-info-soft text-info',
  P3: 'border-line bg-raised text-faint',
};

export function PriorityPill({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        'tnum inline-flex shrink-0 items-center rounded-full border px-2 py-[2px] font-mono text-[10px] font-medium tracking-wide',
        PRIORITY_CLASS[priority],
      )}
    >
      {priority}
    </span>
  );
}

export function Chip({ children, tone = 'default', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[11px] leading-none',
        tone === 'default' && 'border-line bg-raised text-muted',
        tone === 'accent' && 'border-accent/30 bg-accent-soft text-accent',
        tone === 'success' && 'border-success/30 bg-success-soft text-success',
        tone === 'warn' && 'border-warn/30 bg-warn-soft text-warn',
        tone === 'danger' && 'border-danger/30 bg-danger-soft text-danger',
        tone === 'info' && 'border-info/30 bg-info-soft text-info',
        tone === 'amazon' && 'border-amazon/30 bg-amazon-soft text-amazon-ink',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <span className="text-faint">{icon}</span>
      <p className="text-[14px] font-medium text-fg">{title}</p>
      <p className="max-w-[320px] text-[13px] text-muted">{body}</p>
    </div>
  );
}

/** One class string for every text input, so forms look the same everywhere. */
export const inputCls =
  'min-h-[42px] w-full rounded-[10px] border border-line2 bg-surface px-3 text-[14px] text-fg outline-none placeholder:text-faint focus:border-accent';

export const textareaCls =
  'w-full resize-y rounded-[10px] border border-line2 bg-surface p-3 text-[14px] leading-relaxed text-fg outline-none placeholder:text-faint focus:border-accent';
