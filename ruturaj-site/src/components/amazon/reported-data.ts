/**
 * The tracker's rounds copy, verbatim from docs/source/Amazon_SDE1_Prep_Tracker.html
 * (the "How the loop runs" section), with the
 * report ids that back each line. Candidate-reported, not official.
 */

export interface Reported {
  text: string;
  src: readonly string[];
}

export interface ReportedRound extends Reported {
  n: number;
  name: string;
}

export const REPORTED = {
  title: 'How the loop runs',
  sub: 'Four rounds, about an hour each',
  note: 'What 2025–26 SDE-1 candidates described. Leadership Principles come up in every round.',
} as const;

export const REPORTED_ROUNDS: readonly ReportedRound[] = [
  {
    n: 1,
    name: 'DSA',
    text: '1–2 problems, medium to hard, then 1–2 LP questions. You state the complexity and dry-run your code out loud. Some 2026 loops also asked low-level design concepts here.',
    src: ['lc7724048', 'lc8542365', 'lc8546875'],
  },
  {
    n: 2,
    name: 'DSA + project',
    text: '10–15 minutes on a project you owned, 1–2 problems, then up to 5 LP questions.',
    src: ['lc8014509', 'lc8029194', 'lc8542365'],
  },
  {
    n: 3,
    name: 'Hiring manager / GenAI',
    text: '15–30 minutes on how you use GenAI and check AI-written code, sometimes a live incident scenario, then a DSA problem or a design question such as “schedule processes”.',
    src: ['lc8014509', 'lc8029194', 'lc7621408', 'lc7724048'],
  },
  {
    n: 4,
    name: 'Bar Raiser',
    text: '3–5 LP questions with deep follow-ups on your exact contribution, decisions, metrics and trade-offs. Usually no coding, but one 2026 Bar Raiser added a 30-minute monotonic-stack problem.',
    src: ['lc7724048', 'lc8542365', 'lc6393977', 'lc7621408'],
  },
];

export const INTERVIEWERS_CHECKED: readonly Reported[] = [
  { text: 'Brute force first, then the optimisation, trade-offs, edge cases and complexity.', src: ['lc8343668'] },
  { text: 'Problems are often wrapped in a story. Strip the story away and name the pattern first.', src: ['lc7154883'] },
  {
    text: 'Some wanted you to think out loud; one asked for the full code before any explanation. Ask which they prefer.',
    src: ['lc7035289'],
  },
  {
    text: 'Follow-ups on every LP answer: what exactly you did, the numbers, and how you knew your approach would work.',
    src: ['lc8542365', 'lc6393977'],
  },
];

export const TIMING: readonly Reported[] = [
  {
    text: 'From the online assessment to the first interview: about 2 weeks to 3 months in 2026 reports.',
    src: ['lc8029194', 'roundz', 'lc8343668'],
  },
  {
    text: 'Rounds 1–3 were sometimes on the same day; the Bar Raiser often came later, by video, and was rescheduled more than once in one loop.',
    src: ['lc8014509', 'lc8542365'],
  },
  { text: 'Offers came 4 days to about 6 weeks after the last round.', src: ['lc8343668', 'lc8546875', 'lc6738470'] },
];

export const PRACTICE_RULES: readonly string[] = [
  'Restate the problem and ask about input size, edge cases and constraints.',
  'Say the brute force and its complexity, then improve it step by step.',
  'Explain the final approach before you code, and use clear variable names.',
  'Dry-run one example out loud, line by line.',
  'State the time and space complexity and the trade-offs, then expect a follow-up.',
  'If you only solved it because you remembered it, re-solve it from scratch 3 days later.',
];
