import type { Task } from '@/engine/types';
import type { PortfolioProject } from '@/data/projects/types';
import { PORTFOLIO_PROJECTS } from '@/data/projects/portfolio';
import { SHIPPED_PROJECTS } from '@/data/projects/shipped';

export type { PortfolioProject, ProjectStatus } from '@/data/projects/types';
export { milestoneId } from '@/data/projects/types';

/**
 * §13 — a small number of defensible projects, not twenty toy repos.
 *
 * Four from the roadmap that extend the professional profile that already
 * exists (Python, telecom, CI/CD), plus three shipped pieces of client work
 * that need polish and a write-up. Content lives in src/data/projects/.
 */
export const PROJECTS: readonly PortfolioProject[] = [...PORTFOLIO_PROJECTS, ...SHIPPED_PROJECTS];

export function projectById(id: string): PortfolioProject | undefined {
  return PROJECTS.find((p) => p.id === id);
}

export const PROJECT_TASKS: Task[] = [
  {
    id: 'proj-rag-ship',
    title: 'Production RAG Service — deployed, documented, defensible',
    track: 'project',
    priority: 'P0',
    estMinutes: 600,
    careerValue: 10,
    difficulty: 'advanced',
    proof: 'project',
    targetRole: 'ai-engineer',
    prereqs: ['ai-eval-1', 'ai-serve-1'],
    interviewCritical: true,
    portfolioCritical: true,
    optional: false,
    rationale: 'The single artefact most likely to carry an AI Engineer screen. Prioritise it over any additional course.',
  },
  {
    id: 'proj-agent-ship',
    title: 'AI + Backend Platform — auth, queues, agent loop, deployed',
    track: 'project',
    priority: 'P1',
    estMinutes: 600,
    careerValue: 9,
    difficulty: 'advanced',
    proof: 'project',
    targetRole: 'both',
    prereqs: ['ai-agent-1', 'be-auth-1'],
    interviewCritical: false,
    portfolioCritical: true,
    optional: false,
  },
  {
    id: 'proj-systems-ship',
    title: 'Telecom Observability Tool — the differentiator project',
    track: 'project',
    priority: 'P2',
    estMinutes: 480,
    careerValue: 8,
    difficulty: 'advanced',
    proof: 'project',
    targetRole: 'sde',
    interviewCritical: false,
    portfolioCritical: true,
    optional: false,
    rationale: 'High signal but lower urgency than the RAG service. Build it in Month 3 if the schedule holds.',
  },
  {
    id: 'proj-writeup',
    title: 'Write each project up — problem, decisions, tradeoffs, measured result',
    track: 'project',
    priority: 'P0',
    estMinutes: 180,
    careerValue: 9,
    difficulty: 'core',
    proof: 'notes',
    targetRole: 'both',
    interviewCritical: true,
    portfolioCritical: true,
    optional: false,
    rationale: 'An unexplained project is worth roughly nothing in a loop. The write-up is what makes it usable in an interview answer.',
  },
];
