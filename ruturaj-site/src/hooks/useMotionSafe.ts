import { useReducedMotion } from 'framer-motion';

/**
 * Returns variants that collapse to opacity-only when the viewer has asked for
 * reduced motion, so no component has to branch on it by hand.
 */
export function useMotionSafe() {
  const reduce = useReducedMotion();
  return {
    reduce: Boolean(reduce),
    /** Distance to travel on entrance — zero when motion is reduced. */
    travel: reduce ? 0 : 12,
    tap: reduce ? {} : { scale: 0.97 },
  };
}
