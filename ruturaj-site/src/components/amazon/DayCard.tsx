import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import type { AmazonDay } from '@/data/amazon';
import { effectiveTier, type AmazonItem } from '@/engine/amazon';
import { ProgressBar } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import { ItemRow } from './ItemRow';

/** One curriculum day: header with progress, then core rows and the night block. */

const expand = { type: 'spring', stiffness: 300, damping: 34 } as const;

export function DayCard({
  day,
  items,
  show,
  open,
  onToggle,
  solid,
  date,
}: {
  day: AmazonDay;
  items: readonly AmazonItem[];
  /** Current filter; rows it rejects are hidden but still counted. */
  show: (item: AmazonItem) => boolean;
  open: boolean;
  onToggle: () => void;
  solid: Set<number>;
  date: string;
}) {
  const state = useAppState();
  const reduce = useReducedMotion();
  const done = items.filter((i) => state.amazon.items[i.key]).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const core = items.filter((i) => i.slot === 'core' && show(i));
  const night = items.filter((i) => i.slot === 'night' && show(i));

  return (
    <div
      id={`amazon-day-${day.n}`}
      className={cn('scroll-mt-[64px] rounded-[16px] border bg-surface shadow-card', pct === 100 ? 'border-success/30' : 'border-line')}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex min-h-[44px] w-full items-center gap-3 p-4 text-left"
      >
        <span className="tnum w-[58px] shrink-0 font-display text-[16px] font-bold text-amazon-ink">Day {day.n}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-medium leading-snug text-fg">{day.title}</span>
          <span className="tnum mt-0.5 block text-[12px] text-muted">
            {day.hours}
            {day.weekend ? ' · weekend' : ''} · done {done}/{items.length}
          </span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={reduce ? { duration: 0 } : spring} className="shrink-0 text-faint">
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <div className="px-4 pb-3">
        <ProgressBar value={pct} tone={pct === 100 ? 'success' : 'amazon'} />
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={expand}
            className="overflow-hidden"
          >
            <div className="border-t border-line px-2 pb-3 pt-2">
              <p className="px-2 py-1 text-[12.5px] italic leading-snug text-muted">{day.coach}</p>
              {core.map((i) => (
                <ItemRow key={i.key} item={i} tier={effectiveTier(i, solid)} date={date} />
              ))}
              {night.length > 0 && (
                <>
                  <p className="mt-2 border-t border-line px-2 pt-3 text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
                    Night block
                  </p>
                  {night.map((i) => (
                    <ItemRow key={i.key} item={i} tier={effectiveTier(i, solid)} date={date} />
                  ))}
                </>
              )}
              {core.length + night.length === 0 && (
                <p className="px-2 py-2 text-[13px] text-muted">Nothing on this day matches the filter.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
