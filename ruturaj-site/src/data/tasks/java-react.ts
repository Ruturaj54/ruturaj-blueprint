import type { Task } from '@/engine/types';

/**
 * Track D — Java. Deliberately narrow.
 *
 * Java exists here for SDE interview optionality, not as a second career. It is
 * capped at interview depth so it cannot crowd out AI or DSA time.
 */
export const JAVA_TASKS: Task[] = [
  {
    id: 'java-1',
    title: 'Java syntax, OOP and collections — refresh to fluency',
    track: 'java',
    priority: 'P2',
    estMinutes: 120,
    careerValue: 6,
    difficulty: 'core',
    proof: 'exercise',
    targetRole: 'sde',
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
    rationale: 'Amazon and Microsoft accept Python, so Java is optionality rather than a requirement. Kept at P2 on purpose.',
  },
  {
    id: 'java-2',
    title: 'Generics, exceptions, streams and lambdas',
    track: 'java',
    priority: 'P2',
    estMinutes: 90,
    careerValue: 5,
    difficulty: 'core',
    proof: 'exercise',
    targetRole: 'sde',
    prereqs: ['java-1'],
    interviewCritical: false,
    portfolioCritical: false,
    optional: false,
  },
  {
    id: 'java-3',
    title: 'Concurrency and JVM basics — threads, executors, heap vs stack, GC',
    track: 'java',
    priority: 'P2',
    estMinutes: 120,
    careerValue: 6,
    difficulty: 'advanced',
    proof: 'notes',
    targetRole: 'sde',
    prereqs: ['java-2'],
    interviewCritical: true,
    portfolioCritical: false,
    optional: false,
  },
  {
    id: 'java-4',
    title: 'Spring Boot — DI, REST controllers, JPA basics, one working service',
    track: 'java',
    priority: 'P3',
    estMinutes: 180,
    careerValue: 5,
    difficulty: 'core',
    proof: 'project',
    targetRole: 'sde',
    prereqs: ['java-3'],
    interviewCritical: false,
    portfolioCritical: false,
    optional: true,
    rationale: 'Only worth the time if a specific target role asks for Java. Otherwise the hours belong to AI.',
  },
];

/**
 * Track E — React. Maintenance only.
 *
 * Capped at P2/P3 so frontend cannot consume preparation time that belongs to
 * DSA, AI or backend.
 */
export const REACT_TASKS: Task[] = [
  {
    id: 'react-1',
    title: 'Modern React — hooks, effects, state patterns, when to reach for context',
    track: 'react',
    priority: 'P2',
    estMinutes: 90,
    careerValue: 5,
    difficulty: 'core',
    proof: 'implement',
    targetRole: 'both',
    interviewCritical: false,
    portfolioCritical: true,
    optional: false,
    rationale: 'Enough to keep full-stack claims defensible on the resume. Not an interview focus for AI roles.',
  },
  {
    id: 'react-2',
    title: 'API integration, forms, auth flows, error and loading states',
    track: 'react',
    priority: 'P2',
    estMinutes: 90,
    careerValue: 5,
    difficulty: 'core',
    proof: 'implement',
    targetRole: 'both',
    prereqs: ['react-1'],
    interviewCritical: false,
    portfolioCritical: true,
    optional: false,
  },
  {
    id: 'react-3',
    title: 'Performance — memoisation, list virtualisation, bundle size',
    track: 'react',
    priority: 'P3',
    estMinutes: 75,
    careerValue: 4,
    difficulty: 'advanced',
    proof: 'notes',
    targetRole: 'both',
    prereqs: ['react-2'],
    interviewCritical: false,
    portfolioCritical: false,
    optional: true,
  },
];
