import type { AppState } from '@/lib/schema';
import type { ProofType, SkillProgress, TrackId } from './types';
import { ALL_TASKS } from '@/data/tasks';
import { allSubjectProgress } from './foundation';
import { dsaTotals, patternStats } from './dsa';

/**
 * §22 — readiness, split four ways.
 *
 * The old app computed "watched 80% of videos = 80% skill". That number feels
 * good and predicts nothing. Here a proof type decides which dimension a
 * completed task credits, so learning can be at 90% while demonstration sits
 * at 30% — which is the honest and much more useful picture.
 */

const PROOF_DIMENSION: Record<ProofType, keyof SkillProgress> = {
  watch: 'learning',
  notes: 'learning',
  implement: 'practice',
  exercise: 'practice',
  project: 'demonstration',
  checkpoint: 'interview',
};

export interface TrackReadiness {
  track: TrackId;
  progress: SkillProgress;
  /** Weighted headline number, demonstration- and interview-heavy. */
  overall: number;
  done: number;
  total: number;
}

function emptyProgress(): SkillProgress {
  return { learning: 0, practice: 0, demonstration: 0, interview: 0 };
}

export function trackReadiness(state: AppState, track: TrackId): TrackReadiness {
  const tasks = ALL_TASKS.filter((t) => t.track === track);

  const totals = emptyProgress();
  const dones = emptyProgress();

  for (const t of tasks) {
    const dim = PROOF_DIMENSION[t.proof];
    totals[dim] += 1;
    if (state.tasks[t.id]?.status === 'done') dones[dim] += 1;
  }

  const pct = (dim: keyof SkillProgress): number =>
    totals[dim] === 0 ? 0 : Math.round((dones[dim] / totals[dim]) * 100);

  const progress: SkillProgress = {
    learning: pct('learning'),
    practice: pct('practice'),
    demonstration: pct('demonstration'),
    interview: pct('interview'),
  };

  // Weighted so watching cannot inflate the headline: what you can demonstrate
  // and defend counts for more than what you have read.
  const overall = Math.round(
    progress.learning * 0.2 +
      progress.practice * 0.3 +
      progress.demonstration * 0.25 +
      progress.interview * 0.25,
  );

  return {
    track,
    progress,
    overall,
    done: tasks.filter((t) => state.tasks[t.id]?.status === 'done').length,
    total: tasks.length,
  };
}

export const READINESS_TRACKS: readonly TrackId[] = [
  'ai',
  'dsa',
  'cs',
  'backend',
  'java',
  'react',
  'systems',
  'project',
];

export function allTrackReadiness(state: AppState): TrackReadiness[] {
  return READINESS_TRACKS.map((t) => trackReadiness(state, t));
}

export interface InterviewReadiness {
  overall: number;
  dsa: number;
  systemDesign: number;
  ai: number;
  fundamentals: number;
  projects: number;
  /** The weakest component, named — this is what to work on. */
  weakest: string;
}

/**
 * A single interview-readiness number, built from the things that actually get
 * tested rather than from course completion.
 */
export function interviewReadiness(state: AppState): InterviewReadiness {
  const totals = dsaTotals(state);
  const patterns = patternStats(state);

  // DSA readiness: half coverage across patterns, half clean-solve accuracy.
  const avgCoverage =
    patterns.reduce((s, p) => s + p.coverage, 0) / Math.max(1, patterns.length);
  const dsa = Math.round((avgCoverage * 0.5 + totals.accuracy * 0.5) * 100);

  const sdTasks = ALL_TASKS.filter((t) => t.id.startsWith('cs-sd-'));
  const systemDesign = Math.round(
    (sdTasks.filter((t) => state.tasks[t.id]?.status === 'done').length /
      Math.max(1, sdTasks.length)) *
      100,
  );

  const ai = trackReadiness(state, 'ai').overall;

  const fundamentalTasks = ALL_TASKS.filter(
    (t) => t.track === 'cs' && !t.id.startsWith('cs-sd-'),
  );
  const fundamentals = Math.round(
    (fundamentalTasks.filter((t) => state.tasks[t.id]?.status === 'done').length /
      Math.max(1, fundamentalTasks.length)) *
      100,
  );

  const projects = trackReadiness(state, 'project').overall;

  const parts: Array<[string, number, number]> = [
    ['DSA', dsa, 0.3],
    ['System design', systemDesign, 0.2],
    ['AI engineering', ai, 0.25],
    ['CS fundamentals', fundamentals, 0.15],
    ['Projects', projects, 0.1],
  ];

  const overall = Math.round(parts.reduce((s, [, v, w]) => s + v * w, 0));
  const weakest = parts.reduce((min, p) => (p[1] < min[1] ? p : min))[0];

  return { overall, dsa, systemDesign, ai, fundamentals, projects, weakest };
}

/** Foundation-phase readiness, used before the gate opens. */
export function foundationReadiness(state: AppState): number {
  const progress = allSubjectProgress(state);
  const done = progress.reduce((s, p) => s + p.done, 0);
  const total = progress.reduce((s, p) => s + p.total, 0);
  return total === 0 ? 0 : Math.round((done / total) * 100);
}
