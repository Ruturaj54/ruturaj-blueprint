import type { Task, TrackId } from '@/engine/types';
import { AI_TASKS } from './ai';
import { DSA_TASKS, DSA_META_TASKS } from './dsa';
import { CS_TASKS } from './cs';
import { BACKEND_TASKS } from './backend';
import { JAVA_TASKS, REACT_TASKS } from './java-react';
import { PROJECT_TASKS } from './projects';

/** Every advanced-phase task, flattened. Foundation work lives separately. */
export const ALL_TASKS: readonly Task[] = [
  ...AI_TASKS,
  ...DSA_TASKS,
  ...DSA_META_TASKS,
  ...CS_TASKS,
  ...BACKEND_TASKS,
  ...JAVA_TASKS,
  ...REACT_TASKS,
  ...PROJECT_TASKS,
];

const byId = new Map(ALL_TASKS.map((t) => [t.id, t]));

export function taskById(id: string): Task | undefined {
  return byId.get(id);
}

export function tasksForTrack(track: TrackId): Task[] {
  return ALL_TASKS.filter((t) => t.track === track);
}

export const TRACK_META: Record<TrackId, { name: string; blurb: string }> = {
  ai: { name: 'AI Engineering', blurb: 'The target specialisation.' },
  dsa: { name: 'DSA', blurb: 'Daily, never paused.' },
  cs: { name: 'Core CS', blurb: 'OS, networking, DBMS, system design.' },
  backend: { name: 'Python Backend', blurb: 'Production shape, not framework tours.' },
  java: { name: 'Java', blurb: 'Interview optionality only.' },
  react: { name: 'React', blurb: 'Maintenance level.' },
  systems: { name: 'Systems', blurb: 'Linux, C/C++, concurrency.' },
  devops: { name: 'DevOps', blurb: 'Building on existing Jenkins ownership.' },
  telecom: { name: 'Telecom', blurb: 'Secondary specialisation and differentiator.' },
  project: { name: 'Projects', blurb: 'Few, finished, explainable.' },
  work: { name: 'Current Job', blurb: 'Performance at Parallel Wireless.' },
};

export { AI_TASKS, DSA_TASKS, DSA_META_TASKS, CS_TASKS, BACKEND_TASKS, JAVA_TASKS, REACT_TASKS, PROJECT_TASKS };
export { PROJECTS } from './projects';
export { DSA_PATTERNS, patternById, patternName, DSA_PATTERN_IDS } from './dsa';
