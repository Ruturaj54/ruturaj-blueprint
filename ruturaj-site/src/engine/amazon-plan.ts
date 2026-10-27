import type { AppState } from '@/lib/schema';
import type { Priority } from './types';
import { AMAZON_ITEMS, effectiveTier, solidDays, revisionsDue, type AmazonItem } from './amazon';
import { programInfo } from './program';
import { todayISO, addDays, daysBetween } from './dates';
import { dayTypeOf, studyCapacity } from './schedule';
import { exerciseSlotFor } from './fitness';

/**
 * Today's Amazon set, fitted to the time he actually has.
 *
 * The curriculum is ~185 hours; a 14-day window is ~90. So the planner first
 * works out which priority tiers fit in the window that is left (P0 always,
 * then P1, P2, P3 while they fit), then fills today in curriculum order with
 * items at or above that tier floor. Revisions that are due come first. If an
 * interview date is set and close, Phase 3 (the asked problems and mocks)
 * jumps to the front, which is the tracker's own advice.
 */

export interface PlannedItem {
  id: string;
  item: AmazonItem;
  minutes: number;
  revision: boolean;
  tier: Priority;
  reason: string;
}

export interface Pace {
  remainingByTier: Record<Priority, number>;
  capacityLeft: number;
  daysLeft: number;
  fits: Priority[];
  /** Hours per day needed to clear every tier at or above the floor. */
  hoursPerDayNeeded: number;
  note: string;
}

export interface AmazonDayPlan {
  date: string;
  mode: 'curriculum' | 'interview' | 'interview-day' | 'done';
  capacity: number;
  budget: number;
  planned: PlannedItem[];
  plannedIds: string[];
  totalMinutes: number;
  tierFloor: Priority;
  pace: Pace;
  /** "Day 9 · Binary search" — the curriculum day most of today comes from. */
  focus: string;
  nextUp: AmazonItem[];
  daysToInterview: number | null;
}

const TIERS: Priority[] = ['P0', 'P1', 'P2', 'P3'];
/** Plan to this share of a block, so the day has air in it. */
const BREATHING_ROOM = 0.85;
const MAX_REVISIONS = 3;
const INTERVIEW_MODE_DAYS = 10;

const tierRank = (t: Priority): number => TIERS.indexOf(t);

/** "P1", "P1 and P2", "P1, P2 and P3". */
export function tierList(xs: readonly Priority[]): string {
  if (xs.length <= 1) return xs.join('');
  return `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`;
}

function reasonFor(item: AmazonItem, tier: Priority): string {
  if (item.asked === 1) return `${tier} · asked in ${item.src.length} report${item.src.length === 1 ? '' : 's'}`;
  if (item.type === 'task') return `${tier} · ${item.kind} work from the tracker`;
  if (item.f3 && item.f3 >= 60) return `${tier} · Amazon frequency ${Math.round(item.f3)}`;
  if (item.asked === 2) return `${tier} · asked in 2022`;
  if (item.phase === 2) return `${tier} · core pattern`;
  if (item.phase === 1) return `${tier} · basics${tier === 'P3' ? ', topic marked solid' : ''}`;
  return `${tier} · ${item.slot === 'night' ? 'night-block extra' : 'curriculum'}`;
}

export function dailyBudget(state: AppState, date: string): number {
  const capacity = studyCapacity(state.settings, dayTypeOf(date), exerciseSlotFor(state, date));
  return Math.round(capacity * BREATHING_ROOM);
}

export function buildAmazonDay(state: AppState, date: string = todayISO()): AmazonDayPlan {
  const info = programInfo(state, date);
  const done = state.amazon.items;
  const solid = solidDays(state.amazon.solidTopics);
  const capacity = studyCapacity(state.settings, dayTypeOf(date), exerciseSlotFor(state, date));
  const budget = Math.round(capacity * BREATHING_ROOM);

  const interview = state.amazon.interviewDate ?? null;
  const daysToInterview = interview ? daysBetween(date, interview) : null;
  const interviewMode = daysToInterview !== null && daysToInterview >= 0 && daysToInterview <= INTERVIEW_MODE_DAYS;

  const pool = AMAZON_ITEMS.filter((i) => !done[i.key]).map((item) => ({
    item,
    tier: effectiveTier(item, solid),
  }));
  if (interviewMode) {
    pool.sort((a, b) =>
      b.item.phase - a.item.phase ||
      a.item.day - b.item.day ||
      (a.item.slot === b.item.slot ? 0 : a.item.slot === 'core' ? -1 : 1) ||
      a.item.index - b.item.index,
    );
  }

  // The window that is left: the end of the intensive, capped by the day
  // before the interview whenever one is set.
  const baseEnd = info.amazon.overrun ? addDays(date, 6) : info.amazon.endsOn;
  const beforeInterview = interview && daysToInterview !== null && daysToInterview >= 1 ? addDays(interview, -1) : null;
  const windowEnd = beforeInterview && beforeInterview < baseEnd ? beforeInterview : baseEnd;
  const daysLeft = Math.max(1, daysBetween(date, windowEnd) + 1);
  let capacityLeft = 0;
  for (let i = 0; i < daysLeft; i += 1) capacityLeft += dailyBudget(state, addDays(date, i));

  const remainingByTier: Record<Priority, number> = { P0: 0, P1: 0, P2: 0, P3: 0 };
  for (const p of pool) remainingByTier[p.tier] += p.item.minutes;

  const fits: Priority[] = [];
  let cumulative = 0;
  for (const t of TIERS) {
    cumulative += remainingByTier[t];
    if (t === 'P0' || cumulative <= capacityLeft) fits.push(t);
    else break;
  }
  const tierFloor = fits[fits.length - 1] ?? 'P0';
  const neededMinutes = fits.reduce((n, t) => n + remainingByTier[t], 0);
  const hoursPerDayNeeded = Math.round((neededMinutes / daysLeft / 60) * 10) / 10;

  const shed = TIERS.filter((t) => !fits.includes(t));
  const hoursLeft = Math.round(capacityLeft / 60);
  const pace: Pace = {
    remainingByTier,
    capacityLeft,
    daysLeft,
    fits,
    hoursPerDayNeeded,
    note:
      remainingByTier.P0 > capacityLeft
        ? `The must-do set alone needs ${Math.round(remainingByTier.P0 / 60)}h and ${hoursLeft}h are left in the window. Extend the window or accept that some asked problems will be skipped.`
        : shed.length === 0
          ? 'Everything fits. Work in curriculum order; nothing is being shed.'
          : `${tierList(fits)} ${fits.length === 1 ? 'fits' : 'fit'} in the ${hoursLeft}h left. ${tierList(shed)} ${shed.length === 1 ? 'stays' : 'stay'} visible as optional and ${shed.length === 1 ? 'is' : 'are'} added when you run ahead.`,
  };

  if (daysToInterview === 0) {
    return {
      date, mode: 'interview-day', capacity, budget, planned: [], plannedIds: [], totalMinutes: 0, tierFloor, pace,
      focus: 'Interview day', nextUp: [], daysToInterview,
    };
  }

  const planned: PlannedItem[] = [];
  let used = 0;

  for (const item of revisionsDue(state, date).slice(0, MAX_REVISIONS)) {
    const log = done[item.key];
    const minutes = Math.max(15, Math.round(item.minutes * 0.6));
    planned.push({
      id: `rev:${item.key}`,
      item,
      minutes,
      revision: true,
      tier: 'P0',
      reason: `Revision due · ${log?.outcome === 'hint' ? 'needed a hint' : log?.outcome === 'reviewed' ? 'read the solution' : 'keep it warm'} on ${log?.doneOn ?? date}`,
    });
    used += minutes;
  }

  for (const p of pool) {
    if (tierRank(p.tier) > tierRank(tierFloor)) continue;
    const fitsToday = used + p.item.minutes <= budget;
    const nothingYet = planned.every((x) => x.revision);
    if (!fitsToday && !nothingYet) break;
    planned.push({ id: p.item.key, item: p.item, minutes: p.item.minutes, revision: false, tier: p.tier, reason: reasonFor(p.item, p.tier) });
    used += p.item.minutes;
    if (used >= budget) break;
  }

  // Ahead of the floor (less than half the budget used by must-do work):
  // top up with the shed tiers in curriculum order, labelled as such.
  if (used < budget / 2) {
    const taken = new Set(planned.map((x) => x.item.key));
    for (const p of pool) {
      if (tierRank(p.tier) <= tierRank(tierFloor) || taken.has(p.item.key)) continue;
      if (used + p.item.minutes > budget) continue;
      planned.push({ id: p.item.key, item: p.item, minutes: p.item.minutes, revision: false, tier: p.tier, reason: `${p.tier} · below the floor, added because you are ahead` });
      taken.add(p.item.key);
      used += p.item.minutes;
    }
  }

  const plannedKeys = new Set(planned.map((x) => x.item.key));
  const aboveFloor = pool.filter((p) => tierRank(p.tier) <= tierRank(tierFloor) && !plannedKeys.has(p.item.key));
  const nextUp = (aboveFloor.length ? aboveFloor : pool.filter((p) => !plannedKeys.has(p.item.key)))
    .slice(0, 3)
    .map((p) => p.item);

  const lead = planned.find((x) => !x.revision)?.item ?? planned[0]?.item;
  const focus = pool.length === 0 ? 'Curriculum complete' : lead ? `Day ${lead.day} · ${lead.topic}` : 'Revision';

  return {
    date,
    mode: pool.length === 0 ? 'done' : interviewMode ? 'interview' : 'curriculum',
    capacity,
    budget,
    planned,
    plannedIds: planned.map((x) => x.id),
    totalMinutes: used,
    tierFloor,
    pace,
    focus,
    nextUp,
    daysToInterview,
  };
}
