import { motion, useReducedMotion } from 'framer-motion';
import { Flame } from 'lucide-react';

/** A small flame that flickers beside a live streak. Still under reduced motion; absent at zero. */
export function StreakFlame({ active, size = 14 }: { active: boolean; size?: number }) {
  const reduce = useReducedMotion();
  if (!active) return null;
  return (
    <motion.span
      aria-hidden
      className="inline-flex origin-bottom text-warn"
      animate={reduce ? undefined : { scale: [1, 1.16, 0.94, 1.06, 1], rotate: [0, -5, 4, -2, 0] }}
      transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 1.1, ease: 'easeInOut' }}
    >
      <Flame size={size} />
    </motion.span>
  );
}
