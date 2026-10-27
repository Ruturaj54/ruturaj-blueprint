import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import type { AmazonItem } from '@/engine/amazon';
import type { Priority } from '@/engine/types';
import type { AmazonItemLog } from '@/lib/schema';
import { formatShort } from '@/engine/dates';
import { Chip } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { CheckBox } from './CheckBox';
import { OutcomeSheet } from './OutcomeSheet';
import { Proof } from './Proof';
import { AskedBadge, Difficulty, FreqChip, LcLink, Minutes, OutcomeChip, Rich, TierPill } from './badges';
import { useAmazonActions } from './useAmazonActions';

/**
 * One curriculum row, shared by today's set and the plan browser. Problems
 * open the outcome chooser on tick; tasks log directly. Unticking removes
 * the log (or, for a re-solve, just today's revisit).
 */
export interface ItemRowProps {
  item: AmazonItem;
  tier: Priority;
  /** Planned minutes for today, when they differ from the item's own. */
  minutes?: number;
  /** One line on why it is here today. */
  reason?: string;
  /** A due re-solve of an already logged problem. */
  revision?: boolean;
  /** The plan date; revision ticks are recorded against it. */
  date: string;
  compact?: boolean;
}

export function ItemRow({ item, tier, minutes, reason, revision = false, date, compact = false }: ItemRowProps) {
  const state = useAppState();
  const act = useAmazonActions();
  const [open, setOpen] = useState(false);
  const log = state.amazon.items[item.key];
  const checked = revision ? (state.days[date]?.completed ?? []).includes(`rev:${item.key}`) : Boolean(log);
  const mins = minutes ?? item.minutes;

  const onTick = (next: boolean) => {
    if (!next) {
      setOpen(false);
      if (revision) act.unlogRevisit(item.key, date);
      else act.unlog(item.key);
      return;
    }
    if (item.type === 'lc') {
      setOpen((o) => !o);
      return;
    }
    act.log(item.key);
  };

  return (
    <div>
      <div className="flex items-start gap-1">
        <CheckBox checked={checked} onChange={onTick} label={revision ? `Re-solve cold: ${item.title}` : item.title} />
        <div className="min-w-0 flex-1 py-[10px] pr-1">
          <p className={cn('text-[14px] leading-snug', checked ? 'text-faint' : 'text-fg')}>
            {revision && (
              <span className="mr-1.5 inline-flex items-center gap-1 align-middle text-[12px] font-medium text-amazon-ink">
                <RotateCcw size={12} /> Re-solve cold
              </span>
            )}
            {item.type === 'lc' && item.slug ? (
              <LcLink slug={item.slug} n={item.n} name={item.title} className={checked ? 'text-faint line-through' : undefined} />
            ) : (
              <Rich html={item.rich} className={checked ? 'line-through' : undefined} />
            )}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            {item.type === 'task' && <Chip>{item.kind}</Chip>}
            {item.d && <Difficulty d={item.d} />}
            <Minutes minutes={mins} />
            <TierPill tier={tier} />
            <AskedBadge asked={item.asked} />
            {!compact && <FreqChip f3={item.f3} />}
            {!compact && item.prem && <Chip>Premium</Chip>}
            {!compact && item.repeat && <Chip>Deliberate repeat</Chip>}
            {!compact && <Proof src={item.src} />}
          </div>
          {reason && <p className="mt-1 text-[12px] leading-snug text-muted">Why: {reason}</p>}
          {!compact && item.note && <p className="mt-1 text-[12px] italic leading-snug text-muted">{item.note}</p>}
          {checked && log && <DoneLine log={log} date={date} compact={compact} />}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && !checked && (
          <OutcomeSheet
            key="sheet"
            defaultMinutes={mins}
            onSubmit={(input) => {
              act.log(item.key, input);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DoneLine({ log, date, compact }: { log: AmazonItemLog; date: string; compact: boolean }) {
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-muted">
      <OutcomeChip outcome={log.outcome} />
      {log.minutes !== undefined && <span className="tnum font-mono">{log.minutes}m</span>}
      {log.doneOn !== date && <span>logged {formatShort(log.doneOn)}</span>}
      {log.revisitOn &&
        (log.revisitOn <= date ? (
          <span className="font-medium text-warn">Re-solve due</span>
        ) : (
          <span>Re-solve cold on {formatShort(log.revisitOn)}</span>
        ))}
      {log.revisits > 0 && (
        <span>
          {log.revisits} revisit{log.revisits === 1 ? '' : 's'}
        </span>
      )}
      {!compact && log.note && <span className="w-full italic">{log.note}</span>}
    </div>
  );
}
