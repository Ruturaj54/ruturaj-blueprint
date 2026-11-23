// Subject lines, headlines and the few lines both the HTML and the plain text
// share. Every subject is built from what the day actually holds (day number,
// topic, re-solves, streak, the first open item), never a generic string, and
// opens with one emoji so it stands out in the inbox (emoji are fine in mail,
// never in the app: CLAUDE.md rule 2). Kept under about 65 characters so a
// phone shows the whole line.

import { weekdayOf } from './engine.mjs';
import { plural } from './digest-copy.mjs';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SUN = '☀️';
const FIRE = '\u{1F525}';
const TARGET = '\u{1F3AF}';
const DUSK = '\u{1F306}';
const DONE = '✅';

const short = (s, max = 40) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

/** "3 problems" when the set is LeetCode problems, otherwise "4 items". */
function setCount(d) {
  const problems = d.prepItems.filter((i) => i.itemKind === 'Problem').length;
  if (problems > 0 && problems === d.prepItems.filter((i) => !i.revision).length) return plural(problems, 'problem');
  return plural(d.prepItems.length, 'item');
}

/* ---------- subjects ------------------------------------------------------------- */

export function morningSubject(d) {
  const dow = DOW[weekdayOf(d.today)];
  const at = d.prepAt ?? '17:30';
  if (!d.started) return `${SUN} Day 1 starts today: run at ${d.runAt ?? '08:05'}, first problem at ${at}`;
  if (d.phase === 'general') return `${SUN} Day ${d.general.day} · Roadmap: ${short(d.leadTitle)}`;
  if (d.mode === 'interview-day') return `${TARGET} Interview day. Checklist, breathe, go.`;
  if (d.mode === 'interview') {
    const lead = d.prepItems.find((i) => !i.revision) ?? d.prepItems[0];
    return `${TARGET} ${plural(d.interview.daysTo, 'day')} to the interview: ${short(lead?.title ?? d.topic, 34)}`;
  }
  if (d.mode === 'done') return `${SUN} Day ${d.day} · Curriculum done, revisions only today`;

  const revisions = d.prepItems.filter((i) => i.revision).length;
  if (d.dayType === 'saturday') return `${SUN} Saturday, Day ${d.day} · Long run, then the week’s hardest set`;
  if (d.dayType === 'sunday') return `${SUN} Sunday, Day ${d.day} · Clear the carry-over, then plan the week`;
  if (d.streak >= 3) return `${FIRE} Day ${d.day} · ${d.streak}-day streak. Keep it alive: ${short(d.topic, 30)}`;
  if (revisions > 0) return `${SUN} Day ${d.day} · ${plural(revisions, 'cold re-solve')}, then ${short(d.topic, 32)}`;
  if (dow === 'Mon') return `${SUN} Day ${d.day} · New week, new pattern: ${short(d.topic, 34)}`;
  if (d.amazon.daysLeft <= 3 && !d.amazon.overrun) {
    return `${SUN} Day ${d.day} · ${plural(d.amazon.daysLeft, 'day')} left in prep: ${short(d.topic, 30)}`;
  }
  const variants = [
    `${SUN} Day ${d.day} · ${setCount(d)} tonight: ${short(d.topic, 34)}`,
    `${SUN} Day ${d.day} · Run first, ${short(d.topic, 32)} at ${at}`,
    `${SUN} Day ${d.day} of ${d.amazon.windowDays} · Tonight’s pattern: ${short(d.topic, 30)}`,
  ];
  return variants[d.day % variants.length];
}

export function eveningSubject(d) {
  const dow = weekdayOf(d.today);
  const left = d.open.filter((i) => !i.lecture).length;
  const at = d.nextMove.at;
  const when = at === 'now' ? 'Now' : at;

  if (!d.started) return `${DUSK} Home? Press Start. Day 1 begins at ${d.prepAt ?? '17:30'}`;
  if (d.mode === 'interview-day') return `${TARGET} Interview day. Checklist, then rest`;
  if (d.mode === 'done' && !d.prepItems.length) return `${DUSK} Curriculum done. Lecture, walk, call home`;
  if (d.nextMove.allDone) return `${DONE} Today’s set is done. Walk ${d.walk.targetKm} km and call home`;
  const item = d.nextMove.item;
  if (!item) return `${DUSK} Nothing queued. Open the app and pull the next item`;
  if (d.dayType === 'saturday') return `${DUSK} Saturday · ${plural(left, 'item')} left, dinner at ${d.dinnerAt ?? '20:30'}`;
  if (d.dayType === 'sunday') return `${DUSK} Sunday · ${plural(left, 'item')} left, weekly review at ${d.reviewAt ?? '20:15'}`;
  if (dow === 5) return `${DUSK} Friday · ${plural(left, 'item')}, then the weekend is yours`;
  if (d.day % 2 === 1) return `${DUSK} ${when}: ${short(item.title, 32)} (${item.minutes} min) · ${plural(left, 'item')} tonight`;
  return `${DUSK} You’re home. ${when === 'Now' ? 'Start now' : when} with ${short(item.title, 34)}`;
}

/* ---------- headlines and shared lines ------------------------------------------------- */

/** The morning title: what the day asks for, in one breath. */
export function morningHeadline(d) {
  if (!d.started) return 'Day 1 is today.';
  if (d.mode === 'interview-day') return 'Interview day.';
  if (d.dayType === 'saturday') return 'Long run, then the week’s hardest set.';
  if (d.dayType === 'sunday') return 'Recovery walk, then clear the week.';
  const first = d.exercise.rest ? 'Rest morning.' : 'Run first.';
  if (d.phase === 'general') return `${first} Then ${short(d.leadTitle, 36)}.`;
  if (!d.prepItems.length) return `${first} Then the lecture and the walk.`;
  return `${first} Then ${setCount(d)} at ${d.prepAt ?? '17:30'}.`;
}

/** "Thursday 26 Nov · Surprise prep 4 of 28". */
export function headerLine(d) {
  const date = `${d.weekday} ${d.dateLabel}`;
  if (!d.started) return `${date} · press Start and today is Day 1`;
  if (d.phase === 'general') return `${date} · Roadmap ${d.general.day} of ${d.general.totalDays}`;
  const a = d.amazon;
  return a.overrun ? `${date} · Surprise prep, past the ${a.windowDays}-day window` : `${date} · Surprise prep ${a.day} of ${a.windowDays}`;
}

/** The evening title. */
export function eveningHeadline(d) {
  if (d.dayType !== 'weekday') return `${d.weekday} evening.`;
  return d.ownTime > 0 ? `Home. ${d.ownTime} minutes are yours.` : 'Home. Straight into the block.';
}

/** One line under the evening title: when the next block starts. */
export function leaveLine(d) {
  const m = d.nextMove;
  if (!d.started) return `Then press Start: Day 1 begins at ${d.prepAt ?? '17:30'}.`;
  if (m.allDone) return 'The set is done. Lecture, walk, sleep on time.';
  if (!m.item) return 'Nothing is queued; open the app and pull the next item.';
  return m.at === 'now' ? `Next: ${m.item.title}, now.` : `Then ${m.at}: ${m.item.title}.`;
}

export function nextMoveTitle(d) {
  return d.nextMove.at === 'now' ? 'Next move, now' : `Next move at ${d.nextMove.at}`;
}
