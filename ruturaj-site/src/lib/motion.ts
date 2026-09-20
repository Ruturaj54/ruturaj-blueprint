import type { Transition, Variants } from 'framer-motion';

/** The house spring. Stiff and lightly damped so taps feel immediate. */
export const spring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const softSpring: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 28,
};

/** Cards enter staggered so a screen assembles instead of appearing. */
export const listContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
};

export const listItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: softSpring },
};

/** Tab changes slide in the direction of travel. */
export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: softSpring },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
};

export const tapScale = { scale: 0.97 } as const;
