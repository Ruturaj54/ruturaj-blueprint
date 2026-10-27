import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { spring } from '@/lib/motion';

/** A labelled fold inside a card: a 44px header row and an animated body. */
export function Disclosure({
  title,
  hint,
  defaultOpen = false,
  children,
}: {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const reduce = useReducedMotion();

  return (
    <div className="border-t border-line">
      <motion.button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        whileTap={reduce ? undefined : { scale: 0.99 }}
        transition={spring}
        className="flex min-h-[44px] w-full items-center justify-between gap-3 py-2 text-left"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{title}</span>
        <span className="flex shrink-0 items-center gap-2">
          {hint && <span className="tnum font-mono text-[11px] text-faint">{hint}</span>}
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={reduce ? { duration: 0 } : spring} className="text-faint">
            <ChevronDown size={15} />
          </motion.span>
        </span>
      </motion.button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : spring}
            className="overflow-hidden"
          >
            <div className="pb-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
