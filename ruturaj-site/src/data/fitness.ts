import type { WorkoutKind } from '@/lib/schema';

/**
 * A simple, progressive routine: run most mornings, a short strength set
 * three times a week, a longer easy run on Saturday, recovery on Sunday.
 * Built for consistency, not for a race. The honest note on belly fat is in
 * FAT_LOSS_NOTE and shown in the UI, because crunches do not burn it.
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
  minutes: 5,
  detail: 'Brisk walk 2 min, then leg swings, hip circles, ankle rolls, 10 bodyweight squats.',
};

const COOL_DOWN: SessionPart = {
  id: 'cool',
  label: 'Cool-down',
  minutes: 5,
  detail: 'Walk 2 min, then 30 s each: calves, hamstrings, quads, hip flexors.',
};

const STRENGTH: SessionPart = {
  id: 'strength',
  label: 'Strength set',
  minutes: 12,
  detail: 'Squats 2×12 · push-ups 2×8 (incline if needed) · glute bridge 2×12 · plank 2×30 s · dead bug 2×10.',
};

const CORE_SHORT: SessionPart = {
  id: 'core',
  label: 'Core',
  minutes: 8,
  detail: 'Plank 3×30 s · side plank 2×20 s each · crunches 2×15 · bird dog 2×10.',
};

export const SESSIONS: readonly Session[] = [
  {
    id: 'run-core',
    name: 'Run + strength',
    kind: 'run',
    minutes: 47,
    parts: [
      WARM_UP,
      { id: 'run', label: 'Easy run', minutes: 25, detail: 'Conversational pace. New to running? Run 3 min, walk 1 min, six times.' },
      COOL_DOWN,
      STRENGTH,
    ],
    note: 'Add 5 minutes to the run each week until it reaches 40. Never more than a 10% jump in a week.',
  },
  {
    id: 'run-easy',
    name: 'Easy run + mobility',
    kind: 'run',
    minutes: 38,
    parts: [
      WARM_UP,
      { id: 'run', label: 'Easy run or run-walk', minutes: 20, detail: 'Shorter and lighter than yesterday. Legs heavy? Walk briskly instead.' },
      COOL_DOWN,
      { id: 'mobility', label: 'Mobility', minutes: 8, detail: 'Hip flexor stretch, couch stretch, calf wall stretch, thoracic rotations.' },
    ],
    note: 'The easy day is what lets the hard days happen. Do not turn it into a race.',
  },
  {
    id: 'long-run',
    name: 'Long easy run',
    kind: 'run',
    minutes: 60,
    parts: [
      WARM_UP,
      { id: 'run', label: 'Long run', minutes: 40, detail: 'Slower than a weekday run. Could you talk in full sentences? That is the pace.' },
      { id: 'cool', label: 'Cool-down', minutes: 7, detail: 'Walk 3 min, then the same four stretches, 40 s each.' },
      CORE_SHORT,
    ],
    note: 'Fuel first: a banana or two dates before you leave. Water after, not during, for runs under an hour.',
  },
  {
    id: 'recovery',
    name: 'Recovery walk + stretch',
    kind: 'walk',
    minutes: 35,
    parts: [
      { id: 'walk', label: 'Brisk walk', minutes: 25, detail: 'Outside, daylight, no agenda.' },
      { id: 'stretch', label: 'Full stretch', minutes: 10, detail: 'Every stretch from the week, held a little longer.' },
    ],
    note: 'Rest is part of the plan. Sleep in, and let Monday’s run feel fresh.',
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
  'Core work strengthens the muscles under the belly; it does not burn the fat on top of it. Fat comes off everywhere at once when you stay in a modest calorie deficit for weeks: the runs, the walk, enough sleep and not eating during the night block do more than any abdominal exercise.';

export function sessionById(id: string): Session | undefined {
  return SESSIONS.find((s) => s.id === id);
}
