import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useAppState } from '@/hooks/useAppState';
import { AMAZON_DAYS, AMAZON_PHASES } from '@/data/amazon';
import { AMAZON_ITEMS, effectiveTier, solidDays, type AmazonItem } from '@/engine/amazon';
import { todayISO } from '@/engine/dates';
import { SectionTitle } from '@/components/ui/primitives';
import { Segmented } from '@/components/ui/controls';
import { Rich } from './badges';
import { DayCard } from './DayCard';
import { TopicCoverage } from './TopicCoverage';
import type { AmazonTab, DayFocus } from './AmazonTabs';

/**
 * The 28-day curriculum by phase, each day a collapsible card. The first
 * day with something undone opens by default; other tabs can ask for a day,
 * which opens it and scrolls it under the sticky header.
 */

type Filter = 'all' | 'undone' | 'asked' | 'p01';

const FILTERS: ReadonlyArray<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'undone', label: 'Undone' },
  { id: 'asked', label: 'Asked' },
  { id: 'p01', label: 'P0–P1 only' },
];

const BY_DAY = new Map<number, AmazonItem[]>();
for (const item of AMAZON_ITEMS) {
  const list = BY_DAY.get(item.day) ?? [];
  list.push(item);
  BY_DAY.set(item.day, list);
}

export function PlanBrowser({
  focus,
  onGoDay,
  onGoTab,
}: {
  focus: DayFocus | null;
  onGoDay: (n: number) => void;
  onGoTab: (t: AmazonTab) => void;
}) {
  const state = useAppState();
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<Filter>('all');
  const today = todayISO();
  const solid = useMemo(() => solidDays(state.amazon.solidTopics), [state.amazon.solidTopics]);
  const [open, setOpen] = useState<Set<number>>(
    () => new Set([AMAZON_ITEMS.find((i) => !state.amazon.items[i.key])?.day ?? 1]),
  );

  useEffect(() => {
    if (!focus) return undefined;
    setOpen((prev) => new Set(prev).add(focus.day));
    const id = window.setTimeout(() => {
      document
        .getElementById(`amazon-day-${focus.day}`)
        ?.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }, 60);
    return () => window.clearTimeout(id);
  }, [focus, reduce]);

  const toggle = (n: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });

  const show = (item: AmazonItem): boolean => {
    switch (filter) {
      case 'undone':
        return !state.amazon.items[item.key];
      case 'asked':
        return item.asked > 0;
      case 'p01': {
        const t = effectiveTier(item, solid);
        return t === 'P0' || t === 'P1';
      }
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      <Segmented value={filter} options={FILTERS} layoutId="amazon-plan-filter" onChange={setFilter} />

      {AMAZON_PHASES.map((phase) => {
        const cards = AMAZON_DAYS.filter((d) => d.phase === phase.n).map((d) => {
          const items = BY_DAY.get(d.n) ?? [];
          if (filter !== 'all' && !items.some(show)) return null;
          return (
            <DayCard
              key={d.n}
              day={d}
              items={items}
              show={show}
              open={open.has(d.n)}
              onToggle={() => toggle(d.n)}
              solid={solid}
              date={today}
            />
          );
        });
        return (
          <section key={phase.n}>
            <SectionTitle>
              Phase {phase.n} · {phase.name}
              <span className="ml-1.5 normal-case tracking-normal text-faint">{phase.range.split(' · ')[0] ?? phase.range}</span>
            </SectionTitle>
            <p className="mb-3 text-[13px] leading-relaxed text-muted">
              <Rich html={phase.desc} />
            </p>
            <div className="space-y-2">{cards}</div>
          </section>
        );
      })}

      <TopicCoverage onGoDay={onGoDay} onGoTab={onGoTab} />
    </div>
  );
}
