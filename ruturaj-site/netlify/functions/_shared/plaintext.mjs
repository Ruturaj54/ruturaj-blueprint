// Plain-text versions of both mails, same sections in the same order. Some
// clients show only this, and it is what a notification preview reads.

import { formatHM } from './engine.mjs';
import { SITE_URL } from './mail.mjs';
import { headerLine, leaveLine, nextMoveTitle } from './voice.mjs';

const line = (s = '') => `${s}\n`;

function timetable(rowsList) {
  return rowsList.flatMap((r) => [
    line(`  ${r.time}  ${r.label}${!r.items.length && r.note ? ` — ${r.note}` : ''}`),
    ...r.items.map((i) => line(`      - ${i}`)),
  ]);
}

export function morningText(d) {
  const q = d.quote;
  const setTitle = d.phase === 'general' ? 'ROADMAP MISSIONS' : d.started ? 'AMAZON SET' : 'DAY 1 SET, PREVIEWED';
  const e = d.exercise;
  const exercise = e.rest
    ? [line('  Rest day. Nothing to log this morning.')]
    : [
        line(`  ${e.moved ? `${e.title} · ${e.name}` : e.name} · ${e.minutes} min${e.done ? ' · already logged' : ''}`),
        ...e.lines.map((l) => line(`  - ${l}`)),
      ];
  const cta = !d.started ? 'Start Day 1' : d.phase === 'general' ? 'Open today’s plan' : 'Open Amazon prep';
  const href = `${SITE_URL}/#/${d.started && d.phase !== 'general' ? 'amazon' : 'home'}`;

  return [
    line('MORNING, RUTURAJ.'),
    line(headerLine(d)),
    line(),
    line(`"${q.line}"${q.by ? ` — ${q.by}${q.source ? `, ${q.source}` : ''}` : ''}`),
    line(),
    line("TODAY'S OBJECTIVE"),
    line(`  ${d.objective}`),
    d.started && d.phase !== 'general' && d.pace ? line(`  ${d.pace}`) : '',
    line(),
    line('MORNING EXERCISE'),
    ...exercise,
    line(),
    line('YOUR DAY'),
    ...timetable(d.timetable),
    d.overflow ? line(`  ${d.overflow}`) : '',
    line(),
    line(setTitle),
    ...(d.items.length
      ? d.items.map((i) =>
          line(`  ${i.n}. ${i.title} (${formatHM(i.minutes)}${i.tier ? `, ${i.tier}` : ''}${i.carried ? ', carried' : ''}) — ${i.reason}${i.url ? `\n      ${i.url}` : ''}`),
        )
      : [line('  Nothing queued.')]),
    line(),
    line('BY TONIGHT'),
    ...d.outcomes.map((o, i) => line(`  ${i + 1}. ${o}`)),
    line(),
    line(`${cta}: ${href}`),
  ].join('');
}

export function eveningText(d) {
  const m = d.nextMove;
  let next;
  if (!d.started) next = `  Day 1 is still waiting. Press Start in the app before ${m.at}; the first set is ${d.items.length} items, ${formatHM(d.minutes)}.`;
  else if (d.mode === 'interview-day') next = '  Interview day. Nothing new tonight: run the day-of checklist, read your one-page sheet, and stop early.';
  else if (d.mode === 'done' && !d.items.length) next = '  Curriculum complete. Nothing is due tonight; re-solves appear when they fall due.';
  else if (m.allDone) next = `  Today's set is already logged: ${d.dayLog.hits} of ${d.dayLog.planned} planned items closed.${m.item ? ` Next in order, only if you are fresh: ${m.item.title} (${formatHM(m.item.minutes)}).` : ''}`;
  else if (!m.item) next = '  Nothing is queued. Open the app and pull the next item forward.';
  else next = `  ${m.item.title} (${formatHM(m.item.minutes)}${m.item.tier ? `, ${m.item.tier}` : ''}) — ${m.item.reason}`;

  const done = [
    ...d.doneToday.map((t) => line(`  + ${t}`)),
    d.workout ? line(`  + ${d.workout}`) : '',
  ];
  const href = `${SITE_URL}/#/${d.started && d.phase !== 'general' ? 'amazon' : 'home'}`;

  return [
    line(d.dayType === 'weekday' ? "THAT'S THE OFFICE DONE." : `${d.weekday.toUpperCase()} EVENING.`),
    line(`Day ${d.started ? d.day : '1 is waiting'} · ${d.weekday} ${d.dateLabel}`),
    line(leaveLine(d)),
    line(),
    line(nextMoveTitle(d).toUpperCase()),
    line(next),
    line(),
    line('TONIGHT'),
    ...timetable(d.tonight),
    line(),
    ...(done.some(Boolean) ? [line('ALREADY DONE TODAY'), ...done, line()] : []),
    line(d.evening.line),
    line(),
    line(`Open tonight's plan: ${href}`),
  ].join('');
}
