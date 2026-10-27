/**
 * One portfolio project: either still to be built from the roadmap, or
 * shipped work that needs polish and a write-up before it can carry an
 * interview answer. Anything unmeasured is written as "Metric needed".
 */
export type ProjectStatus = 'planned' | 'shipped';

export interface PortfolioProject {
  id: string;
  name: string;
  tagline: string;
  status: ProjectStatus;
  /** Why this project and not a different one. */
  why: string;
  stack: string[];
  /** The one thing an interviewer should walk away remembering. */
  headline: string;
  /** Advanced-track task ids this project depends on; may be empty. */
  taskIds: string[];
  problem: string;
  architecture: string;
  /** Ticked in state.tasks under milestoneId(); see ProjectMilestones. */
  milestones: string[];
  testing: string;
  deployment: string;
  /** The checkable condition for calling it done. */
  success: string;
  /** What to be able to explain in an interview. */
  explain: string;
}

/** Milestone ids read like proj-rag-m1: stable, readable, safe as state.tasks keys. */
export function milestoneId(projectId: string, index: number): string {
  return `${projectId}-m${index + 1}`;
}
