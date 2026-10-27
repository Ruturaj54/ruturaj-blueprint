import type { AppState } from '@/lib/schema';
import type { SlotItem } from './schedule';
import { buildAmazonDay, type AmazonDayPlan } from './amazon-plan';
import { buildPlan, type DailyPlan } from './planner';
import { programInfo } from './program';
import { todayISO, clampDay, dayForDate } from './dates';
import { formatHM } from './schedule';

/**
 * What today's study blocks hold, whichever phase he is in. Before Day 1 is
 * started this previews the Amazon Day 1 set, so the Start card and the
 * morning mail can show real content rather than a placeholder.
 */

export interface TodayWork {
  phase: 'amazon' | 'general' | 'not-started';
  items: SlotItem[];
  amazon?: AmazonDayPlan;
  general?: DailyPlan;
  /** One line: what today is about. */
  focus: string;
  minutes: number;
  /** Item ids the day is scored against (same ids as the day snapshot). */
  plannedIds: string[];
}

export function amazonSlotItems(plan: AmazonDayPlan): SlotItem[] {
  return plan.planned.map((p) => ({
    id: p.id,
    title: p.revision ? `Re-solve cold: ${p.item.title}` : p.item.title,
    context: p.revision ? 'Revision' : p.item.type === 'lc' ? p.item.topic : p.item.kind,
    minutes: p.minutes,
    kind: p.revision ? 'revision' : 'amazon',
  }));
}

export function generalSlotItems(plan: DailyPlan): SlotItem[] {
  const dsa: SlotItem = {
    id: 'dsa-today',
    title: plan.dsa.headline,
    context: 'DSA',
    minutes: plan.dsa.target * 25,
    kind: 'dsa',
  };
  const low = new Set(['watch', 'notes']);
  const missions = plan.missions.map<SlotItem>((m) =>
    m.kind === 'foundation'
      ? {
          id: m.milestone.id,
          title: m.milestone.title,
          context: m.subject.name,
          minutes: m.milestone.estMinutes,
          kind: low.has(m.milestone.proof) ? 'course' : 'build',
          carried: Boolean(m.carriedFrom),
        }
      : {
          id: m.scored.task.id,
          title: m.scored.task.title,
          context: m.scored.task.track,
          minutes: m.scored.task.estMinutes,
          kind: low.has(m.scored.task.proof) ? 'course' : 'build',
          carried: Boolean(m.carriedFrom),
        },
  );
  return [dsa, ...missions];
}

export function todayWork(state: AppState, date: string = todayISO()): TodayWork {
  const info = programInfo(state, date);
  if (!info.started || info.phase === 'amazon') {
    const amazon = buildAmazonDay(state, date);
    return {
      phase: info.started ? 'amazon' : 'not-started',
      items: amazonSlotItems(amazon),
      amazon,
      focus: amazon.focus,
      minutes: amazon.totalMinutes,
      plannedIds: amazon.plannedIds,
    };
  }
  const general = buildPlan(state, clampDay(dayForDate(date)));
  const items = generalSlotItems(general);
  const minutes = items.reduce((n, i) => n + i.minutes, 0);
  const lead = general.missions[0];
  const focus = lead
    ? lead.kind === 'foundation'
      ? `${lead.subject.name} · ${lead.milestone.title}`
      : lead.scored.task.title
    : 'Roadmap';
  return { phase: 'general', items, general, focus: `${focus} · ${formatHM(minutes)}`, minutes, plannedIds: general.plannedIds };
}

/** Title for a planned id, for day logs and mails. */
export function titleForPlannedId(state: AppState, id: string): string {
  const work = todayWork(state);
  return work.items.find((i) => i.id === id)?.title ?? id;
}
