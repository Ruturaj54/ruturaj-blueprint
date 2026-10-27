// Subject lines and the few header lines both the HTML and the plain text
// share. Every subject is built from what the day actually holds (day number,
// weekday, topic, re-solves, the first open item), never a generic string.

import { weekdayOf } from './engine.mjs';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const short = (s, max = 48) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/* ---------- subjects ---------------------------------------------------------- */

export function morningSubject(d) {
  const dow = DOW[weekdayOf(d.today)];
  if (!d.started) return 'Day 1 is waiting — press Start, then run';
  if (d.phase === 'general') return `Day ${d.general.day} · Roadmap — ${short(d.leadTitle)}`;
  if (d.mode === 'interview-day') return `Interview day — Day ${d.day}. Checklist, then go.`;
  if (d.mode === 'interview') {
    const lead = d.items.find((i) => !i.revision) ?? d.items[0];
    return `${plural(d.interview.daysTo, 'day')} to the interview — Phase 3: ${short(lead?.title ?? d.topic)}`;
  }
  if (d.mode === 'done') return `Day ${d.day} · ${dow} — curriculum complete, revisions only`;

  const revisions = d.items.filter((i) => i.revision).length;
  if (d.dayType === 'saturday') return `Saturday, Day ${d.day} — long run, then ${short(d.topic)}`;
  if (d.dayType === 'sunday') return `Sunday, Day ${d.day} — recovery walk, then ${short(d.topic)}`;
  if (revisions > 0 && d.curriculumDay) {
    return `Day ${d.day} · ${dow} — ${plural(revisions, 're-solve')}, then Day ${d.curriculumDay}: ${short(d.topic)}`;
  }
  if (dow === 'Mon') return `Day ${d.day} · Mon — new week, Amazon first: ${short(d.topic)}`;
  if (dow === 'Fri') return `Day ${d.day} · Fri — Amazon first, then the weekend set: ${short(d.topic, 40)}`;
  if (d.amazon.daysLeft <= 2 && !d.amazon.overrun) {
    return `Day ${d.day} · ${dow} — ${plural(d.amazon.daysLeft, 'day')} left in the window: ${short(d.topic)}`;
  }
  return `Day ${d.day} · ${dow} — Amazon first: ${short(d.topic)}`;
}

export function eveningSubject(d) {
  const dow = weekdayOf(d.today);
  const left = d.open.length;
  const time = d.settings.eveningEmailTime;
  const at = d.nextMove.at;

  if (!d.started) return `Office done — Day 1 is waiting, press Start before ${at === 'now' ? time : at}`;
  if (d.mode === 'interview-day') return 'Interview day — checklist, then rest';
  if (d.mode === 'done' && !d.items.length) return 'Office done — curriculum complete, nothing due tonight';
  if (d.dayType === 'saturday') {
    return `Saturday ${time} — ${plural(left, 'item')} left${d.freeAt ? `, free evening at ${d.freeAt}` : ''}`;
  }
  if (d.dayType === 'sunday') return `Sunday ${time} — ${plural(left, 'item')} left, weekly review at 20:30`;
  if (d.nextMove.allDone) return 'Office done — tonight’s set is already logged';
  const item = d.nextMove.item;
  if (!item) return 'Office done — nothing queued, open the app and pull the next item';
  if (dow === 5) return `Friday done — ${plural(left, 'item')} tonight, then the weekend plan`;
  if (d.day % 2 === 1) return `Office done — ${at}: ${short(item.title)} (${item.minutes} min)`;
  return `Workday complete. Next: ${short(item.title, 40)} ${at === 'now' ? 'now' : `at ${at}`}`;
}

/* ---------- shared header lines ---------------------------------------------------- */

/** "Day 3 · Tuesday 28 Oct · Amazon intensive, day 3 of 14". */
export function headerLine(d) {
  const date = `${d.weekday} ${d.dateLabel}`;
  if (!d.started) return `Day 1 is waiting · ${date}`;
  if (d.phase === 'general') return `Roadmap · Day ${d.general.day} of ${d.general.totalDays} · ${date}`;
  const a = d.amazon;
  const window = a.overrun
    ? `Amazon intensive, day ${a.day}, past the ${a.windowDays}-day window`
    : `Amazon intensive, day ${a.day} of ${a.windowDays}`;
  return `Day ${d.day} · ${date} · ${window}`;
}

/** One line about leaving the office behind, varied by day number. */
const LEAVE = [
  'Whatever happened at work today stays there. The next three hours are yours.',
  'Change, eat something small, and let the hour before the block be an actual hour off.',
  'The commute is the boundary. Nothing from the office crosses it tonight.',
  'Shoes off, phone on the shelf. The evening does not need the office in it.',
  'You have done the paid work. What follows is the work that changes the next job.',
];

const WEEKEND_LEAVE = {
  saturday: 'The long blocks are behind you. Finish what is open, then the evening is genuinely free.',
  sunday: 'Clear what is still open, then the review at 20:30 sets up Monday.',
};

export function leaveLine(d) {
  if (d.dayType !== 'weekday') return WEEKEND_LEAVE[d.dayType];
  return LEAVE[Math.abs(d.day) % LEAVE.length];
}

export function nextMoveTitle(d) {
  return d.nextMove.at === 'now' ? 'Next move, now' : `Next move at ${d.nextMove.at}`;
}
