import type { Task, Priority, Difficulty } from '@/engine/types';

/**
 * Track A — DSA.
 *
 * Generated from a pattern table rather than written out by hand: the metadata
 * per pattern is genuinely uniform, and a table keeps the weakness engine and
 * the UI reading from one source of truth.
 *
 * `weight` is interview frequency across Amazon / Google / Microsoft style
 * loops, 1–10. It feeds both scheduling order and the weakness engine.
 */
export interface DsaPattern {
  id: string;
  name: string;
  weight: number;
  priority: Priority;
  difficulty: Difficulty;
  /** Target problems to have solved before this pattern counts as covered. */
  targetProblems: number;
  note?: string;
}

export const DSA_PATTERNS: readonly DsaPattern[] = [
  { id: 'arrays', name: 'Arrays & Hashing', weight: 10, priority: 'P0', difficulty: 'core', targetProblems: 12 },
  { id: 'twopointers', name: 'Two Pointers', weight: 9, priority: 'P0', difficulty: 'core', targetProblems: 8 },
  { id: 'sliding', name: 'Sliding Window', weight: 9, priority: 'P0', difficulty: 'core', targetProblems: 8 },
  { id: 'binarysearch', name: 'Binary Search', weight: 10, priority: 'P0', difficulty: 'core', targetProblems: 10, note: 'Include binary-search-on-the-answer — the variant most candidates miss.' },
  { id: 'stack', name: 'Stack', weight: 8, priority: 'P0', difficulty: 'core', targetProblems: 8, note: 'Monotonic stack is the high-value sub-pattern.' },
  { id: 'queue', name: 'Queue & Deque', weight: 6, priority: 'P1', difficulty: 'core', targetProblems: 5 },
  { id: 'linkedlist', name: 'Linked List', weight: 8, priority: 'P0', difficulty: 'core', targetProblems: 8 },
  { id: 'trees', name: 'Trees', weight: 10, priority: 'P0', difficulty: 'core', targetProblems: 14 },
  { id: 'bst', name: 'Binary Search Tree', weight: 8, priority: 'P0', difficulty: 'core', targetProblems: 6 },
  { id: 'heap', name: 'Heap & Priority Queue', weight: 8, priority: 'P0', difficulty: 'core', targetProblems: 7, note: 'Top-K and merge-K are the recurring shapes.' },
  { id: 'graphs', name: 'Graphs', weight: 10, priority: 'P0', difficulty: 'advanced', targetProblems: 14, note: 'BFS/DFS, topological sort, union-find. Heavily favoured at Amazon.' },
  { id: 'recursion', name: 'Recursion', weight: 8, priority: 'P0', difficulty: 'core', targetProblems: 6 },
  { id: 'backtracking', name: 'Backtracking', weight: 8, priority: 'P1', difficulty: 'advanced', targetProblems: 8 },
  { id: 'greedy', name: 'Greedy', weight: 7, priority: 'P1', difficulty: 'advanced', targetProblems: 7 },
  { id: 'dp1', name: '1-D Dynamic Programming', weight: 9, priority: 'P0', difficulty: 'advanced', targetProblems: 12 },
  { id: 'dp2', name: '2-D Dynamic Programming', weight: 8, priority: 'P1', difficulty: 'advanced', targetProblems: 8 },
  { id: 'intervals', name: 'Intervals', weight: 7, priority: 'P1', difficulty: 'core', targetProblems: 6 },
  { id: 'bits', name: 'Bit Manipulation', weight: 6, priority: 'P1', difficulty: 'core', targetProblems: 6 },
  { id: 'tries', name: 'Tries', weight: 6, priority: 'P2', difficulty: 'advanced', targetProblems: 4 },
] as const;

export const DSA_PATTERN_IDS: readonly string[] = DSA_PATTERNS.map((p) => p.id);

export function patternById(id: string): DsaPattern | undefined {
  return DSA_PATTERNS.find((p) => p.id === id);
}

export function patternName(id: string): string {
  return patternById(id)?.name ?? id;
}

/** One study task per pattern: learn it, then drill it to the target count. */
export const DSA_TASKS: Task[] = DSA_PATTERNS.flatMap((p): Task[] => [
  {
    id: `dsa-${p.id}-learn`,
    title: `${p.name} — learn the pattern and its invariants`,
    track: 'dsa',
    priority: p.priority,
    estMinutes: 60,
    careerValue: p.weight,
    difficulty: p.difficulty,
    proof: 'notes',
    targetRole: 'both',
    source: 'NeetCode',
    interviewCritical: true,
    portfolioCritical: false,
    optional: p.priority === 'P2',
    rationale: p.note,
  },
  {
    id: `dsa-${p.id}-drill`,
    title: `${p.name} — solve ${p.targetProblems} problems, tagged and timed`,
    track: 'dsa',
    priority: p.priority,
    estMinutes: p.targetProblems * 20,
    careerValue: p.weight,
    difficulty: p.difficulty,
    proof: 'exercise',
    targetRole: 'both',
    source: 'LeetCode',
    prereqs: [`dsa-${p.id}-learn`],
    interviewCritical: true,
    portfolioCritical: false,
    optional: p.priority === 'P2',
  },
]);

/** Timed and company-flavoured work that sits on top of the patterns. */
export const DSA_META_TASKS: Task[] = [
  {
    id: 'dsa-timed-1',
    title: 'Weekly timed set — 3 problems, no hints, solve times logged',
    track: 'dsa',
    priority: 'P0',
    estMinutes: 90,
    careerValue: 10,
    difficulty: 'core',
    proof: 'checkpoint',
    targetRole: 'both',
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale:
      'Untimed solving hides the real gap. Interviews are 35 minutes with someone watching.',
  },
  {
    id: 'dsa-amazon-1',
    title: 'Amazon-tagged set — graphs, heaps, intervals, BFS-heavy problems',
    track: 'dsa',
    priority: 'P1',
    estMinutes: 120,
    careerValue: 9,
    difficulty: 'advanced',
    proof: 'exercise',
    targetRole: 'sde',
    prereqs: ['dsa-graphs-drill', 'dsa-heap-drill'],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale:
      'Amazon loops lean toward graph and heap shapes. Treat the tag as a hint about distribution, not a guarantee of content.',
  },
  {
    id: 'dsa-google-1',
    title: 'Google-style set — harder algorithmic reasoning, fewer templates',
    track: 'dsa',
    priority: 'P1',
    estMinutes: 120,
    careerValue: 9,
    difficulty: 'advanced',
    proof: 'exercise',
    targetRole: 'sde',
    prereqs: ['dsa-dp1-drill', 'dsa-graphs-drill'],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
  },
  {
    id: 'dsa-revision-1',
    title: 'Cold re-solve loop — 5 old problems, under 20 minutes each',
    track: 'dsa',
    priority: 'P0',
    estMinutes: 100,
    careerValue: 10,
    difficulty: 'core',
    proof: 'checkpoint',
    targetRole: 'both',
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale:
      'Retention is the metric that matters, not cumulative solve count. A problem you cannot re-solve cold was never learned.',
  },
];
