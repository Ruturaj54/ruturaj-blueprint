// §19 and §20 — the two daily mails, built from the digest. Weekdays, Saturday
// and Sunday each get their own shape: Saturday leads with "study, then ride",
// Sunday with the week's numbers and the review.

import { morningQuote, eveningQuote } from './quotes.mjs';
import { quoteHtml, unlockHtml, scheduleHtml, praiseHtml } from './blocks.mjs';
import {
  doThisHtml,
  missionsHtml,
  healthHtml,
  avoidGrowHtml,
  planHtml,
  weekHtml,
  rideHtml,
  reviewHtml,
} from './coach.mjs';
import { layout, section, numberedList, statRow, callout, paragraph, bullets, COLORS as C } from './mail.mjs';
import {
  morningSubject,
  eveningSubject,
  morningChallenge,
  recognition,
  recoveryPlan,
  tomorrowMission,
  avoidToday,
  growing,
} from './voice.mjs';
import { morningText, eveningText } from './plaintext.mjs';

const INTRO = {
  saturday:
    'Study first, ride after. Finish the 10:45 deep block and the DSA set, and the ride at 16:00 is fully earned — no guilt, no laptop in the bag.',
  sunday:
    'Three jobs today: clear whatever is still open from the week, sit the timed DSA set, and review the week at 20:30. The ride sits in the middle — back by 19:30.',
};

const KICKER = {
  weekday: 'Good morning, Ruturaj',
  saturday: 'Saturday · study, then ride',
  sunday: 'Sunday · review, ride, reset',
};

const DAY_TITLE = { weekday: 'Your day — every hour', saturday: 'Your Saturday', sunday: 'Your Sunday' };

const header = (d) => ({
  day: d.day,
  daysLeft: d.daysLeft,
  phase: `${d.phase.label} · ${d.phase.title}`,
  dateLine: `${d.weekday} ${d.dateLabel}`,
});

/* ---------- morning ------------------------------------------------------- */

export function buildMorning(d) {
  const praise = recognition(d);
  const challenge = morningChallenge(d);
  const avoid = avoidToday(d);
  const grow = growing(d);
  const q = morningQuote(d.day, d.phase.id);
  const weekend = d.dayType !== 'weekday';

  const missionIntro =
    (d.carriedCount > 0
      ? `${d.carriedCount} ${d.carriedCount === 1 ? 'item was' : 'items were'} planned earlier and not finished — ${d.carriedCount === 1 ? 'it comes' : 'they come'} first. `
      : '') +
    (d.gate.open
      ? 'Advanced Mode is open. These are the highest-value items the priority engine can see right now.'
      : `Course order: Apna College first, Five Minute Engineering second, then practice. Foundation Gate ${d.gate.done} of ${d.gate.total}.`);

  const body = [
    section('', quoteHtml(q)),
    weekend ? section('', callout(INTRO[d.dayType], C.success)) : '',
    weekend ? section(d.dayType === 'sunday' ? `Week ${d.week} so far` : 'This week so far', weekHtml(d)) : '',
    section('', doThisHtml(d)),
    section("Today's missions", `${paragraph(missionIntro)}<div style="height:12px"></div>${missionsHtml(d)}`),
    section(DAY_TITLE[d.dayType], scheduleHtml(d)),
    section('', unlockHtml(d)),
    weekend ? section('', rideHtml()) : '',
    d.dayType === 'sunday' ? section('', reviewHtml(d)) : '',
    section('Health today', healthHtml(d)),
    section('', avoidGrowHtml(avoid, grow)),
    section('The plan', planHtml(d)),
    section(
      'DSA target',
      `${paragraph(
        d.dayType === 'sunday'
          ? 'Weekly timed set: three problems under time, no hints. Log every solve time.'
          : `${d.dsa.target} problems today${d.dsa.weakest ? ` — start with ${d.dsa.weakest}, your thinnest pattern.` : '.'}`,
      )}<div style="height:12px"></div>${statRow([
        { label: 'Logged', value: d.dsa.total },
        { label: 'Clean', value: d.dsa.total ? `${d.dsa.accuracy}%` : '—', tone: d.dsa.accuracy >= 70 ? C.success : C.fg },
        { label: 'Streak', value: d.dsa.streak, tone: d.dsa.streak > 0 ? C.accent : C.faint },
      ])}`,
    ),
    praise ? section('Worth naming', callout(praise, C.success)) : '',
    section('The challenge', callout(challenge, C.accent)),
  ].join('');

  return {
    subject: morningSubject(d),
    html: layout({ kicker: KICKER[d.dayType] ?? KICKER.weekday, ...header(d), body }),
    text: morningText(d, { q, challenge, praise, avoid, grow, intro: INTRO[d.dayType] }),
  };
}

/* ---------- evening ------------------------------------------------------- */

function questionsFor(d) {
  const care = `${d.health.habits.done.length} of ${d.health.habits.total} ticked`;
  const dsa = `${d.dsa.todayCount} of ${d.dsa.target} logged`;
  if (d.dayType === 'saturday') {
    return [
      'Did the deep block happen before the ride?',
      `DSA and one re-solve? (${dsa})`,
      'Ride: gear on, back down before dark?',
      `Did the food on the ride stay low-sugar? Daily care: ${care}.`,
      'What is the one thing still open that Sunday must clear?',
    ];
  }
  if (d.dayType === 'sunday') {
    return [
      `Did you sit the timed set without hints? (${d.dsa.todayCount} logged)`,
      'Did you write the weekly review — one thing that slipped, one fix?',
      'Is Monday prepped — bag, office snacks, first module previewed?',
      `Back from the ride by 19:30? Daily care: ${care}.`,
      'What will you protect next week no matter what?',
    ];
  }
  return [
    `Did you complete today's DSA? (${dsa})`,
    'Did the 18:00 course block happen, or did it slide?',
    'Did you use the office spare hours, or did they disappear?',
    'Did you deliver your work priority at Parallel Wireless?',
    `Both runs? (${d.runsToday.length ? d.runsToday.join(', ') : 'nothing logged'})`,
    `Skin and hair care, no added sugar, kitchen closed after dinner? (${care})`,
    'What blocked you?',
  ];
}

function plannedVsActual(d) {
  const t = d.todayLog;
  if (!t || t.score === null) {
    return paragraph(
      'Today was never started in the app, so there is nothing to measure it against. Open the app tomorrow morning — an unplanned day cannot be scored, and what cannot be measured drifts.',
    );
  }
  const closed = (t.done ?? []).slice(0, 8);
  return `${statRow([
    { label: 'Of your plan', value: `${t.score}%`, tone: t.score >= 70 ? C.success : t.score >= 40 ? C.accent : C.danger },
    { label: 'Planned', value: `${t.completed}/${t.planned}` },
    { label: 'Extra', value: t.extras ?? 0, tone: (t.extras ?? 0) > 0 ? C.success : C.fg },
    { label: 'Focus min', value: d.focusToday },
  ])}${
    (t.extras ?? 0) > 0
      ? `<div style="height:12px"></div>${paragraph(`Plus ${t.extras} item${t.extras > 1 ? 's' : ''} beyond the plan. That is real work — it does not inflate the percentage, it sits on top of it.`)}`
      : ''
  }${closed.length ? `<div style="height:14px"></div>${bullets(closed.map((x) => ({ text: x })), C.success)}` : ''}${
    (t.done?.length ?? 0) > 8 ? paragraph(`and ${t.done.length - 8} more`) : ''
  }${t.missed.length ? `<div style="height:10px"></div>${paragraph(`Still open: ${t.missed.join(' · ')}`)}` : ''}`;
}

function careHtml(d) {
  const h = d.health;
  const items = [
    ...h.habits.done.map((text) => ({ text, sub: 'done' })),
    ...h.doctor.filter((x) => x.taken).map((x) => ({ text: x.name, sub: 'doctor-directed · taken' })),
  ];
  const missing = [...h.habits.missed, ...h.doctor.filter((x) => !x.taken).map((x) => `${x.name} (doctor-directed)`)];
  return `${items.length ? bullets(items, C.success) : paragraph('Nothing ticked under daily care today.')}${
    missing.length ? `<div style="height:6px"></div>${paragraph(`Not ticked: ${missing.join(' · ')}`)}` : ''
  }`;
}

export function buildEvening(d) {
  const t = d.todayLog;
  const recovery = recoveryPlan(d);
  const tomorrow = tomorrowMission(d);
  const praise = recognition(d);
  const questions = questionsFor(d);
  const eq = eveningQuote(t?.score ?? null);

  const body = [
    section('Planned vs actual', plannedVsActual(d)),
    d.dayType === 'sunday' ? section(`Week ${d.week} in numbers`, weekHtml(d)) : '',
    section('Daily care', careHtml(d)),
    section('', quoteHtml({ line: eq, tag: 'Tonight' })),
    section(
      'Answer honestly',
      questions
        .map((x) => `<p style="margin:0 0 7px;font:400 14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.muted};">— ${x}</p>`)
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
    section(d.dayType === 'sunday' ? "Monday's first mission" : "Tomorrow's mission", callout(tomorrow, C.accent)),
  ].join('');

  return {
    subject: eveningSubject(d),
    html: layout({
      kicker: d.dayType === 'sunday' ? `Week ${d.week} · closing` : 'Daily accountability',
      ...header(d),
      body,
    }),
    text: eveningText(d, { eq, questions, recovery, tomorrow }),
  };
}

/** Tags carried-over missions so a numbered list shows why they are first. */
export function withCarry(m) {
  return m.carriedFrom ? { ...m, context: `${m.context} · carried over` } : m;
}
