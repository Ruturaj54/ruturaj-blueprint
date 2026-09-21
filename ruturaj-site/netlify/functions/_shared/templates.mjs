// §19 and §20 — the two daily mails, built from the digest.

import {
  SITE_URL,
  layout,
  section,
  numberedList,
  statRow,
  callout,
  paragraph,
  COLORS as C,
} from './mail.mjs';
import {
  morningSubject,
  eveningSubject,
  morningChallenge,
  recognition,
  recoveryPlan,
  tomorrowMission,
} from './voice.mjs';

const line = (s) => `${s}\n`;

/* ---------- morning ------------------------------------------------------- */

export function buildMorning(d) {
  const praise = recognition(d);
  const challenge = morningChallenge(d);

  const body = [
    section(
      "Today's mission",
      `${paragraph(
        d.gate.open
          ? 'Advanced Mode is open. These are the highest-value items the priority engine can see right now.'
          : `Foundation Gate: ${d.gate.done} of ${d.gate.total} mandatory milestones. Nothing new gets added until it closes.`,
      )}<div style="height:12px"></div>${numberedList(d.missions)}`,
    ),

    section(
      'DSA target',
      `${paragraph(
        `${d.dsa.target} problems today${d.dsa.weakest ? ` — start with ${d.dsa.weakest}, your thinnest pattern.` : '.'}`,
      )}<div style="height:12px"></div>${statRow([
        { label: 'Logged', value: d.dsa.total },
        {
          label: 'Clean',
          value: d.dsa.total ? `${d.dsa.accuracy}%` : '—',
          tone: d.dsa.accuracy >= 70 ? C.success : C.fg,
        },
        {
          label: 'Streak',
          value: d.dsa.streak,
          tone: d.dsa.streak > 0 ? C.accent : C.faint,
        },
      ])}`,
    ),

    section(
      'Work priority',
      paragraph(
        'Office hours belong to Parallel Wireless. Use spare capacity for reading or revision only — and log anything worth putting on a resume in the Work tab.',
      ),
    ),

    section(
      'Fitness',
      paragraph(
        'Morning run before the day starts. If last night ran long, take the distance down rather than skipping — recovery is part of the plan, not a reward for finishing it.',
      ),
    ),

    praise ? section('Worth naming', callout(praise, C.success)) : '',
    section('The challenge', callout(challenge, C.accent)),

    section(
      'Progress',
      statRow([
        { label: 'Days left', value: d.daysLeft, tone: C.accent },
        { label: 'Gate', value: `${d.gate.pct}%` },
        { label: 'Work logged', value: d.workCount },
      ]),
    ),
  ].join('');

  const text = [
    line(`GOOD MORNING RUTURAJ — Day ${d.day} of 161`),
    line(`${d.phase.label} ${d.phase.title} · ${d.daysLeft} days to 28 Feb 2027`),
    line(''),
    line("TODAY'S MISSION"),
    ...d.missions.map((m, i) => line(`  ${i + 1}. ${m.title}${m.context ? ` (${m.context})` : ''}`)),
    line(''),
    line(`DSA TARGET: ${d.dsa.target} problems${d.dsa.weakest ? ` — start with ${d.dsa.weakest}` : ''}`),
    line(`  ${d.dsa.total} logged · ${d.dsa.accuracy}% clean · ${d.dsa.streak}-day streak`),
    line(''),
    praise ? line(`WORTH NAMING: ${praise}`) : '',
    line(`THE CHALLENGE: ${challenge}`),
    line(''),
    line(`Gate ${d.gate.pct}% · ${d.daysLeft} days remaining`),
    line(''),
    line(`Open today's plan: ${SITE_URL}/#/today`),
  ].join('');

  return {
    subject: morningSubject(d),
    html: layout({
      kicker: 'Good morning, Ruturaj',
      day: d.day,
      daysLeft: d.daysLeft,
      phase: `${d.phase.label} · ${d.phase.title}`,
      body,
    }),
    text,
  };
}

/* ---------- evening ------------------------------------------------------- */

export function buildEvening(d) {
  const t = d.todayLog;
  const recovery = recoveryPlan(d);
  const tomorrow = tomorrowMission(d);
  const praise = recognition(d);

  const questions = [
    `Did you complete today's DSA? (${d.dsa.todayCount} of ${d.dsa.target} logged)`,
    `Did you complete today's AI learning?`,
    `Did you hit your course target?`,
    `Did you deliver your work priority at Parallel Wireless?`,
    `Did you run? (${d.runsToday.length ? d.runsToday.join(', ') : 'nothing logged'})`,
    `Did you use the spare hours at work, or did they disappear?`,
    `What blocked you?`,
  ];

  const body = [
    section(
      'Planned vs actual',
      t && t.score !== null
        ? `${statRow([
            {
              label: 'Day score',
              value: `${t.score}%`,
              tone: t.score >= 70 ? C.success : t.score >= 40 ? C.accent : C.danger,
            },
            { label: 'Closed', value: `${t.completed}/${t.planned}` },
            { label: 'Focus min', value: d.focusToday },
          ])}${
            t.missed.length
              ? `<div style="height:14px"></div>${paragraph(`Still open: ${t.missed.join(' · ')}`)}`
              : ''
          }`
        : paragraph(
            'Today was never started in the app, so there is nothing to measure it against. That is the first thing to fix tomorrow.',
          ),
    ),

    section(
      'Answer honestly',
      questions
        .map(
          (q) =>
            `<p style="margin:0 0 7px;font:400 14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.muted};">— ${q}</p>`,
        )
        .join(''),
    ),

    section(
      'Consistency',
      statRow([
        { label: 'DSA streak', value: d.dsa.streak, tone: d.dsa.streak > 0 ? C.accent : C.faint },
        { label: 'Problems', value: d.dsa.total },
        { label: 'Days left', value: d.daysLeft, tone: C.accent },
      ]),
    ),

    praise ? section('Worth naming', callout(praise, C.success)) : '',
    recovery ? section('Recovery plan', callout(recovery, C.danger)) : '',

    section("Tomorrow's mission", callout(tomorrow, C.accent)),
  ].join('');

  const text = [
    line(`RUTURAJ — DAILY ACCOUNTABILITY — Day ${d.day} of 161`),
    line(''),
    t && t.score !== null
      ? line(`PLANNED VS ACTUAL: ${t.completed}/${t.planned} closed — ${t.score}%`)
      : line('PLANNED VS ACTUAL: today was never started in the app.'),
    t && t.missed.length ? line(`  Still open: ${t.missed.join(' · ')}`) : '',
    line(`  Focused minutes: ${d.focusToday}`),
    line(''),
    line('ANSWER HONESTLY'),
    ...questions.map((q) => line(`  - ${q}`)),
    line(''),
    line(`DSA streak ${d.dsa.streak} · ${d.dsa.total} problems · ${d.daysLeft} days left`),
    line(''),
    recovery ? line(`RECOVERY: ${recovery}`) : '',
    line(`TOMORROW'S MISSION: ${tomorrow}`),
    line(''),
    line(`Log it: ${SITE_URL}/#/today`),
  ].join('');

  return {
    subject: eveningSubject(d),
    html: layout({
      kicker: 'Daily accountability',
      day: d.day,
      daysLeft: d.daysLeft,
      phase: `${d.phase.label} · ${d.phase.title}`,
      body,
    }),
    text,
  };
}
