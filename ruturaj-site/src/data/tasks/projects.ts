import type { Task } from '@/engine/types';

export interface PortfolioProject {
  id: string;
  name: string;
  tagline: string;
  /** Why this project and not a different one. */
  why: string;
  stack: string[];
  /** The one thing an interviewer should walk away remembering. */
  headline: string;
  taskIds: string[];
}

/**
 * §13 — a small number of defensible projects, not twenty toy repos.
 *
 * Each one is chosen to extend the professional profile that already exists
 * (Python, telecom, CI/CD) rather than to demonstrate a framework in isolation.
 */
export const PROJECTS: readonly PortfolioProject[] = [
  {
    id: 'proj-blueprint',
    name: 'Ruturaj Blueprint',
    tagline: 'This application — a career execution system with real accountability.',
    why: 'Already built, already deployed, already used daily. A project someone actually uses beats a tutorial clone, and it demonstrates product judgement rather than framework familiarity.',
    stack: ['React', 'TypeScript', 'Vite', 'Netlify Functions', 'Netlify Blobs'],
    headline: 'Scheduled server-side jobs that read real user state and send personalised accountability mail.',
    taskIds: [],
  },
  {
    id: 'proj-rag',
    name: 'Production RAG Service',
    tagline: 'A retrieval system with measured quality, not a demo.',
    why: 'The flagship. Almost every AI Engineer job description maps onto this project, and the evaluation harness is what makes it credible rather than derivative.',
    stack: ['FastAPI', 'PostgreSQL + pgvector', 'Redis', 'Docker', 'LLM API'],
    headline: 'Hybrid retrieval with reranking, and a measured hit-rate that improved from a stated baseline.',
    taskIds: ['ai-vector-1', 'ai-retrieval-1', 'ai-rerank-1', 'ai-eval-1', 'ai-eval-2', 'ai-serve-1', 'ai-serve-2'],
  },
  {
    id: 'proj-agent',
    name: 'AI + Backend Platform',
    tagline: 'Auth, APIs, queues and an agent loop in one deployable system.',
    why: 'Proves the combination the target role actually wants: an AI engineer who can also build the service around the model. Reuses the backend track directly.',
    stack: ['Django/DRF or FastAPI', 'PostgreSQL', 'Redis', 'Celery', 'Docker'],
    headline: 'An agent with tool calling, persistent memory and a regression suite that gates deploys.',
    taskIds: ['be-auth-1', 'be-celery-1', 'be-redis-1', 'ai-agent-1', 'ai-agent-2', 'ai-agent-3', 'be-docker-1'],
  },
  {
    id: 'proj-systems',
    name: 'Telecom Observability Tool',
    tagline: 'Systems and CI/CD depth applied to the domain you already know.',
    why: 'The differentiator no generic AI candidate can copy. Turns two years of 4G/5G and Jenkins work into something reviewable, and gives every interview a story nobody else in the pipeline has.',
    stack: ['Python', 'C/C++', 'Linux', 'Jenkins', 'Metrics pipeline'],
    headline: 'Telecom log and metric analysis with alerting, built on real domain knowledge.',
    taskIds: ['cs-net-1', 'cs-os-3', 'be-deploy-1'],
  },
] as const;

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
