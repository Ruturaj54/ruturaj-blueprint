// The evening mail (default 17:15 IST, as he walks in from the office). The next
// move, the evening ahead block by block (dinner, lecture and walk included),
// what is already done, one honest line, one button.

import { C, SITE_URL, esc, card, section, rows, link, paragraph, layout, FONT } from './mail.mjs';
import { formatHM } from './engine.mjs';
import { eveningSubject, eveningHeadline, leaveLine, nextMoveTitle } from './voice.mjs';
import { eveningText } from './plaintext.mjs';

function nextMoveHtml(d) {
  const m = d.nextMove;
  if (!d.started) {
    return card(`${paragraph('Day 1 is still waiting.', { tone: C.fg, size: 15 })}${paragraph(`Press Start in the app before ${m.at === 'now' ? 'you begin' : m.at}; the first set is ${d.prepItems.length} items, ${formatHM(d.prepMinutes)}.`)}`, C.accent);
  }
  if (d.mode === 'interview-day') {
    return card(`${paragraph('Interview day.', { tone: C.fg, size: 15 })}${paragraph('Nothing new tonight: run the day-of checklist, read your one-page sheet, and stop early.')}`, C.amazon);
  }
  if (m.allDone) {
    return card(`${paragraph('Today’s set is already logged.', { tone: C.fg, size: 15 })}${paragraph(`${d.dayLog.hits} of ${d.dayLog.planned} planned items closed. The lecture and the walk still stand.`)}`, C.success);
  }
  if (!m.item) return card(paragraph('Nothing is queued. Open the app and pull the next item forward.'));
  const url = m.item.url ? ` · ${link('LeetCode', m.item.url)}` : '';
  // The reason already opens with the tier ("P0 · asked in 2 reports"), so no separate pill.
  const inner = `<p style="margin:0;font:600 15px/1.4 ${FONT};color:${C.fg};">${esc(m.item.title)}</p>
<p style="margin:4px 0 0;font:400 13.5px/1.5 ${FONT};color:${C.muted};">${esc(`${formatHM(m.item.minutes)} · ${m.item.reason}`)}${url}</p>`;
  return card(inner, d.phase === 'general' ? C.accent : C.amazon);
}

function tonightHtml(d) {
  const list = d.tonight.map((r) => {
    const items = r.items.map((i) => `${i.title} · ${i.minutes}`);
    let text = r.label;
    if (r.kind === 'meal' && r.label.startsWith('Protein dinner')) text = `${r.label} · about ${d.dinner.proteinG} g protein`;
    if (r.study && r.items.length > 2) text = `${r.label} · ${r.items.length} left`;
    return {
      lead: r.start,
      text,
      tone: r.study ? C.accent : r.kind === 'walk' ? C.success : C.faint,
      subs: r.study && r.items.length > 2 ? items.slice(0, 2).concat(`+${r.items.length - 2} more`) : items.length ? items : r.note ? [r.note] : [],
    };
  });
  return rows(list);
}

function doneHtml(d) {
  const list = [
    ...(d.workout ? [{ lead: 'moved', text: d.workout, tone: C.success }] : []),
    ...d.doneToday.slice(0, 4).map((t) => ({ lead: 'done', text: t, tone: C.success })),
    ...(d.doneToday.length > 4 ? [{ lead: '', text: `+${d.doneToday.length - 4} more`, tone: C.faint }] : []),
  ];
  return rows(list);
}

export function buildEvening(d) {
  const prep = d.phase !== 'general';
  const hasDone = d.doneToday.length > 0 || Boolean(d.workout);
  const closing = `${d.evening.line} Before bed: today’s numbers and tomorrow’s line.`;
  const body = [
    section(nextMoveTitle(d), nextMoveHtml(d)),
    section('Tonight', tonightHtml(d)),
    hasDone ? section('Done today', doneHtml(d)) : '',
    section('', card(paragraph(closing, { tone: C.fg }))),
  ].join('');

  return {
    subject: eveningSubject(d),
    html: layout({
      kicker: d.started ? `Evening · Day ${d.day}` : 'Evening · Day 1 is waiting',
      kickerTone: prep ? C.amazon : C.accent,
      title: eveningHeadline(d),
      subtitle: leaveLine(d),
      body,
      cta: { label: 'Open tonight’s plan', href: `${SITE_URL}/#/home`, tone: prep ? C.amazon : C.accent },
    }),
    text: eveningText(d),
  };
}
