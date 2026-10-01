// §21 — the voice.
//
// Direct, evidence-led, occasionally strict. Never abusive, never humiliating.
// Lines are chosen from the digest rather than rotated blindly, so the mail
// reacts to what actually happened instead of shouting generic motivation.

const pick = (list, n) => list[((n % list.length) + list.length) % list.length];

/** Morning subject. Prefers a line grounded in real data over a generic one. */
export function morningSubject(d) {
  const y = d.yesterday;

  if (d.day === 1) return 'Ruturaj — Day 1 of 161. Apna College, module 3, today.';
  if (d.dayType === 'saturday') {
    return `Ruturaj — Saturday, Day ${d.day}: the deep block first, then the hills.`;
  }
  if (d.dayType === 'sunday') {
    return `Ruturaj — Sunday: close week ${d.week}, timed DSA, then ride.`;
  }
  if (y && y.score !== null && y.score < 50) {
    return `Ruturaj — yesterday was ${y.score}%. Today is not for planning.`;
  }
  if (y && y.score === 100) {
    return `Ruturaj — clean day yesterday. Day ${d.day}, same standard.`;
  }
  if (d.dsa.streak >= 7) {
    return `Ruturaj — ${d.dsa.streak}-day DSA streak. Day ${d.day} of 161.`;
  }
  if (d.dsa.total === 0 && d.day > 3) {
    return `Ruturaj — ${d.daysLeft} days left and zero problems logged.`;
  }
  if (!d.gate.open && d.gate.pct >= 80) {
    return `Ruturaj — the Foundation Gate is ${d.gate.pct}% done. Close it.`;
  }

  return pick(
    [
      `Ruturaj — Day ${d.day}. The switch is built on days like this one.`,
      `Ruturaj — ${d.daysLeft} days. What are you doing with today's?`,
      `Ruturaj — Day ${d.day}. Execution, not intake.`,
      `Ruturaj — your next offer is being earned this week, not in March.`,
    ],
    d.day,
  );
}

export function eveningSubject(d) {
  const t = d.todayLog;
  const score = t && t.score !== null ? t.score : null;
  if (d.dayType === 'sunday') {
    const w = d.weekStats;
    return `Week ${d.week} closed${w.pct !== null ? ` — ${w.pct}% of plan` : ''}. Monday starts at 07:00.`;
  }
  if (d.dayType === 'saturday') {
    return score === null
      ? `Saturday, Day ${d.day} — did the study come before the ride?`
      : `Saturday, Day ${d.day} — ${score}%. Study, then the hills.`;
  }
  if (score !== null) {
    if (score >= 90) return `Day ${d.day} — ${score}%. That is the standard.`;
    if (score >= 50) return `Day ${d.day} — ${score}%. What blocked the rest?`;
    return `Day ${d.day} — ${score}%. Be honest about today.`;
  }
  return `Ruturaj — daily accountability, Day ${d.day}`;
}

/**
 * The one-line challenge that closes the morning mail. Picked by what the data
 * says is actually wrong, not at random.
 */
export function morningChallenge(d) {
  const y = d.yesterday;

  if (d.day === 1) {
    return 'Day 1 is not about motivation — it is about proof. By tonight: three modules ticked, three problems logged, one notebook pushed. Then do it again tomorrow.';
  }
  if (y && y.missed.length > 0) {
    return `Yesterday you planned ${y.planned} items and closed ${y.completed}. Today you are not adding anything new — you are clearing "${y.missed[0]}".`;
  }
  if (d.dsa.todayCount === 0 && d.dsa.streak === 0 && d.dsa.total > 0) {
    return 'Your DSA streak is at zero. Amazon does not care that you planned to study — it cares what you can solve under time.';
  }
  if (d.dsa.total === 0 && d.day > 3) {
    return `Zero problems logged so far. Every day this stays at zero, the ${d.daysLeft} days left get more expensive.`;
  }
  if (!d.gate.open && d.day > 20) {
    return `Day ${d.day} and the gate is ${d.gate.pct}%. Phase 1 is for finishing what you started, not collecting more of it.`;
  }
  if (d.gate.open && d.dsa.weakest) {
    return `${d.dsa.weakest} is still your thinnest pattern. Strength is built where it is uncomfortable, not where it is easy.`;
  }
  return 'You said you want to win. Winning is boring from the inside: the same blocks, at the same times, every day, until the offer arrives.';
}

/** Genuine progress deserves naming. §21 explicitly asks for this. */
export function recognition(d) {
  if (d.gate.open && !d.gate.overridden) {
    return 'You closed the Foundation Gate on merit. That is a real milestone — most people keep buying courses instead.';
  }
  if (d.dsa.streak >= 14) {
    return `${d.dsa.streak} days of unbroken DSA. Consistency at this length is rarer than talent.`;
  }
  if (d.dsa.accuracy >= 75 && d.dsa.total >= 20) {
    return `${d.dsa.accuracy}% clean solve rate across ${d.dsa.total} problems. That is interview-grade accuracy holding up.`;
  }
  if (d.yesterday && d.yesterday.score === 100) {
    return 'You closed every planned item yesterday. Do it twice more and it stops being a good day and starts being your baseline.';
  }
  return null;
}

/** The evening recovery plan, when the day went badly. */
export function recoveryPlan(d) {
  const t = d.todayLog;
  if (!t || t.score === null) {
    return 'Today was never started in the app. Tomorrow, open it before 08:00 — an unplanned day cannot be measured, and what cannot be measured drifts.';
  }
  if (t.score >= 90) return null;
  if (t.missed.length === 1) {
    return `One item open: "${t.missed[0]}". It goes first tomorrow, before anything new.`;
  }
  if (t.missed.length > 1) {
    return `${t.missed.length} items open. They carry to the top of tomorrow — start with "${t.missed[0]}" and do not open anything new until it is closed.`;
  }
  return null;
}

/** §20 — tomorrow's single mission. */
export function tomorrowMission(d) {
  const t = d.todayLog;
  if (t && t.missed.length > 0) return t.missed[0];
  if (d.missions.length > 0) return d.missions[0].title;
  return 'Open the roadmap and pull the next milestone forward.';
}

/* ---------- avoid / growing ---------------------------------------------- */

const AVOID_WEEKDAY = [
  'Avoid opening a new course, playlist or roadmap video. Apna first, Five Minute Engineering second — nothing else until the gate closes.',
  'Avoid watching without typing. If the code did not go through your fingers, it did not go into your head.',
  'Avoid the phone in the office spare hours. Two hours a day is ten a week — a whole module.',
  'Avoid letting DSA slide because the course ran long. It sits first in the night block for exactly that reason.',
  'Avoid going past 01:00. Six hours is already the floor; a 3 am night costs tomorrow’s two blocks.',
  'Avoid perfect notes. One page per module, written from memory, then move on.',
  'Avoid announcing the switch at work. Do the job well — your strongest resume lines and references come from there.',
  'Avoid comparing yourself with LinkedIn highlight reels. The only comparison that counts is you, seven days ago.',
];

const AVOID_SATURDAY = [
  'Avoid starting the ride before the study ends. Study first is exactly what makes the ride guilt-free.',
  'Avoid the ghat after dark. The hills will still be there next weekend.',
];

const AVOID_SUNDAY = [
  'Avoid skipping the review because the week felt bad. A bad week reviewed beats a good week forgotten.',
  'Avoid a late Sunday night. Monday’s 07:00 decides the whole week.',
];

/** Three lines: what to avoid today, chosen by the kind of day it is. */
export function avoidToday(d) {
  const lines = [];
  if (d.dayType === 'saturday') lines.push(...AVOID_SATURDAY);
  else if (d.dayType === 'sunday') lines.push(...AVOID_SUNDAY);
  else {
    lines.push(pick(AVOID_WEEKDAY, d.day));
    lines.push(pick(AVOID_WEEKDAY, d.day + 3));
  }
  const health = d.health.tipAvoidAlt;
  lines.push(
    health
      ? `Avoid ${health.line.charAt(0).toLowerCase()}${health.line.slice(1)}`
      : 'Avoid eating during the night block. Kitchen closes after dinner.',
  );
  return lines.slice(0, 3);
}

/** "You are growing" — real totals since 1 Oct, never padded. */
export function growing(d) {
  const g = d.growth;
  const stats = [
    { label: 'Modules', value: g.modules + g.tasks },
    { label: 'Solved', value: g.problems },
    { label: 'Runs', value: g.runs },
    { label: 'Focus h', value: g.focusHours },
  ];
  const anything = g.modules + g.tasks + g.problems + g.runs + g.focusHours > 0;
  if (!anything) {
    return {
      line: d.day === 1
        ? 'Day 1. Nothing on the board yet — by tonight there will be. Every number below starts from here.'
        : 'Nothing logged yet. The numbers below only move when you tick things in the app.',
      stats,
    };
  }
  const clean = g.cleanDays > 0 ? ` ${g.cleanDays} clean day${g.cleanDays === 1 ? '' : 's'} so far.` : '';
  return {
    line: `Since 1 October: ${g.daysStarted} day${g.daysStarted === 1 ? '' : 's'} on the plan, ${g.km} km run.${clean} This is what the hero arc looks like from the inside — small, repeated, real.`,
    stats,
  };
}
