import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import { PraiseCard } from '@/components/PraiseCard';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { spring } from '@/lib/motion';
import { addDays, todayISO } from '@/engine/dates';
import { buildPraise } from '@/engine/praise';

/**
 * Greets him with yesterday's result the first time he opens the app each day.
 *
 * Shows only when yesterday was actually closed and actually produced a win —
 * a popup that fires every morning regardless would be trained away inside a
 * week. Dismissal is recorded per date so it never repeats.
 */
export function PraiseModal() {
  const state = useAppState();
  const update = useUpdateState();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  const yesterday = addDays(todayISO(), -1);
  const log = state.days[yesterday];
  const praise = buildPraise(state, yesterday);
  const shouldShow =
    Boolean(log?.closedAt) && praise.hasWins && !state.praiseSeen[yesterday];

  useEffect(() => {
    if (shouldShow) {
      // Let the screen settle first — an instant modal reads as an error.
      const t = setTimeout(() => setOpen(true), 550);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [shouldShow]);

  const dismiss = () => {
    setOpen(false);
    update((draft) => {
      draft.praiseSeen[yesterday] = true;
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismiss}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />
          {/* Flex centring rather than top-1/2 + -translate-y-1/2: Framer Motion
              writes its own transform for the `y` animation, which would drop
              the Tailwind translate mid-flight and make the card jump. The
              wrapper also scrolls, so a day with many wins stays reachable on a
              short phone screen. */}
          <div className="fixed inset-0 z-[61] flex items-center justify-center overflow-y-auto overscroll-contain p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Yesterday's result"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              transition={spring}
              className="relative my-auto w-full max-w-[440px]"
            >
              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="absolute -top-11 right-0 grid size-9 place-items-center rounded-full bg-white/10 text-muted transition-colors hover:text-fg"
              >
                <X size={17} />
              </button>
              <p className="mb-2 text-center text-[11px] uppercase tracking-[0.14em] text-faint">
                Yesterday
              </p>
              <PraiseCard praise={praise} />
              <Button variant="primary" className="mt-3 w-full" onClick={dismiss}>
                Start today
              </Button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
