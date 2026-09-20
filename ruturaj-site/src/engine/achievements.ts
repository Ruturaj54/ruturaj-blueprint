/**
 * §14 — turns a plain sentence about work into a resume-grade statement.
 *
 * Deliberately mechanical rather than generative: it restructures and upgrades
 * the verb, and it never invents a number. If no measured impact was supplied
 * the result is flagged `metricNeeded` and says so out loud, because a
 * fabricated metric is worse than a missing one — it collapses the moment an
 * interviewer asks how it was measured.
 */

export const WORK_TAGS = [
  'CI/CD',
  'Automation',
  'Python',
  'Backend',
  'Telecom',
  'Debugging',
  'Performance',
  'Ownership',
  'Documentation',
] as const;

/** Weak opener -> stronger equivalent that still claims only what was done. */
const VERB_UPGRADES: Array<[RegExp, string]> = [
  [/^worked on\s+/i, 'Delivered '],
  [/^did\s+/i, 'Executed '],
  [/^made\s+/i, 'Built '],
  [/^helped (?:with|to)?\s*/i, 'Contributed to '],
  [/^fixed\s+/i, 'Diagnosed and resolved '],
  [/^looked into\s+/i, 'Investigated '],
  [/^set ?up\s+/i, 'Designed and deployed '],
  [/^added\s+/i, 'Implemented '],
  [/^changed\s+/i, 'Refactored '],
  [/^wrote\s+/i, 'Authored '],
  [/^tested\s+/i, 'Validated '],
  [/^updated\s+/i, 'Modernised '],
  [/^debugged\s+/i, 'Root-caused '],
  [/^automated\s+/i, 'Automated '],
];

const TAG_CONTEXT: Partial<Record<(typeof WORK_TAGS)[number], string>> = {
  'CI/CD': 'across the CI/CD pipeline',
  Automation: 'through automation',
  Telecom: 'in the 4G/5G stack',
  Performance: 'improving runtime performance',
  Debugging: 'resolving a production defect',
  Ownership: 'owning the work end to end',
  Documentation: 'with documentation for the team',
};

export interface BuiltStatement {
  statement: string;
  metricNeeded: boolean;
}

export function buildStatement(
  raw: string,
  metric: string,
  tags: readonly string[],
): BuiltStatement {
  let text = raw.trim().replace(/\s+/g, ' ');
  if (!text) return { statement: '', metricNeeded: true };

  // Upgrade the opening verb, or capitalise what is already there.
  let upgraded = false;
  for (const [pattern, replacement] of VERB_UPGRADES) {
    if (pattern.test(text)) {
      text = text.replace(pattern, replacement);
      upgraded = true;
      break;
    }
  }
  if (!upgraded) text = text.charAt(0).toUpperCase() + text.slice(1);

  text = text.replace(/[.\s]+$/, '');

  // One piece of context, not a pile of keywords.
  const context = tags.map((t) => TAG_CONTEXT[t as (typeof WORK_TAGS)[number]]).find(Boolean);
  if (context && !text.toLowerCase().includes(context.split(' ')[1] ?? '')) {
    text = `${text}, ${context}`;
  }

  const cleanMetric = metric.trim().replace(/[.\s]+$/, '');
  if (cleanMetric) {
    return { statement: `${text} — ${cleanMetric}.`, metricNeeded: false };
  }

  return { statement: `${text}.`, metricNeeded: true };
}

/** §26 — the STAR skeleton, for behavioural prep. */
export function starTemplate(statement: string): string {
  return [
    'SITUATION — what was happening, and why it mattered:',
    'TASK — what you specifically owned:',
    `ACTION — ${statement}`,
    'RESULT — the measured outcome (find the real number):',
  ].join('\n\n');
}
