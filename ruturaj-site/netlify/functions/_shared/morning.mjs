// The morning mail (default 07:45 IST, waiting when he wakes at 08:00).
// Short and phone-first: a headline, the day's key rows with the prep set
// under its block, last night's own line, yesterday's numbers, the one thing
// that makes tonight count, one button.

import { C, SITE_URL, esc, card, section, rows, link, paragraph, layout, FONT } from './mail.mjs';
import { morningSubject, morningHeadline, headerLine } from './voice.mjs';
import { morningText } from './plaintext.mjs';

/** Each study item: title, then minutes and the planner's reason, then the LeetCode link. */
function itemSubs(items) {
  return items.map((i, n) => ({
    html: `<span style="color:${C.fg};">${n + 1}. ${esc(i.title)}</span><br>${esc([i.minutes, i.reason].filter(Boolean).join(' · '))}${i.url ? ` · ${link('LeetCode', i.url)}` : ''}`,
  }));
}

function rowText(r, d) {
  if (r.kind === 'move') return d.exercise.rest ? 'Rest morning · stretch' : `${d.exercise.name} · ${d.exercise.minutes} min${d.exercise.done ? ' · done' : ''}`;
  if (r.kind === 'meal') return `${r.label} · about ${d.dinner.proteinG} g protein`;
  if (r.lecture) return r.items.length ? `Lecture · ${r.items.map((i) => i.title).join(', ')}` : r.label;
  return r.label;
}

function dayHtml(d) {
  const list = d.rows.map((r) => ({
    lead: r.start,
    text: rowText(r, d),
    tone: r.study ? C.accent : r.kind === 'move' || r.kind === 'walk' ? C.success : C.faint,
    subs: r.study && !r.lecture ? (r.items.length ? itemSubs(r.items) : ['nothing queued']) : [],
  }));
  const overflow = d.overflow ? `<div style="margin-top:4px;">${paragraph(d.overflow, { tone: C.warn, size: 12.5 })}</div>` : '';
  return `${rows(list)}${overflow}`;
}

function notesHtml(d) {
  const parts = [];
  if (d.yesterday.plan) {
    parts.push(`<p style="margin:0 0 6px;font:600 11px/1.4 ${FONT};letter-spacing:.1em;text-transform:uppercase;color:${C.muted};">Last night you wrote</p>${paragraph(`“${d.yesterday.plan}”`, { tone: C.fg, size: 15 })}`);
  }
  if (d.yesterday.activity) {
    parts.push(`<p style="margin:${parts.length ? '10px' : '0'} 0 0;font:400 13px/1.5 ${FONT};color:${C.muted};"><b style="color:${C.fg};font-weight:600;">Yesterday</b> · ${esc(d.yesterday.activity)}</p>`);
  }
  return parts.length ? card(parts.join('')) : '';
}

function quoteHtml(q) {
  const by = q.by ? ` <span style="color:${C.faint};font-style:normal;">— ${esc(q.by)}</span>` : '';
  return `<p style="margin:0;font:400 13px/1.5 ${FONT};color:${C.muted};font-style:italic;">${esc(q.line)}${by}</p>`;
}

function cta(d) {
  if (!d.started) return { label: 'Start Day 1', href: `${SITE_URL}/#/home`, tone: C.accent };
  if (d.phase === 'general') return { label: 'Open today’s plan', href: `${SITE_URL}/#/home`, tone: C.accent };
  return { label: 'Open today’s plan', href: `${SITE_URL}/#/home`, tone: C.amazon };
}

export function buildMorning(d) {
  const prep = d.phase !== 'general';
  const notes = notesHtml(d);
  const body = [
    section('Today', dayHtml(d), prep ? C.amazon : C.accent),
    notes ? section('', notes) : '',
    section('Tonight counts if', card(paragraph(d.win, { tone: C.fg, size: 14.5 }), C.success)),
    section('', quoteHtml(d.quote)),
  ].join('');

  return {
    subject: morningSubject(d),
    html: layout({
      kicker: d.started ? `Morning · Day ${d.day}` : 'Morning · Day 1 is waiting',
      kickerTone: prep ? C.amazon : C.accent,
      title: morningHeadline(d),
      subtitle: headerLine(d),
      body,
      cta: cta(d),
    }),
    text: morningText(d),
  };
}
