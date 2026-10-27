import { motion, useReducedMotion } from 'framer-motion';
import { Sunrise, Sunset, BedDouble, type LucideIcon } from 'lucide-react';
import type { ExerciseSlot } from '@/engine/schedule';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';

const OPTIONS: ReadonlyArray<{ id: ExerciseSlot; label: string; Icon: LucideIcon }> = [
  { id: 'morning', label: 'Morning', Icon: Sunrise },
  { id: 'evening', label: 'Evening', Icon: Sunset },
  { id: 'rest', label: 'Rest', Icon: BedDouble },
];

/**
 * Where today's session goes. Weekends offer Morning or Rest only: the
 * Saturday long run and the Sunday walk are morning by design.
 */
export function SlotToggle({
  value,
  weekend,
  defaultSlot,
  onChange,
}: {
  value: ExerciseSlot;
  weekend: boolean;
  defaultSlot: 'morning' | 'evening';
  onChange: (next: ExerciseSlot) => void;
}) {
  const reduce = useReducedMotion();
  const options = weekend ? OPTIONS.filter((o) => o.id !== 'evening') : OPTIONS;

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Exercise slot for today"
        className={cn('grid gap-1.5', options.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}
      >
        {options.map(({ id, label, Icon }) => {
          const active = id === value;
          return (
            <motion.button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(id)}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              transition={spring}
              className={cn(
                'flex min-h-[44px] items-center justify-center gap-1.5 rounded-[12px] border text-[13px] font-medium transition-colors',
                active ? 'border-accent/40 bg-accent-soft text-accent' : 'border-line bg-surface text-muted hover:bg-raised',
              )}
            >
              <Icon size={15} />
              {label}
            </motion.button>
          );
        })}
      </div>
      <p className="mt-2 text-[12px] text-faint">
        {weekend
          ? 'Today only. Weekend sessions are morning by design; the only other choice is rest.'
          : `Today only. Your default is ${defaultSlot}; change that in Settings.`}
      </p>
    </div>
  );
}
