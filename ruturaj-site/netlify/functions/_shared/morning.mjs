// The morning mail (default 06:00 IST). Short and phone-first: objective,
// exercise, the day's timetable, the Amazon set or roadmap missions, two
// outcomes for tonight, one button.

import { C, SITE_URL, esc, card, section, rows, pill, link, paragraph, layout, FONT } from './mail.mjs';
import { formatHM, formatShort } from './engine.mjs';
import { morningSubject, headerLine } from './voice.mjs';
import { morningText } from './plaintext.mjs';

function quoteHtml(q) {
  const by = q.by ? `<span style="display:block;margin-top:4px;font:400 12px/1.5 ${FONT};color:${C.faint};">${esc(q.by)}${q.source ? `, ${esc(q.source)}` : ''}</span>` : '';
  return `<p style="margin:0;padding-left:12px;border-left:3px solid ${C.line};font:400 14.5px/1.5 ${FONT};color:${C.fg};font-style:italic;">${esc(q.line)}${by}</p>`;
}

function objectiveHtml(d) {
  const parts = [paragraph(d.objective, { tone: C.fg, size: 15 })];
  if (d.started && d.phase !== 'general' && d.pace) parts.push(`<div style="height:6px"></div>${paragraph(d.pace)}`);
  if (d.interview && d.mode === 'interview') parts.push(`<div style="height:6px"></div>${paragraph(`Interview on ${formatShort(d.interview.date)}: Phase 3 goes first, the tracker's own advice.`)}`);
  return card(parts.join(''), d.phase === 'general' ? C.accent : C.amazon);
}

function exerciseHtml(d) {
  const e = d.exercise;
  if (e.rest) return card(`${paragraph('Rest day', { tone: C.fg, size: 15 })}${paragraph('Nothing to log this morning; the walk after the deep block still stands.')}`);
  const head = e.moved
    ? `${paragraph(e.title, { tone: C.fg, size: 15 })}${paragraph(`${e.name} · ${e.minutes} min. Keep the morning light and get daylight on your face.`)}`
    : `${paragraph(`${e.name} · ${e.minutes} min`, { tone: C.fg, size: 15 })}`;
  const lines = e.lines.map((l) => `<div style="margin-top:5px;font:400 13px/1.45 ${FONT};color:${C.muted};">${esc(l)}</div>`).join('');
  const done = e.done ? `<div style="margin-top:6px;font:500 12.5px/1.4 ${FONT};color:${C.success};">Already logged today.</div>` : '';
  return card(`${head}${lines}${done}`);
}

function timetableHtml(d) {
  const list = d.timetable.map((r) => ({
    lead: r.time,
    text: r.label,
    tone: r.study ? C.accent : C.faint,
    subs: r.items,
  }));
  const overflow = d.overflow ? `<div style="margin-top:4px;">${paragraph(d.overflow, { tone: C.warn, size: 12.5 })}</div>` : '';
  return `${rows(list)}${overflow}`;
}

function setHtml(d) {
  if (!d.items.length) return paragraph(d.mode === 'interview-day' ? 'No set today. Interview day.' : 'Nothing queued. Open the app and pull the next item.');
  const list = d.items.map((i) => ({
    lead: `${i.n}`,
    html: `${esc(i.title)}${i.tier ? ` ${pill(i.tier)}` : ''}${i.carried ? ` ${pill('carried', C.warn)}` : ''}`,
    tone: C.faint,
    subs: [
      `${formatHM(i.minutes)} · ${i.reason}`,
      i.url ? { html: link('Open on LeetCode', i.url) } : null,
    ],
  }));
  return rows(list);
}

function outcomesHtml(d) {
  return card(rows(d.outcomes.map((o, i) => ({ lead: `${i + 1}`, text: o, tone: C.success }))), C.success);
}

function cta(d) {
  if (!d.started) return { label: 'Start Day 1', href: `${SITE_URL}/#/home`, tone: C.accent };
  if (d.phase === 'general') return { label: 'Open today’s plan', href: `${SITE_URL}/#/home`, tone: C.accent };
  return { label: 'Open Amazon prep', href: `${SITE_URL}/#/amazon`, tone: C.amazon };
}

export function buildMorning(d) {
  const amazon = d.phase !== 'general';
  const setTitle = amazon ? (d.started ? 'Amazon set' : 'Day 1 set, previewed') : 'Roadmap missions';
  const body = [
    section('', quoteHtml(d.quote)),
    section('Today’s objective', objectiveHtml(d)),
    section('Morning exercise', exerciseHtml(d)),
    section('Your day', timetableHtml(d)),
    section(setTitle, setHtml(d), amazon ? C.amazon : C.accent),
    section('By tonight', outcomesHtml(d)),
  ].join('');

  return {
    subject: morningSubject(d),
    html: layout({
      kicker: d.started ? `Morning · Day ${d.day}` : 'Morning · Day 1 is waiting',
      kickerTone: amazon ? C.amazon : C.accent,
      title: 'Morning, Ruturaj.',
      subtitle: headerLine(d),
      body,
      cta: cta(d),
    }),
    text: morningText(d),
  };
}
