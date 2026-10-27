import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CalendarCheck } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import type { AmazonDayPlan } from '@/engine/amazon-plan';
import { amazonItem, effectiveTier, solidDays, type AmazonItem } from '@/engine/amazon';
import type { Priority } from '@/engine/types';
import { formatHM } from '@/engine/schedule';
import { Chip, EmptyState } from '@/components/ui/primitives';
import { Banner } from '@/components/ui/controls';
import { spring } from '@/lib/motion';
import { Target } from 'lucide-react';
import { ItemRow } from './ItemRow';

/**
 * Today's set. The planner drops an item the moment it is logged, so the
 * rows logged today are read back from the day log and kept visible with
 * their outcome; the list is undone first, done below.
 */

interface Row {
  id: string;
  item: AmazonItem;
  tier: Priority;
  minutes: number;
  revision: boolean;
  reason?: string;
  done: boolean;
}

function useRows(plan: AmazonDayPlan): Row[] {
  const state = useAppState();
  const solid = solidDays(state.amazon.solidTopics);
  const rows: Row[] = plan.planned.map((p) => ({
    id: p.id,
    item: p.item,
    tier: p.tier,
    minutes: p.minutes,
    revision: p.revision,
    reason: p.reason,
    done: false,
  }));
  const seen = new Set(rows.map((r) => r.id));
  for (const id of state.days[plan.date]?.completed ?? []) {
    if (seen.has(id)) continue;
    const revision = id.startsWith('rev:');
    const item = amazonItem(revision ? id.slice(4) : id);
    if (!item) continue;
    seen.add(id);
    const log = state.amazon.items[item.key];
    rows.push({ id, item, tier: effectiveTier(item, solid), minutes: log?.minutes ?? item.minutes, revision, done: true });
  }
  return rows;
}

export function AmazonSet({
  plan,
  compact = false,
  navigate,
}: {
  plan: AmazonDayPlan;
  compact?: boolean;
  navigate?: (id: string) => void;
}) {
  const rows = useRows(plan);
  const reduce = useReducedMotion();
  const undone = rows.filter((r) => !r.done);
  const done = rows.filter((r) => r.done);
  const doneMinutes = done.reduce((n, r) => n + r.minutes, 0);

  const renderRow = (r: Row) => (
    <motion.div key={r.id} layout={reduce ? false : 'position'} transition={spring} className="py-1">
      <ItemRow
        item={r.item}
        tier={r.tier}
        minutes={r.minutes}
        {...(r.reason ? { reason: r.reason } : {})}
        revision={r.revision}
        date={plan.date}
        compact={compact}
      />
    </motion.div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-[16px] font-bold leading-tight">Today's Amazon set</p>
          <p className="mt-0.5 text-[12px] text-muted">{plan.focus}</p>
        </div>
        {plan.mode === 'interview' && <Chip tone="amazon">Interview mode · Phase 3 first</Chip>}
        {plan.mode === 'done' && <Chip tone="success">Curriculum complete</Chip>}
        {plan.daysToInterview !== null && plan.daysToInterview > 0 && (
          <Chip tone="amazon">
            {plan.daysToInterview} day{plan.daysToInterview === 1 ? '' : 's'} to the interview
          </Chip>
        )}
      </div>

      {plan.mode === 'interview-day' ? (
        <div className="mt-3">
          <Banner tone="amazon" icon={<CalendarCheck size={16} />}>
            Interview day. Nothing new is planned: run the day-of checklist, read your one-page sheet, and stop early.
          </Banner>
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Target size={22} />}
          title={plan.mode === 'done' ? 'Every curriculum item is logged' : 'Nothing planned today'}
          body={
            plan.mode === 'done'
              ? 'Re-solves still appear here when they fall due. Keep the asked problems warm.'
              : 'The window has no study time today. Check the timetable in Settings.'
          }
        />
      ) : (
        <div className="mt-2 divide-y divide-line">
          {undone.map(renderRow)}
          {done.length > 0 && (
            <p key="done-label" className="pt-3 text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
              Done today · {done.length} · {formatHM(doneMinutes)}
            </p>
          )}
          {done.map(renderRow)}
        </div>
      )}

      {!compact && plan.nextUp.length > 0 && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">Next up</p>
          <ul className="mt-1 space-y-0.5">
            {plan.nextUp.map((i) => (
              <li key={i.key} className="text-[13px] text-muted">
                {i.title} <span className="text-faint">· Day {i.day}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="tnum mt-3 text-[12px] text-muted">
        Planned {formatHM(plan.totalMinutes)} of {formatHM(plan.budget)} budget
        {done.length > 0 ? ` · logged ${formatHM(doneMinutes)} today` : ''}
      </p>

      {compact && navigate && (
        <button
          type="button"
          onClick={() => navigate('amazon')}
          className="mt-1 inline-flex min-h-[44px] items-center gap-1 text-[13px] font-medium text-amazon-ink hover:underline"
        >
          See full plan <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
