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

/**
 * Tabs slide in from the side they sit on in the nav (a tab to the right
 * arrives from the right), so moving around the app reads as moving through
 * it. `custom` is -1, 0 or 1. Reduced motion uses pageFade instead.
 */
export const pageSlide: Variants = {
  hidden: (dir: number) => ({ opacity: 0, x: dir * 28, y: dir === 0 ? 8 : 0 }),
  show: { opacity: 1, x: 0, y: 0, transition: softSpring },
  exit: (dir: number) => ({ opacity: 0, x: dir * -20, transition: { duration: 0.14 } }),
};

export const pageFade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.18 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

/** A bouncier spring for things that should feel like they landed: the day number, a reached target. */
export const popSpring: Transition = { type: 'spring', stiffness: 380, damping: 17 };

/** Timetable rows, quicker than cards so a long day does not take long to assemble. */
export const rowContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.025 } },
};

export const rowItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: spring },
};
