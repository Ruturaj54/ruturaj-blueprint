import type { Task } from '@/engine/types';

/**
 * When each task becomes appropriate.
 *
 * Anything not listed is available from phase 2 — that is the default and
 * covers most learning work. These overrides carry the things that only make
 * sense once the groundwork exists, so the roadmap actually sequences instead
 * of front-loading everything into month 2.
 */
const PHASE_OVERRIDES: Record<string, 'm3' | 'm4'> = {
  // ---- phase 3: interview-level work, once the fundamentals are in ----
  'cs-sd-2': 'm3',
  'cs-sd-3': 'm3',
  'cs-sd-4': 'm3',
  'cs-sd-5': 'm3',
  'cs-sd-6': 'm3',
  'cs-sd-7': 'm3',
  'ai-sd-1': 'm3',
  'ops-sysdes-ai-1': 'm3',
  'dsa-timed-1': 'm3',
  'dsa-revision-1': 'm3',
  'cs-oop-2': 'm3',
  // Flagship projects ship in phase 3 — they need the phase-2 skills first.
  'proj-rag-ship': 'm3',
  'proj-agent-ship': 'm3',
  'proj-systems-ship': 'm3',
  // Java is interview optionality; it should never precede AI or DSA work.
  'java-1': 'm3',
  'java-2': 'm3',
  'java-3': 'm3',
  'java-4': 'm3',
  // Advanced LLMOps depth, once serving and evaluation exist.
  'ops-llmops-3': 'm3',
  'ops-ft-1': 'm3',
  'ops-ft-2': 'm3',

  // ---- phase 4: execution only ----
  'dsa-amazon-1': 'm4',
  'dsa-google-1': 'm4',
  'proj-writeup': 'm4',
  'tel-story-1': 'm4',
};

/** Stamps the phase onto a task list. Applied once, in the catalog index. */
export function withPhasing(tasks: Task[]): Task[] {
  return tasks.map((t) => {
    const phase = PHASE_OVERRIDES[t.id];
    return phase ? { ...t, earliestPhase: phase } : { ...t, earliestPhase: 'm2' as const };
  });
}
