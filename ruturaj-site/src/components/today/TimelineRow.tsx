import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Bike,
  BedDouble,
  BookOpen,
  Briefcase,
  ChevronDown,
  Coffee,
  CornerDownRight,
  Footprints,
  Moon,
  Sparkles,
  Sunrise,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import { Chip, ProgressBar } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import { formatHM, type Slot } from '@/engine/schedule';
import type { EntryKind } from '@/data/routine';

const KIND: Record<EntryKind, { icon: LucideIcon; text: string; rail: string }> = {
  study: { icon: BookOpen, text: 'text-accent', rail: 'bg-accent' },
  work: { icon: Briefcase, text: 'text-info', rail: 'bg-info' },
  move: { icon: Footprints, text: 'text-success', rail: 'bg-success' },
  ride: { icon: Bike, text: 'text-success', rail: 'bg-success' },
  care: { icon: Sparkles, text: 'text-care', rail: 'bg-care' },
  meal: { icon: Utensils, text: 'text-muted', rail: 'bg-white/20' },
  routine: { icon: Coffee, text: 'text-muted', rail: 'bg-white/20' },
  sleep: { icon: BedDouble, text: 'text-faint', rail: 'bg-white/10' },
};

function iconFor(slot: Slot): LucideIcon {
  if (slot.id.endsWith('wake')) return Sunrise;
  if (slot.study === 'deep' && slot.kind === 'study' && slot.end < '06:00') return Moon;
  return KIND[slot.kind].icon;
}

export type RowTime = 'past' | 'now' | 'future';

/**
 * One entry of the day. Study blocks show their work and fill; everything else
 * keeps its note one tap away, so the full day reads as a timetable rather
 * than a wall of advice. The entry happening now is open and highlighted.
 */
export function TimelineRow({
  slot,
  time,
  completed,
  last,
}: {
  slot: Slot;
  time: RowTime;
  completed: Set<string>;
  last: boolean;
}) {
  const reduce = useReducedMotion();
  const study = slot.capacity > 0;
  const [open, setOpen] = useState(time === 'now');
  const showNote = study || open;
  const kind = KIND[slot.kind];
  const Icon = iconFor(slot);
  const pct = slot.capacity === 0 ? 0 : (slot.used / slot.capacity) * 100;

  return (
    <div className={cn('relative flex gap-3', time === 'past' && 'opacity-55')}>
      {/* time */}
      <div className="w-[46px] shrink-0 pt-3 text-right">
        <p className={cn('tnum font-mono text-[12px] leading-none', time === 'now' ? 'text-accent' : study ? 'text-fg' : 'text-muted')}>
          {slot.start}
        </p>
        <p className="tnum mt-1 font-mono text-[10px] leading-none text-faint">{slot.end}</p>
      </div>

      {/* rail */}
      <div className="relative flex w-[14px] shrink-0 justify-center">
        <span className={cn('absolute top-0 w-[2px] rounded-full', kind.rail, last ? 'h-[22px]' : 'bottom-0', !study && 'opacity-60')} />
        <motion.span
          className={cn(
            'relative mt-[14px] size-[10px] rounded-full border-2 border-bg',
            time === 'now' ? 'bg-accent' : kind.rail,
          )}
          animate={time === 'now' && !reduce ? { scale: [1, 1.35, 1] } : { scale: 1 }}
          transition={time === 'now' && !reduce ? { duration: 1.8, repeat: Infinity } : spring}
        />
      </div>

      {/* body */}
      <div className="min-w-0 flex-1 pb-2.5">
        <motion.button
          type="button"
          onClick={() => !study && setOpen((v) => !v)}
          whileTap={reduce || study ? undefined : { scale: 0.985 }}
          transition={spring}
          aria-expanded={study ? undefined : open}
          className={cn(
            'w-full rounded-[12px] border px-3 py-2.5 text-left transition-colors',
            time === 'now' ? 'border-accent/40 bg-accent/[0.06]' : study ? 'border-line bg-surface' : 'border-transparent hover:bg-raised',
            study && 'cursor-default',
          )}
        >
          <div className="flex items-center gap-2">
            <Icon size={15} className={cn('shrink-0', kind.text)} />
            <p className={cn('min-w-0 flex-1 text-[14px] leading-snug', study || time === 'now' ? 'font-medium text-fg' : 'text-fg/90')}>
              {slot.label}
            </p>
            {time === 'now' && <Chip tone="accent">Now</Chip>}
            {study && (
              <span className="tnum shrink-0 font-mono text-[11px] text-faint">
                {formatHM(slot.used)}/{formatHM(slot.capacity)}
              </span>
            )}
            {!study && (
              <motion.span animate={{ rotate: open ? 180 : 0 }} transition={reduce ? { duration: 0 } : spring} className="shrink-0 text-faint">
                <ChevronDown size={14} />
              </motion.span>
            )}
          </div>

          {study && <ProgressBar value={pct} tone={pct > 100 ? 'danger' : 'accent'} className="mt-2" />}

          {slot.items.length > 0 && (
            <div className="mt-2.5 space-y-2">
              {slot.items.map((item) => {
                const done = completed.has(item.id);
                return (
                  <div key={`${slot.id}-${item.id}`} className="flex items-start gap-2">
                    <span className={cn('mt-[7px] size-[6px] shrink-0 rounded-full', done ? 'bg-success' : item.kind === 'dsa' ? 'bg-info' : 'bg-accent')} />
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-[13px] leading-snug', done ? 'text-faint line-through' : 'text-fg')}>{item.title}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Chip>
                          {item.partial && item.totalMinutes ? `${formatHM(item.minutes)} of ${formatHM(item.totalMinutes)}` : formatHM(item.minutes)}
                        </Chip>
                        <Chip tone={item.kind === 'dsa' ? 'info' : 'default'}>{item.context}</Chip>
                        {item.carried && (
                          <Chip tone="accent">
                            <CornerDownRight size={11} />
                            Carried over
                          </Chip>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <AnimatePresence initial={false}>
            {showNote && (
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
