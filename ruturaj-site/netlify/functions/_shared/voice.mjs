// §21 — the voice.
//
// Direct, evidence-led, occasionally strict. Never abusive, never humiliating.
// Lines are chosen from the digest rather than rotated blindly, so the mail
// reacts to what actually happened instead of shouting generic motivation.

/** Morning subject. Prefers a line grounded in real data over a generic one. */
export function morningSubject(d) {
  const y = d.yesterday;

  if (y && y.score !== null && y.score < 50) {
    return `Ruturaj — yesterday was ${y.score}%. Today is not for planning.`;
  }
  if (y && y.score === 100) {
    return `Ruturaj — clean day yesterday. Day ${d.day}, same standard.`;
  }
  if (d.dsa.streak >= 7) {
    return `Ruturaj — ${d.dsa.streak}-day DSA streak. Day ${d.day} of ${161}.`;
  }
  if (d.dsa.total === 0) {
    return `Ruturaj — ${d.daysLeft} days left and zero problems logged.`;
  }
  if (!d.gate.open && d.gate.pct >= 80) {
    return `Ruturaj — the Foundation Gate is ${d.gate.pct}% done. Close it.`;
  }

  const generic = [
    `Ruturaj — today decides the next five months.`,
    `Ruturaj — ${d.daysLeft} days. What are you doing with them?`,
    `Your future SDE interview starts today.`,
    `Ruturaj — Day ${d.day}. Execution, not intake.`,
  ];
  return generic[d.day % generic.length];
}

export function eveningSubject(d) {
  const t = d.todayLog;
  if (t && t.score !== null) {
    if (t.score >= 90) return `Day ${d.day} — ${t.score}%. That is the standard.`;
    if (t.score >= 50) return `Day ${d.day} — ${t.score}%. What blocked the rest?`;
    return `Day ${d.day} — ${t.score}%. Be honest about today.`;
  }
  return `Ruturaj — daily accountability, Day ${d.day}`;
}

/**
 * The one-line challenge that closes the morning mail. Picked by what the data
 * says is actually wrong, not at random.
 */
export function morningChallenge(d) {
  const y = d.yesterday;

  if (y && y.missed.length > 0) {
    return `Yesterday you planned ${y.planned} items and closed ${y.completed}. Today you are not adding anything new — you are clearing "${y.missed[0]}".`;
  }
  if (d.dsa.todayCount === 0 && d.dsa.streak === 0 && d.dsa.total > 0) {
    return `Your DSA streak is at zero. Amazon does not care that you planned to study — it cares what you can solve under time.`;
  }
  if (d.dsa.total === 0) {
    return `Zero problems logged so far. Every day this stays at zero, the ${d.daysLeft} days left get more expensive.`;
  }
  if (!d.gate.open && d.day > 20) {
    return `Day ${d.day} and the gate is still ${d.gate.pct}%. Month 1 was for finishing what you started, not collecting more of it.`;
  }
  if (d.gate.open && d.dsa.weakest) {
    return `${d.dsa.weakest} is still your thinnest pattern. Strength is built where it is uncomfortable, not where it is easy.`;
  }
  return `Five months is enough for serious progress — if you stop negotiating with your own schedule.`;
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
    return 'Today was never started in the app. Tomorrow, hit Start today before 8am — an unplanned day cannot be measured, and what cannot be measured drifts.';
  }
  if (t.score >= 90) return null;
  if (t.missed.length === 1) {
    return `One item open: "${t.missed[0]}". Put it first tomorrow, before anything new.`;
  }
  if (t.missed.length > 1) {
    return `${t.missed.length} items open. Carry the top one — "${t.missed[0]}" — into tomorrow and drop the rest rather than pretending all of them will happen.`;
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
