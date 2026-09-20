/**
 * §24 — target companies.
 *
 * Interview processes change, vary by team, level and location, and are not
 * published contracts. Every entry therefore carries an explicit caveat, and
 * nothing here is stated as a guaranteed requirement. Treat these as the shape
 * to prepare for, and confirm specifics with the recruiter for the actual loop.
 */

export interface TargetCompany {
  id: string;
  name: string;
  emphasis: string;
  stages: string[];
  caveat: string;
}

export const TARGET_COMPANIES: readonly TargetCompany[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    emphasis:
      'Data structures and algorithms under time, plus behavioural depth. Amazon publishes its Leadership Principles and weights them heavily, so prepared STAR stories carry real signal here — your telecom debugging and CI/CD ownership are the raw material.',
    stages: ['Online assessment', 'Coding rounds', 'Behavioural (LPs)', 'System design', 'Bar raiser'],
    caveat:
      'Loop composition varies by level and org. System design weight increases with level; confirm with your recruiter.',
  },
  {
    id: 'google',
    name: 'Google',
    emphasis:
      'Algorithmic reasoning over memorised templates — expect problems where the pattern is not obvious and your thinking out loud is being assessed. CS fundamentals get probed properly.',
    stages: ['Phone screen', 'Coding rounds', 'System design', 'Googleyness', 'Hiring committee'],
    caveat:
      'Team matching happens after the loop and can take time. Role-specific requirements differ significantly between SWE and ML/AI tracks.',
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    emphasis:
      'Coding plus practical design, often closer to real engineering problems than pure puzzles. Teams vary widely in emphasis, and there is usually more conversation about past work.',
    stages: ['Screen', 'Coding rounds', 'Design', 'As-appropriate / hiring manager'],
    caveat: 'Process differs substantially between teams and between India and other locations.',
  },
  {
    id: 'ai-companies',
    name: 'AI-first companies and AI infrastructure',
    emphasis:
      'The track your specialisation targets. Expect applied depth — retrieval quality, evaluation, serving, cost and latency — rather than only algorithmic puzzles. A deployed RAG system with measured numbers is the strongest single artefact you can bring.',
    stages: ['Screen', 'Applied AI / coding', 'System design for AI', 'Project deep dive'],
    caveat:
      'Highly variable. Smaller companies often weight the portfolio and the deep dive far more than DSA.',
  },
  {
    id: 'product',
    name: 'Strong product companies',
    emphasis:
      'Broadly the same shape: DSA, core CS, system design, and depth on what you claim on your resume. Your Python/Django/CI-CD background maps cleanly onto backend roles here.',
    stages: ['Screen', 'Coding', 'System design', 'Hiring manager'],
    caveat: 'Ranges from startup-informal to structured loops. Ask what the process is before preparing for it.',
  },
] as const;
