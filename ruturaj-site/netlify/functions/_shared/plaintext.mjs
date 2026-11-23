// Plain-text versions of both mails, same sections in the same order. Some
// clients show only this, and it is what a notification preview reads.

import { formatHM } from './engine.mjs';
import { SITE_URL } from './mail.mjs';
import { morningHeadline, headerLine, eveningHeadline, leaveLine, nextMoveTitle } from './voice.mjs';

const line = (s = '') => `${s}\n`;

function dayRow(r, d) {
  if (r.kind === 'move') return d.exercise.rest ? 'Rest morning · stretch' : `${d.exercise.name} · ${d.exercise.minutes} min${d.exercise.done ? ' · done' : ''}`;
  if (r.kind === 'meal') return `${r.label} · about ${d.dinner.proteinG} g protein`;
  if (r.lecture) return r.items.length ? `Lecture · ${r.items.map((i) => i.title).join(', ')}` : r.label;
  return r.label;
}

export function morningText(d) {
  const q = d.quote;
  const rows = d.rows.flatMap((r) => [
    line(`  ${r.start}  ${dayRow(r, d)}`),
    ...(r.study && !r.lecture
      ? r.items.length
        ? r.items.map((i, n) => line(`      ${n + 1}. ${i.title} (${[i.minutes, i.reason].filter(Boolean).join(' · ')})${i.url ? `\n         ${i.url}` : ''}`))
        : [line('      nothing queued')]
      : []),
  ]);

  return [
    line(morningHeadline(d).toUpperCase()),
    line(headerLine(d)),
    line(),
    line('TODAY'),
    ...rows,
    d.overflow ? line(`  ${d.overflow}`) : '',
    line(),
    ...(d.yesterday.plan ? [line(`Last night you wrote: "${d.yesterday.plan}"`)] : []),
    ...(d.yesterday.activity ? [line(`Yesterday · ${d.yesterday.activity}`)] : []),
    ...(d.yesterday.plan || d.yesterday.activity ? [line()] : []),
    line(`TONIGHT COUNTS IF: ${d.win}`),
    line(),
    line(`"${q.line}"${q.by ? ` — ${q.by}` : ''}`),
    line(),
    line(`${d.started ? 'Open today’s plan' : 'Start Day 1'}: ${SITE_URL}/#/home`),
  ].join('');
}

export function eveningText(d) {
  const m = d.nextMove;
  let next;
  if (!d.started) next = `  Day 1 is still waiting. Press Start in the app; the first set is ${d.prepItems.length} items, ${formatHM(d.prepMinutes)}.`;
  else if (d.mode === 'interview-day') next = '  Interview day. Nothing new tonight: run the day-of checklist, read your one-page sheet, and stop early.';
  else if (m.allDone) next = `  Today's set is already logged: ${d.dayLog.hits} of ${d.dayLog.planned} planned items closed. The lecture and the walk still stand.`;
  else if (!m.item) next = '  Nothing is queued. Open the app and pull the next item forward.';
  else next = `  ${m.item.title} (${formatHM(m.item.minutes)}) — ${m.item.reason}${m.item.url ? `\n  ${m.item.url}` : ''}`;

  const tonight = d.tonight.flatMap((r) => [
    line(`  ${r.time}  ${r.kind === 'meal' && r.label.startsWith('Protein dinner') ? `${r.label} · about ${d.dinner.proteinG} g protein` : r.label}${!r.items.length && r.note ? ` — ${r.note}` : ''}`),
    ...r.items.slice(0, 3).map((i) => line(`      - ${i.title} · ${i.minutes}`)),
  ]);
  const done = [...(d.workout ? [line(`  + ${d.workout}`)] : []), ...d.doneToday.slice(0, 4).map((t) => line(`  + ${t}`))];

  return [
    line(eveningHeadline(d).toUpperCase()),
    line(leaveLine(d)),
    line(),
    line(nextMoveTitle(d).toUpperCase()),
    line(next),
    line(),
    line('TONIGHT'),
    ...tonight,
    line(),
    ...(done.length ? [line('DONE TODAY'), ...done, line()] : []),
    line(`${d.evening.line} Before bed: today's numbers and tomorrow's line.`),
    line(),
    line(`Open tonight's plan: ${SITE_URL}/#/home`),
  ].join('');
}
