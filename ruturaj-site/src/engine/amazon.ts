import type { AppState, AmazonOutcome } from '@/lib/schema';
import type { Priority } from './types';
import { AMAZON_DAYS, AMAZON_COVERAGE, plainText, type RawItem, type LcDifficulty } from '@/data/amazon';
import { todayISO, addDays } from './dates';

/**
 * The Amazon curriculum as a flat, tiered list.
 *
 * Every item in the tracker's 28 days gets a priority tier so the planner can
 * fit a 185-hour curriculum into whatever window he actually has, shedding
 * P3 first. The rules are visible here, and the UI shows the reason per item.
 */

export interface AmazonItem {
  key: string;
  day: number;
  phase: 1 | 2 | 3;
  slot: 'core' | 'night';
  index: number;
  type: 'lc' | 'task';
  /** Plain title, no HTML. */
  title: string;
  /** Original text with <b> tags, for rich rendering. */
  rich: string;
  /** "Problem" for LeetCode items, otherwise the task kind (LP, Mock, …). */
  kind: string;
  slug?: string;
  n?: number;
  d?: LcDifficulty;
  f3?: number;
  f30?: number;
  prem: boolean;
  /** 1 = asked in a 2025–26 report, 2 = asked in a 2022 report. */
  asked: 0 | 1 | 2;
  src: string[];
  note?: string;
  minutes: number;
  tier: Priority;
  /** A deliberate re-solve of an earlier problem (lru-cache--2 and friends). */
  repeat: boolean;
  topic: string;
}

export const LC_MINUTES: Record<LcDifficulty, number> = { E: 20, M: 40, H: 60 };

const TASK_MINUTES: Record<string, number> = {
  Learn: 45,
  LP: 30,
  Notes: 30,
  Review: 60,
  Mock: 60,
  Resume: 45,
  GenAI: 40,
  LLD: 60,
  Problem: 40,
  Ladder: 60,
  Rest: 0,
};

const P0_TASKS = new Set(['LP', 'Mock', 'Resume', 'GenAI', 'LLD', 'Review', 'Ladder', 'Problem', 'Rest']);

const nextTier = (t: Priority): Priority => (t === 'P0' ? 'P1' : t === 'P1' ? 'P2' : 'P3');

function tierFor(raw: RawItem, day: number, phase: number, slot: 'core' | 'night'): Priority {
  if (day === 28) return 'P0';
  if (raw.t === 'task') {
    if (raw.a === 1 || P0_TASKS.has(raw.k)) return 'P0';
    return 'P1';
  }
  const f3 = raw.f3 ?? 0;
  let tier: Priority;
  if (raw.a === 1) tier = 'P0';
  else if (f3 >= 60) tier = 'P1';
  else if (phase === 2 && slot === 'core' && f3 >= 40) tier = 'P1';
  else if (raw.a === 2) tier = 'P2';
  else if (slot === 'core') tier = 'P2';
  else if (f3 >= 50) tier = 'P2';
  else tier = 'P3';
  if (raw.prem && raw.a !== 1) tier = nextTier(tier);
  return tier;
}

function flatten(): AmazonItem[] {
  const out: AmazonItem[] = [];
  for (const d of AMAZON_DAYS) {
    const phase = (d.phase as 1 | 2 | 3) ?? 1;
    const push = (raw: RawItem, slot: 'core' | 'night', index: number) => {
      const base = {
        key: raw.key,
        day: d.n,
        phase,
        slot,
        index,
        asked: (raw.a === 1 ? 1 : raw.a === 2 ? 2 : 0) as 0 | 1 | 2,
        src: (raw.src ?? []).filter((s) => s !== 'freq'),
        tier: tierFor(raw, d.n, phase, slot),
        topic: d.title,
      };
      if (raw.t === 'lc') {
        out.push({
          ...base,
          type: 'lc',
          title: raw.name,
          rich: raw.name,
          kind: 'Problem',
          slug: raw.slug,
          n: raw.n,
          d: raw.d,
          f3: raw.f3,
          f30: raw.f30,
          prem: Boolean(raw.prem),
          note: raw.note,
          minutes: LC_MINUTES[raw.d],
          repeat: /--\d$/.test(raw.key),
        });
      } else {
        out.push({
          ...base,
          type: 'task',
          title: plainText(raw.text),
          rich: raw.text,
          kind: raw.k,
          prem: false,
          minutes: TASK_MINUTES[raw.k] ?? 45,
          repeat: false,
        });
      }
    };
    d.items.forEach((raw, i) => push(raw, 'core', i));
    d.night.forEach((raw, i) => push(raw, 'night', i));
  }
  return out;
}

/** Curriculum order: day, core before night, then position. */
export const AMAZON_ITEMS: readonly AmazonItem[] = flatten();

const BY_KEY = new Map(AMAZON_ITEMS.map((i) => [i.key, i]));

export function amazonItem(key: string): AmazonItem | undefined {
  return BY_KEY.get(key);
}

export const AMAZON_PROBLEM_SLUGS: readonly string[] = [
  ...new Set(AMAZON_ITEMS.filter((i) => i.type === 'lc' && i.slug).map((i) => i.slug as string)),
];

export const AMAZON_ASKED_SLUGS: readonly string[] = [
  ...new Set(AMAZON_ITEMS.filter((i) => i.type === 'lc' && i.asked === 1 && i.slug).map((i) => i.slug as string)),
];

/** Phase-1 day numbers covered by a coverage topic he marked solid. */
export function solidDays(solidTopics: readonly string[]): Set<number> {
  const days = new Set<number>();
  for (const id of solidTopics) {
    const topic = AMAZON_COVERAGE.find((t) => t.id === id);
    for (const go of topic?.go ?? []) if (typeof go === 'number' && go <= 7) days.add(go);
  }
  return days;
}

/** Effective tier after his "solid" marks: basics of a solid topic become optional. */
export function effectiveTier(item: AmazonItem, solid: Set<number>): Priority {
  if (item.phase === 1 && item.asked === 0 && solid.has(item.day)) return 'P3';
  return item.tier;
}

/* ---------- logging and spaced revision ------------------------------------ */

/**
 * When a problem comes back as a cold re-solve. A hint means three days, a
 * solution read means two, and a clean solve of an asked problem returns once
 * a week, twice, so the ones that matter stay warm.
 */
export function nextRevisit(outcome: AmazonOutcome, asked: boolean, from: string, revisits: number): string | undefined {
  if (outcome === 'hint') return addDays(from, 3);
  if (outcome === 'reviewed') return addDays(from, 2);
  if (asked && revisits < 2) return addDays(from, 7);
  return undefined;
}

export interface LogInput {
  outcome?: AmazonOutcome;
  minutes?: number;
  note?: string;
}

/** Records an outcome for a curriculum item (first solve or a revisit). */
export function logAmazonItem(draft: AppState, key: string, input: LogInput, today: string = todayISO()): void {
  const item = amazonItem(key);
  const prev = draft.amazon.items[key];
  const asked = item?.asked === 1;
  const isRevisit = Boolean(prev);
  const revisits = isRevisit ? (prev?.revisits ?? 0) + 1 : 0;
  const outcome = item?.type === 'lc' ? input.outcome ?? 'independent' : undefined;
  const revisitOn = outcome && item ? nextRevisit(outcome, asked, today, revisits) : undefined;
  // Keep what the revisit overwrites, so a mis-tap can be reverted exactly.
  const history = prev
    ? [...(prev.history ?? []), { on: today, ...(prev.outcome ? { outcome: prev.outcome } : {}), ...(prev.revisitOn ? { revisitOn: prev.revisitOn } : {}) }]
    : undefined;

  draft.amazon.items[key] = {
    doneOn: prev?.doneOn ?? today,
    ...(history?.length ? { history } : {}),
    ...(outcome ? { outcome } : {}),
    ...(input.minutes !== undefined ? { minutes: input.minutes } : prev?.minutes !== undefined ? { minutes: prev.minutes } : {}),
    ...(input.note ? { note: input.note } : prev?.note ? { note: prev.note } : {}),
    ...(revisitOn ? { revisitOn } : {}),
    revisits,
  };

  const log = (draft.days[today] ??= { planned: [], completed: [] });
  const id = isRevisit ? `rev:${key}` : key;
  if (!log.completed.includes(id)) log.completed.push(id);
}

/** Removes a log entirely, with every tick it ever produced (first solve and re-solves). */
export function unlogAmazonItem(draft: AppState, key: string): void {
  if (!draft.amazon.items[key]) return;
  delete draft.amazon.items[key];
  for (const log of Object.values(draft.days)) {
    log.completed = log.completed.filter((id) => id !== key && id !== `rev:${key}`);
  }
}

/** Reverts a mis-tapped re-solve: the tick goes, the previous outcome and due date come back. */
export function unlogAmazonRevisit(draft: AppState, key: string, date: string): void {
  const day = draft.days[date];
  if (day) day.completed = day.completed.filter((id) => id !== `rev:${key}`);
  const log = draft.amazon.items[key];
  if (!log) return;
  log.revisits = Math.max(0, log.revisits - 1);
  const last = log.history?.pop();
  if (log.history && log.history.length === 0) delete log.history;
  if (!last) return;
  if (last.outcome) log.outcome = last.outcome;
  else delete log.outcome;
  if (last.revisitOn) log.revisitOn = last.revisitOn;
  else delete log.revisitOn;
}

/** Ticks or unticks one of the standalone checklists (LP, resume, GenAI, day-of, extras). */
export function toggleAmazonCheck(draft: AppState, key: string, today: string = todayISO()): void {
  if (draft.amazon.items[key]) delete draft.amazon.items[key];
  else draft.amazon.items[key] = { doneOn: today, revisits: 0 };
}

export function toggleAmazonExtra(draft: AppState, xkey: string, today: string = todayISO()): void {
  if (draft.amazon.extras[xkey]) delete draft.amazon.extras[xkey];
  else draft.amazon.extras[xkey] = today;
}

export function toggleSolidTopic(draft: AppState, id: string): void {
  const set = new Set(draft.amazon.solidTopics);
  if (set.has(id)) set.delete(id);
  else set.add(id);
  draft.amazon.solidTopics = [...set];
}

/** Revisits that are due on or before `today`, oldest first. */
export function revisionsDue(state: AppState, today: string = todayISO()): AmazonItem[] {
  return Object.entries(state.amazon.items)
    .filter(([, log]) => log.revisitOn && log.revisitOn <= today)
    .sort(([, a], [, b]) => (a.revisitOn ?? '').localeCompare(b.revisitOn ?? ''))
    .map(([key]) => amazonItem(key))
    .filter((i): i is AmazonItem => Boolean(i));
}
