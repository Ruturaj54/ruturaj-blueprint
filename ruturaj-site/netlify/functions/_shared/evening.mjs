// The evening mail (17:00 IST, as he leaves the office). The next move, the
// blocks still ahead tonight, what is already logged, one honest line.

import { C, SITE_URL, esc, card, section, rows, pill, paragraph, layout, FONT } from './mail.mjs';
import { formatHM } from './engine.mjs';
import { eveningSubject, leaveLine, nextMoveTitle } from './voice.mjs';
import { eveningText } from './plaintext.mjs';

function nextMoveHtml(d) {
  const m = d.nextMove;
  if (!d.started) {
    return card(`${paragraph('Day 1 is still waiting.', { tone: C.fg, size: 15 })}${paragraph(`Press Start in the app before ${m.at}; the first set is ${d.items.length} items, ${formatHM(d.minutes)}.`)}`, C.accent);
  }
  if (d.mode === 'interview-day') {
    return card(`${paragraph('Interview day.', { tone: C.fg, size: 15 })}${paragraph('Nothing new tonight: run the day-of checklist, read your one-page sheet, and stop early.')}`, C.amazon);
  }
  if (d.mode === 'done' && !d.items.length) {
    return card(`${paragraph('Curriculum complete.', { tone: C.fg, size: 15 })}${paragraph('Nothing is due tonight. Re-solves appear here when they fall due; mark the Amazon phase complete when you are ready.')}`, C.success);
  }
  if (m.allDone) {
    const next = m.item ? ` The next item in order would be ${m.item.title} (${formatHM(m.item.minutes)}), only if you are fresh.` : '';
    return card(`${paragraph('Today’s set is already logged.', { tone: C.fg, size: 15 })}${paragraph(`${d.dayLog.hits} of ${d.dayLog.planned} planned items closed.${next}`)}`, C.success);
  }
  if (!m.item) return card(paragraph('Nothing is queued. Open the app and pull the next item forward.'));
  const inner = `<p style="margin:0;font:600 15px/1.4 ${FONT};color:${C.fg};">${esc(m.item.title)}${m.item.tier ? ` ${pill(m.item.tier)}` : ''}</p>
${paragraph(`${formatHM(m.item.minutes)} · ${m.item.reason}`)}`;
  return card(inner, d.phase === 'general' ? C.accent : C.amazon);
}

function tonightHtml(d) {
  const list = d.tonight.map((r) => ({
    lead: r.time,
    text: r.label,
    tone: r.study ? C.accent : C.faint,
    subs: r.items.length ? r.items : r.note ? [r.note] : [],
  }));
  return rows(list);
}

function doneHtml(d) {
  const list = [
    ...d.doneToday.map((t) => ({ lead: 'done', text: t, tone: C.success })),
    ...(d.workout ? [{ lead: 'moved', text: d.workout, tone: C.success }] : []),
  ];
  return rows(list);
}

export function buildEvening(d) {
  const amazon = d.phase !== 'general';
  const hasDone = d.doneToday.length > 0 || Boolean(d.workout);
  const body = [
    section(nextMoveTitle(d), nextMoveHtml(d)),
    section('Tonight', tonightHtml(d)),
    hasDone ? section('Already done today', doneHtml(d)) : '',
    section('', card(paragraph(d.evening.line, { tone: C.fg }))),
  ].join('');

  return {
    subject: eveningSubject(d),
    html: layout({
      kicker: d.started ? `Evening · Day ${d.day}` : 'Evening · Day 1 is waiting',
      kickerTone: amazon ? C.amazon : C.accent,
      title: d.dayType === 'weekday' ? 'That’s the office done.' : `${d.weekday} evening.`,
      subtitle: leaveLine(d),
      body,
      cta: { label: 'Open tonight’s plan', href: `${SITE_URL}/#/${amazon && d.started ? 'amazon' : 'home'}`, tone: amazon ? C.amazon : C.accent },
    }),
    text: eveningText(d),
  };
}
