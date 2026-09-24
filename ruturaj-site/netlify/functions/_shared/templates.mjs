// §19 and §20 — the two daily mails, built from the digest.

import { formatHM } from './schedule.mjs';
import { morningQuote, eveningQuote } from './quotes.mjs';
import { quoteHtml, unlockHtml, scheduleHtml, praiseHtml } from './blocks.mjs';
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

  const q = morningQuote(d.day, d.phase.id);

  const body = [
    section('', quoteHtml(q)),

    section(
      "Today's mission",
      `${paragraph(
        (d.carriedCount > 0
          ? `${d.carriedCount} ${d.carriedCount === 1 ? 'item was' : 'items were'} planned earlier and not finished — ${d.carriedCount === 1 ? 'it comes' : 'they come'} first. `
          : '') +
          (d.gate.open
            ? 'Advanced Mode is open. These are the highest-value items the priority engine can see right now.'
            : `Foundation Gate: ${d.gate.done} of ${d.gate.total} mandatory milestones.`),
      )}<div style="height:12px"></div>${numberedList(d.missions.map(withCarry))}`,
    ),

    section('Your day', scheduleHtml(d)),

    section('', unlockHtml(d)),

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
    line(`${d.phase.label} ${d.phase.title} · ${d.daysLeft} days to 2 Mar 2027`),
    line(''),
    line(`"${q.line}"`),
    line(''),
    line("TODAY'S MISSION"),
    ...d.missions.map((m, i) =>
      line(`  ${i + 1}. ${m.title}${m.context ? ` (${m.context})` : ''}${m.carriedFrom ? ' — carried over' : ''}`),
    ),
    line(''),
    line('YOUR DAY'),
    ...d.schedule.slots
      .filter((s) => s.items.length > 0 || s.id === 'run')
      .flatMap((s) => [
        line(`  ${s.start}-${s.end}  ${s.label}`),
        ...s.items.map((i) =>
          line(
            `      - ${i.title} (${i.partial && i.totalMinutes ? `${formatHM(i.minutes)} of ${formatHM(i.totalMinutes)}` : formatHM(i.minutes)})${i.carried ? ' — carried over' : ''}`,
          ),
        ),
      ]),
    d.schedule.overflow.length
      ? line(`  CONTINUES TOMORROW: ${d.schedule.overflow.map((i) => `${i.title} (${formatHM(i.minutes)} left)`).join(' · ')}`)
      : '',
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

/** Tags carried-over missions so the numbered list shows why they are first. */
function withCarry(m) {
  return m.carriedFrom ? { ...m, context: `${m.context} · carried over` } : m;
}

/* ---------- evening ------------------------------------------------------- */

export function buildEvening(d) {
  const t = d.todayLog;
  const recovery = recoveryPlan(d);
  const tomorrow = tomorrowMission(d);
  const praise = recognition(d);

  // Sent at 02:30, after the night block, so the day being reported is complete.
  const questions = [
    `Did you complete today's DSA? (${d.dsa.todayCount} of ${d.dsa.target} logged)`,
    `Did you complete today's AI learning?`,
    `Did you hit your course target?`,
    `Did you deliver your work priority at Parallel Wireless?`,
    `Did you run? (${d.runsToday.length ? d.runsToday.join(', ') : 'nothing logged'})`,
    `Did you use the spare hours at work, or did they disappear?`,
    `What blocked you?`,
  ];

  const eq = eveningQuote(t?.score ?? null);

  const body = [
    section(
      'Planned vs actual',
      t && t.score !== null
        ? `${statRow([
            {
              label: 'Of your plan',
              value: `${t.score}%`,
              tone: t.score >= 70 ? C.success : t.score >= 40 ? C.accent : C.danger,
            },
            { label: 'Planned', value: `${t.completed}/${t.planned}` },
            { label: 'Extra', value: t.extras ?? 0, tone: (t.extras ?? 0) > 0 ? C.success : C.fg },
            { label: 'Focus min', value: d.focusToday },
          ])}${
            (t.extras ?? 0) > 0
              ? `<div style="height:12px"></div>${paragraph(`Plus ${t.extras} item${t.extras > 1 ? 's' : ''} beyond the plan. That is real work — it does not inflate the percentage, it sits on top of it.`)}`
              : ''
          }${
            t.done && t.done.length
              ? `<div style="height:14px"></div><p style="margin:0 0 7px;font:600 10px/1 -apple-system,Segoe UI,Roboto,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:${C.faint};">What you closed</p>` +
                t.done
                  .slice(0, 8)
                  .map(
                    (x) =>
                      `<p style="margin:0 0 5px;font:400 13px/1.45 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.fg};">&#10003;&nbsp; ${String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</p>`,
                  )
                  .join('') +
                (t.done.length > 8 ? `<p style="margin:4px 0 0;font-size:12px;color:${C.faint};">and ${t.done.length - 8} more</p>` : '')
              : ''
          }${
            t.missed.length
              ? `<div style="height:14px"></div>${paragraph(`Still open: ${t.missed.join(' · ')}`)}`
              : ''
          }`
        : paragraph(
            'Today was never started in the app, so there is nothing to measure it against. Hit Start today tomorrow morning — an unplanned day cannot be scored, and what cannot be measured drifts.',
          ),
    ),

    section('', quoteHtml({ line: eq, tag: 'Tonight' })),

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

    d.praise?.hasWins ? section('What you did well today', praiseHtml(d.praise)) : '',
    praise ? section('Worth naming', callout(praise, C.success)) : '',
    recovery ? section('Recovery plan', callout(recovery, C.danger)) : '',

    t && t.missed.length
      ? section(
          'Carries to tomorrow',
          `${paragraph('Nothing you planned is dropped. These open items go to the top of tomorrow, before anything new.')}<div style="height:10px"></div>${numberedList(t.missed.map((title) => ({ title })))}`,
        )
      : '',

    section("Tomorrow's mission", callout(tomorrow, C.accent)),
  ].join('');

  const text = [
    line(`RUTURAJ — DAILY ACCOUNTABILITY — Day ${d.day} of 161`),
    line(''),
    t && t.score !== null
      ? line(`PLANNED VS ACTUAL: ${t.completed}/${t.planned} of your plan — ${t.score}%${(t.extras ?? 0) > 0 ? ` (plus ${t.extras} extra)` : ''}`)
      : line('PLANNED VS ACTUAL: today was never started in the app.'),
    t && t.missed.length ? line(`  Carries to tomorrow: ${t.missed.join(' · ')}`) : '',
    line(`  Focused minutes: ${d.focusToday}`),
    ...(t?.done ?? []).slice(0, 8).map((x) => line(`  + ${x}`)),
    line(''),
    line(`"${eq}"`),
    line(''),
    d.praise?.hasWins ? line(`WHAT YOU DID WELL: ${d.praise.headline}`) : '',
    ...(d.praise?.wins ?? []).map((w) => line(`  + ${w.label} — ${w.detail}`)),
    d.praise?.hasWins ? line('') : '',
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
