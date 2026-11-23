import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import type { Tone } from './primitives';
import { AnimatedNumber } from './AnimatedNumber';
import { StreakFlame } from './StreakFlame';

/**
 * A ring that blooms out of a box the moment it is ticked. AnimatePresence
 * with initial={false} keeps rows that load already ticked still.
 */
export function TickBloom({ checked, className }: { checked: boolean; className: string }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {checked && !reduce && (
        <motion.span
          key="bloom"
          aria-hidden
          initial={{ scale: 0.7, opacity: 0.6 }}
          animate={{ scale: 1.9, opacity: 0 }}
          exit={{ opacity: 0, transition: { duration: 0 } }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className={cn('pointer-events-none absolute inset-0 rounded-[7px] border-2', className)}
        />
      )}
    </AnimatePresence>
  );
}

/* ---------- Checkbox row ---------------------------------------------------- */

/**
 * Spring scale on tap plus a drawn check. Minimum 44px tall so it is
 * comfortable on a phone; the whole row is the target.
 */
export function TaskCheckbox({
  checked,
  onChange,
  label,
  sublabel,
  className,
  tone = 'success',
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  sublabel?: ReactNode;
  className?: string;
  tone?: 'success' | 'amazon';
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
      className={cn('flex min-h-[44px] w-full items-start gap-3 rounded-[10px] p-3 text-left transition-colors hover:bg-raised', className)}
    >
      <motion.span
        animate={reduce ? undefined : { scale: checked ? [1, 0.88, 1] : 1 }}
        transition={spring}
        className={cn(
          'relative mt-[2px] grid size-[22px] shrink-0 place-items-center rounded-[7px] border-2 transition-colors',
          checked ? (tone === 'amazon' ? 'border-amazon bg-amazon' : 'border-success bg-success') : 'border-line2 bg-surface',
        )}
      >
        <TickBloom checked={checked} className={tone === 'amazon' ? 'border-amazon' : 'border-success'} />
        {checked && (
          <motion.span
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.18, ease: 'easeOut' }}
          >
            <Check size={14} strokeWidth={3.5} className="text-on-accent" />
          </motion.span>
        )}
      </motion.span>
      <span className="min-w-0 flex-1">
        <span className={cn('block text-[14px] leading-snug transition-colors', checked ? 'text-faint line-through' : 'text-fg')}>{label}</span>
        {sublabel && <span className="mt-1 block text-[12px] leading-snug text-muted">{sublabel}</span>}
      </span>
    </motion.button>
  );
}

/* ---------- Segmented control ------------------------------------------------ */

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  layoutId,
  tone = 'default',
  className,
}: {
  value: T;
  options: ReadonlyArray<{ id: T; label: string; hint?: string }>;
  onChange: (next: T) => void;
  layoutId: string;
  tone?: 'default' | 'amazon';
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <div role="tablist" className={cn('flex rounded-[12px] border border-line bg-raised p-1', className)}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className={cn(
              'relative min-h-[36px] flex-1 rounded-[9px] px-2 text-[12.5px] font-medium transition-colors',
              active ? 'text-fg' : 'text-muted hover:text-fg',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={reduce ? { duration: 0 } : spring}
                className={cn('absolute inset-0 rounded-[9px] bg-surface shadow-card', tone === 'amazon' && 'ring-1 ring-amazon/30')}
              />
            )}
            <span className="relative">
              {o.label}
              {o.hint && <span className={cn('ml-1', active ? 'text-accent' : 'text-faint')}>{o.hint}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Switch -------------------------------------------------------------- */

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; hint?: ReactNode }) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-4">
      <span className="min-w-0">
        <span className="block text-[14px]">{label}</span>
        {hint && <span className="mt-0.5 block text-[12px] text-muted">{hint}</span>}
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        className={cn('relative h-[28px] w-[48px] shrink-0 rounded-full transition-colors', checked ? 'bg-success' : 'bg-line2')}
      >
        <motion.span
          animate={{ x: checked ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute start-0 top-[3px] size-[22px] rounded-full bg-white shadow-card"
        />
      </button>
    </label>
  );
}

/* ---------- Labelled field --------------------------------------------------------- */

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] text-faint">{hint}</span>}
    </label>
  );
}

/* ---------- Stat and banner ------------------------------------------------------- */

/** A big number that counts up to its value, with an optional flame for a live streak. */
export function Stat({ value, label, tone, unit, flame }: { value: ReactNode; label: string; tone?: Tone; unit?: string; flame?: boolean }) {
  const color = {
    default: 'text-fg',
    accent: 'text-accent',
    success: 'text-success',
    warn: 'text-warn',
    danger: 'text-danger',
    info: 'text-info',
    amazon: 'text-amazon',
  }[tone ?? 'default'];
  return (
    <div>
      <p className={cn('tnum inline-flex items-baseline gap-1 font-display text-[24px] font-bold leading-none', color)}>
        <span>{typeof value === 'number' ? <AnimatedNumber value={value} /> : value}</span>
        {unit && <span className="text-[13px] font-medium text-muted">{unit}</span>}
        {flame && (
          <span className="self-center">
            <StreakFlame active size={16} />
          </span>
        )}
      </p>
      <p className="mt-1.5 text-[10.5px] uppercase tracking-[0.1em] text-muted">{label}</p>
    </div>
  );
}

export function Banner({ icon, tone = 'info', children }: { icon?: ReactNode; tone?: Tone; children: ReactNode }) {
  const cls = {
    default: 'border-line bg-raised text-fg',
    accent: 'border-accent/25 bg-accent-soft text-fg',
    success: 'border-success/25 bg-success-soft text-fg',
    warn: 'border-warn/30 bg-warn-soft text-fg',
    danger: 'border-danger/25 bg-danger-soft text-fg',
    info: 'border-info/25 bg-info-soft text-fg',
    amazon: 'border-amazon/30 bg-amazon-soft text-fg',
  }[tone];
  return (
    <div className={cn('flex items-start gap-2.5 rounded-[12px] border px-3.5 py-3 text-[13px] leading-relaxed', cls)}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
