import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { AMAZON_COVERAGE, type CoverageTopic } from '@/data/amazon';
import { Card, SectionTitle } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import { ActionChip, DayChip } from './badges';
import { useAmazonActions } from './useAmazonActions';
import type { AmazonTab } from './AmazonTabs';

/**
 * The tracker's 25 coverage topics with his "solid" marks. A solid topic
 * drops its Phase 1 basics to P3 (engine/amazon.ts effectiveTier); asked
 * problems are never affected.
 */
export function TopicCoverage({ onGoDay, onGoTab }: { onGoDay: (n: number) => void; onGoTab: (t: AmazonTab) => void }) {
  const state = useAppState();
  const act = useAmazonActions();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const solid = new Set(state.amazon.solidTopics);

  return (
    <section>
      <SectionTitle>Topic coverage</SectionTitle>
      <Card>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-[44px] w-full items-center justify-between gap-3 text-left"
        >
          <span className="min-w-0">
            <span className="tnum block text-[14px] font-medium text-fg">
              {AMAZON_COVERAGE.length} topics · {solid.size} marked solid
            </span>
            <span className="block text-[12px] text-muted">Each topic lists the days that cover it.</span>
          </span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={reduce ? { duration: 0 } : spring} className="shrink-0 text-faint">
            <ChevronDown size={18} />
          </motion.span>
        </button>
        <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
          Mark a topic solid when you can write its template cold. Its Phase 1 basics then drop to P3, optional: the planner
          sheds them first and adds them back only when you run ahead. Asked problems never drop.
        </p>
        {open && (
          <ul className="mt-3 divide-y divide-line">
            {AMAZON_COVERAGE.map((t) => (
              <CoverageRow
                key={t.id}
                topic={t}
                solid={solid.has(t.id)}
                onToggle={() => act.toggleSolid(t.id)}
                onGoDay={onGoDay}
                onGoTab={onGoTab}
              />
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}

function CoverageRow({
  topic,
  solid,
  onToggle,
  onGoDay,
  onGoTab,
}: {
  topic: CoverageTopic;
  solid: boolean;
  onToggle: () => void;
  onGoDay: (n: number) => void;
  onGoTab: (t: AmazonTab) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <li className="flex items-start gap-3 py-2">
      <div className="min-w-0 flex-1 py-1">
        <p className={cn('text-[14px] leading-snug', solid ? 'text-muted' : 'text-fg')}>{topic.t}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {topic.go.map((g) =>
            typeof g === 'number' ? (
              <DayChip key={g} day={g} onClick={() => onGoDay(g)} />
            ) : g === 'freq' ? (
              <ActionChip key={g} label="Frequency list" onClick={() => onGoTab('freq')} />
            ) : g === 'stories' ? (
              <ActionChip key={g} label="Stories" onClick={() => onGoTab('stories')} />
            ) : (
              <span key={String(g)} className="text-[11px] text-faint">
                {String(g)}
              </span>
            ),
          )}
        </div>
      </div>
      <motion.button
        type="button"
        aria-pressed={solid}
        onClick={onToggle}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        transition={spring}
        className={cn(
          'inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors',
          solid ? 'border-success/40 bg-success-soft text-success' : 'border-line2 bg-surface text-muted hover:text-fg',
        )}
      >
        {solid && <Check size={14} strokeWidth={3} />}
        Solid
      </motion.button>
    </li>
  );
}
