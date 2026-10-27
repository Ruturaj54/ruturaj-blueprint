import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Activity,
  BookOpen,
  Briefcase,
  ChevronDown,
  Coffee,
  Footprints,
  ListChecks,
  Moon,
  Sunrise,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import { Chip, ProgressBar } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import { formatHM, type Slot } from '@/engine/schedule';
import type { EntryKind } from '@/data/routine';
import { SlotItemList } from './SlotItemList';

/** One lucide icon and one rail tone per entry kind, so the day scans by colour. */
const KIND: Record<EntryKind, { icon: LucideIcon; text: string; rail: string }> = {
  wake: { icon: Sunrise, text: 'text-warn', rail: 'bg-warn/60' },
  move: { icon: Activity, text: 'text-success', rail: 'bg-success' },
  meal: { icon: Utensils, text: 'text-muted', rail: 'bg-line2' },
  work: { icon: Briefcase, text: 'text-info', rail: 'bg-info' },
  study: { icon: BookOpen, text: 'text-accent', rail: 'bg-accent' },
  walk: { icon: Footprints, text: 'text-success', rail: 'bg-success/60' },
  free: { icon: Coffee, text: 'text-muted', rail: 'bg-line2' },
  routine: { icon: ListChecks, text: 'text-muted', rail: 'bg-line2' },
  sleep: { icon: Moon, text: 'text-faint', rail: 'bg-line' },
};

export type RowTime = 'past' | 'now' | 'future';

/**
 * One entry of the day. Study blocks show their items, done state and a fill
 * bar; every row keeps its note one tap away. The entry happening now is open
 * and highlighted, and entries already behind him dim.
 */
export function TimelineRow({
  slot,
  time,
  completed,
  last,
}: {
  slot: Slot;
  time: RowTime;
  completed: ReadonlySet<string>;
  last: boolean;
}) {
  const reduce = useReducedMotion();
  const now = time === 'now';
  const [open, setOpen] = useState(now);
  // When this entry becomes the live one, open its note without a tap.
  useEffect(() => {
    if (now) setOpen(true);
  }, [now]);
  const study = slot.kind === 'study';
  const holdsWork = slot.capacity > 0;
  const kind = KIND[slot.kind];
  const Icon = kind.icon;
  const pct = holdsWork ? (slot.used / slot.capacity) * 100 : 0;

  return (
    <div className={cn('relative flex gap-3', time === 'past' && 'opacity-55')}>
      <div className="w-[44px] shrink-0 pt-3 text-right">
        <p className={cn('tnum font-mono text-[12px] leading-none', now ? 'text-accent' : study ? 'text-fg' : 'text-muted')}>
          {slot.start}
        </p>
        <p className="tnum mt-1 font-mono text-[10px] leading-none text-faint">{slot.end}</p>
      </div>

      <div className="relative flex w-[14px] shrink-0 justify-center">
        <span className={cn('absolute top-0 w-[2px] rounded-full', kind.rail, last ? 'h-[22px]' : 'bottom-0')} />
        <motion.span
          className={cn('relative mt-[14px] size-[10px] rounded-full border-2 border-bg', now ? 'bg-accent' : kind.rail)}
          animate={now && !reduce ? { scale: [1, 1.35, 1] } : { scale: 1 }}
          transition={now && !reduce ? { duration: 1.8, repeat: Infinity } : spring}
        />
      </div>

      <div className="min-w-0 flex-1 pb-2.5">
        <motion.button
          type="button"
          onClick={() => setOpen((v) => !v)}
          whileTap={reduce ? undefined : { scale: 0.985 }}
          transition={spring}
          aria-expanded={open}
          className={cn(
            'min-h-[44px] w-full rounded-[12px] border px-3 py-2.5 text-left transition-colors',
            now ? 'border-accent/40 bg-accent-soft' : study ? 'border-line bg-surface' : 'border-transparent hover:bg-raised',
          )}
        >
          <div className="flex items-center gap-2">
            <Icon size={15} className={cn('shrink-0', kind.text)} />
            <p className={cn('min-w-0 flex-1 text-[14px] leading-snug text-fg', (study || now) && 'font-medium')}>{slot.label}</p>
            {now && <Chip tone="accent">Now</Chip>}
            {holdsWork && (
              <span className="tnum shrink-0 font-mono text-[11px] text-faint">
                {formatHM(slot.used)}/{formatHM(slot.capacity)}
              </span>
            )}
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={reduce ? { duration: 0 } : spring}
              className="shrink-0 text-faint"
            >
              <ChevronDown size={14} />
            </motion.span>
          </div>

          {holdsWork && <ProgressBar value={pct} tone="accent" className="mt-2" />}
          {holdsWork && <SlotItemList slotId={slot.id} items={slot.items} completed={completed} />}

          <AnimatePresence initial={false}>
            {open && (
              <motion.p
                initial={reduce ? false : { height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={reduce ? { duration: 0 } : spring}
                className="overflow-hidden text-[12px] leading-relaxed text-muted"
              >
                <span className="block pt-2">{slot.note}</span>
              </motion.p>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
