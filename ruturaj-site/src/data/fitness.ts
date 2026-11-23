import type { WorkoutKind } from '@/lib/schema';

/**
 * A simple, progressive routine that fits his day: a 25-minute run between
 * 08:05 and 08:30 on weekdays (a short core set three times a week), a longer
 * easy run on Saturday, recovery on Sunday. The 5 km evening walk is separate
 * and logged in today's numbers. Built for consistency and fat loss, not for a
 * race. The honest note on belly fat is in FAT_LOSS_NOTE and shown in the UI.
 */

export interface SessionPart {
  id: string;
  label: string;
  minutes: number;
  detail: string;
}

export interface Session {
  id: string;
  name: string;
  kind: WorkoutKind;
  minutes: number;
  parts: SessionPart[];
  note: string;
}

const WARM_UP: SessionPart = {
  id: 'warm',
  label: 'Warm-up',
  minutes: 3,
  detail: 'Brisk walk 1 min, then leg swings, hip circles and 10 bodyweight squats.',
};

const CORE: SessionPart = {
  id: 'core',
  label: 'Core',
  minutes: 6,
  detail: 'Plank 3×30 s · dead bug 2×10 · glute bridge 2×12. Back home or at the gate.',
};

export const SESSIONS: readonly Session[] = [
  {
    id: 'run-core',
    name: 'Easy run + core',
    kind: 'run',
    minutes: 25,
    parts: [
      WARM_UP,
      { id: 'run', label: 'Easy run', minutes: 16, detail: 'Conversational pace. New to running? Run 2 min, walk 1 min, five times.' },
      CORE,
    ],
    note: 'Add two minutes of running each week while it feels easy, taking them from the walk breaks. Never more than a 10% jump in a week.',
  },
  {
    id: 'run-easy',
    name: 'Easy run',
    kind: 'run',
    minutes: 25,
    parts: [
      WARM_UP,
      { id: 'run', label: 'Easy run or run-walk', minutes: 19, detail: 'Lighter than yesterday. Legs heavy? Walk briskly instead; it still counts.' },
      { id: 'stretch', label: 'Stretch', minutes: 3, detail: 'Calves, hamstrings, quads, hip flexors, 30 s each.' },
    ],
    note: 'The easy day is what lets the hard days happen. Do not turn it into a race.',
  },
  {
    id: 'long-run',
    name: 'Long easy run',
    kind: 'run',
    minutes: 60,
    parts: [
      { ...WARM_UP, minutes: 5 },
      { id: 'run', label: 'Long run', minutes: 40, detail: 'Slower than a weekday run. Could you talk in full sentences? That is the pace.' },
      { id: 'cool', label: 'Cool-down', minutes: 7, detail: 'Walk 3 min, then the four stretches, 40 s each.' },
      { ...CORE, minutes: 8 },
    ],
    note: 'Fuel first: a banana or two dates before you leave. Water after, not during, for runs under an hour.',
  },
  {
    id: 'recovery',
    name: 'Recovery walk + stretch',
    kind: 'walk',
    minutes: 45,
    parts: [
      { id: 'walk', label: 'Brisk walk', minutes: 30, detail: 'Outside, daylight, no agenda.' },
      { id: 'stretch', label: 'Full stretch', minutes: 15, detail: 'Every stretch from the week, held a little longer.' },
    ],
    note: 'Rest is part of the plan. Let Monday’s run feel fresh.',
  },
];

/** 0 = Sunday. */
export const WEEKLY_SESSION: Record<number, string> = {
  0: 'recovery',
  1: 'run-core',
  2: 'run-easy',
  3: 'run-core',
  4: 'run-easy',
  5: 'run-core',
  6: 'long-run',
};

export const FAT_LOSS_NOTE =
  'Core work strengthens the muscles under the belly; it does not burn the fat on top of it. Fat comes off everywhere at once when you stay in a modest calorie deficit for weeks: the morning runs, the 5 km walk, enough sleep, protein at dinner and a kitchen that closes after it do more than any abdominal exercise.';

export function sessionById(id: string): Session | undefined {
  return SESSIONS.find((s) => s.id === id);
}
