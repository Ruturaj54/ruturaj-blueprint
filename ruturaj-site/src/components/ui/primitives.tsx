import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { spring, listItem } from '@/lib/motion';
import type { Priority } from '@/engine/types';

/* ---------- Card ---------------------------------------------------------- */

export function Card({
  children,
  className,
  animate = true,
}: {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}) {
  const Comp = animate ? motion.div : 'div';
  return (
    <Comp
      {...(animate ? { variants: listItem } : {})}
      className={cn(
        'rounded-[16px] border border-line bg-surface p-4',
        className,
      )}
    >
      {children}
    </Comp>
  );
}

export function SectionTitle({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-muted">
        {children}
      </h2>
      {action}
    </div>
  );
}

/* ---------- Button -------------------------------------------------------- */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  variant = 'outline',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={spring}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-[10px] font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40',
        size === 'sm' && 'min-h-[36px] px-3 text-[13px]',
        size === 'md' && 'min-h-[44px] px-4 text-[14px]',
        size === 'lg' && 'min-h-[52px] px-6 text-[15px]',
        variant === 'primary' &&
          'bg-accent text-black hover:brightness-110',
        variant === 'outline' &&
          'border border-line2 text-fg hover:bg-raised',
        variant === 'ghost' && 'text-muted hover:text-fg',
        variant === 'danger' &&
          'border border-danger/40 text-danger hover:bg-danger/10',
        className,
      )}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {children}
    </motion.button>
  );
}

/* ---------- Checkbox ------------------------------------------------------ */

/**
 * Spring scale on tap plus a drawn check path. The draw is what makes a tick
 * feel like an event rather than a state change.
 */
export function TaskCheckbox({
  checked,
  onChange,
  label,
  sublabel,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  sublabel?: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      transition={spring}
      className={cn(
        'flex w-full items-start gap-3 rounded-[10px] p-3 text-left transition-colors',
        'min-h-[44px] hover:bg-raised',
        className,
      )}
    >
      <motion.span
        animate={reduce ? undefined : { scale: checked ? [1, 0.88, 1] : 1 }}
        transition={spring}
        className={cn(
          'mt-[2px] grid size-[20px] shrink-0 place-items-center rounded-[6px] border transition-colors',
          checked
            ? 'border-success bg-success'
            : 'border-line2 bg-transparent',
        )}
      >
        {checked && (
          <motion.span
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.22, ease: 'easeOut' }}
          >
            <Check size={13} strokeWidth={3.5} className="text-black" />
          </motion.span>
        )}
      </motion.span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            'block text-[14px] leading-snug transition-colors',
            checked ? 'text-faint line-through' : 'text-fg',
          )}
        >
          {label}
        </span>
        {sublabel && (
          <span className="mt-1 block text-[12px] leading-snug text-muted">
            {sublabel}
          </span>
        )}
      </span>
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
  tone?: 'accent' | 'success' | 'info' | 'danger';
  className?: string;
}) {
  const toneClass = {
    accent: 'bg-accent',
    success: 'bg-success',
    info: 'bg-info',
    danger: 'bg-danger',
  }[tone];

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        'h-[6px] w-full overflow-hidden rounded-full bg-white/[0.06]',
        className,
      )}
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

/* ---------- Priority pill -------------------------------------------------- */

const PRIORITY_CLASS: Record<Priority, string> = {
  P0: 'border-danger/35 text-danger bg-danger/10',
  P1: 'border-accent/35 text-accent bg-accent/10',
  P2: 'border-info/35 text-info bg-info/10',
  P3: 'border-white/10 text-faint bg-white/[0.03]',
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

export function Chip({
  children,
  tone = 'default',
}: {
  children: ReactNode;
  tone?: 'default' | 'accent' | 'success' | 'info';
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[11px]',
        tone === 'default' && 'border-white/10 bg-white/[0.03] text-muted',
        tone === 'accent' && 'border-accent/30 bg-accent/10 text-accent',
        tone === 'success' && 'border-success/30 bg-success/10 text-success',
        tone === 'info' && 'border-info/30 bg-info/10 text-info',
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
      <p className="text-[14px] text-fg">{title}</p>
      <p className="max-w-[320px] text-[13px] text-muted">{body}</p>
    </div>
  );
}
