import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';

/**
 * The box alone, for rows whose label holds a link: an anchor inside a
 * button is invalid HTML, so TaskCheckbox cannot carry a LeetCode link.
 * Same spring, same drawn check, same 44px target.
 */
export function CheckBox({
  checked,
  onChange,
  label,
  tone = 'amazon',
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Accessible name; the visible title sits beside the box. */
  label: string;
  tone?: 'amazon' | 'success';
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      whileTap={reduce ? undefined : { scale: 0.9 }}
      transition={spring}
      className={cn('grid size-[44px] shrink-0 place-items-center rounded-[10px] transition-colors hover:bg-raised', className)}
    >
      <motion.span
        animate={reduce ? undefined : { scale: checked ? [1, 0.88, 1] : 1 }}
        transition={spring}
        className={cn(
          'grid size-[22px] place-items-center rounded-[7px] border-2 transition-colors',
          checked ? (tone === 'amazon' ? 'border-amazon bg-amazon' : 'border-success bg-success') : 'border-line2 bg-surface',
        )}
      >
        {checked && (
          <motion.span
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.18, ease: 'easeOut' }}
          >
            <Check size={14} strokeWidth={3.5} className="text-white" />
          </motion.span>
        )}
      </motion.span>
    </motion.button>
  );
}
