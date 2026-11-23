import { motion, useReducedMotion } from 'framer-motion';
import { Sunrise, BedDouble, type LucideIcon } from 'lucide-react';
import type { ExerciseSlot } from '@/engine/schedule';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';

const OPTIONS: ReadonlyArray<{ id: ExerciseSlot; label: string; Icon: LucideIcon }> = [
  { id: 'morning', label: 'Run this morning', Icon: Sunrise },
  { id: 'rest', label: 'Rest today', Icon: BedDouble },
];

/**
 * Today's run or a planned rest. Runs are morning-only; the evening belongs
 * to the walk, which stays on the timetable either way.
 */
export function SlotToggle({ value, onChange }: { value: ExerciseSlot; onChange: (next: ExerciseSlot) => void }) {
  const reduce = useReducedMotion();
  return (
    <div>
      <div role="radiogroup" aria-label="Today's run" className="grid grid-cols-2 gap-1.5">
        {OPTIONS.map(({ id, label, Icon }) => {
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
                'flex min-h-[44px] items-center justify-center gap-1.5 rounded-[12px] border px-2 text-[13px] font-medium transition-colors',
                active ? 'border-accent/40 bg-accent-soft text-accent' : 'border-line bg-surface text-muted hover:bg-raised',
              )}
            >
              <Icon size={15} />
              {label}
            </motion.button>
          );
        })}
      </div>
      <p className="mt-2 text-[12px] text-faint">Today only. The evening walk after the lecture stays on either way.</p>
    </div>
  );
}
