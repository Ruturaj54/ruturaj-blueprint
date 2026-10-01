// Reusable HTML blocks for the daily mail: the quote, the full-day timetable,
// what today is worth, and the praise card. Split out of templates.mjs to keep
// each file under the 300-line rule in CLAUDE.md.

import { formatHM } from './schedule.mjs';
import { COLORS as C, FONT, esc, alpha } from './mail.mjs';

/** Colour of the rail beside each timetable row, by kind of entry. */
export const KIND_TONE = {
  study: C.accent,
  work: C.info,
  move: C.success,
  ride: C.success,
  care: '#C4B5FD',
  meal: C.muted,
  routine: C.muted,
  sleep: C.faint,
};

/** Motivation, given room to breathe rather than buried as a footnote. */
export function quoteHtml(q) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;background:${alpha(C.accent, 0.07)};border:1px solid ${alpha(C.accent, 0.22)};">
      <tr><td style="padding:16px 18px;">
        <p style="margin:0 0 7px;font:600 10px/1 ${FONT};letter-spacing:.16em;text-transform:uppercase;color:${C.accent};">${esc(q.tag ?? 'Today')}</p>
        <p style="margin:0;font:500 16px/1.5 Georgia,'Times New Roman',serif;color:${C.fg};">${esc(q.line ?? q)}</p>
      </td></tr>
    </table>`;
}

/** What today is worth, stated forward rather than as a raw counter. */
export function unlockHtml(d) {
  const delta = Math.max(0, (d.gateAfterToday ?? d.gate.pct) - d.gate.pct);
  const msg = d.gate.open
    ? `Finish today's three and you close ${d.missions.length} more items in ${esc(d.phase.title)}.`
    : delta > 0
      ? `Finish today's three and the Foundation Gate moves ${d.gate.pct}% &rarr; ${d.gateAfterToday}%. ${d.gate.total - d.gate.done} mandatory milestones stand between you and Advanced Mode.`
      : `Foundation Gate sits at ${d.gate.pct}%. ${d.gate.total - d.gate.done} mandatory milestones left.`;
  const w = Math.max(1, Math.min(100, d.gateAfterToday ?? d.gate.pct));
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.line};border-radius:10px;">
      <tr><td style="padding:13px 14px;">
        <p style="margin:0 0 8px;font:600 10px/1 ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${C.faint};">What today is worth</p>
        <p style="margin:0 0 10px;font:400 14px/1.5 ${FONT};color:${C.fg};">${msg}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,.07);border-radius:99px;"><tr>
          <td width="${w}%" style="height:7px;background:${C.accent};border-radius:99px;font-size:0;line-height:0;">&nbsp;</td>
          ${w < 100 ? '<td style="height:7px;font-size:0;line-height:0;">&nbsp;</td>' : ''}
        </tr></table>
      </td></tr>
    </table>`;
}

function itemRows(items) {
  return items
    .map(
      (i) => `
      <p style="margin:6px 0 0;font:400 13px/1.45 ${FONT};color:${C.fg};">
        <span style="color:${i.context === 'DSA' ? C.info : C.accent};">&#9679;</span>&nbsp; ${esc(i.title)}
        <span style="display:block;margin:1px 0 0 14px;font-size:11px;color:${C.faint};">${esc(i.context)} &middot; ${i.partial && i.totalMinutes ? `${formatHM(i.minutes)} of ${formatHM(i.totalMinutes)}` : formatHM(i.minutes)}${i.carried ? ` &middot; <span style="color:${C.accent};">carried over</span>` : ''}</span>
      </p>`,
    )
    .join('');
}

/**
 * The whole day as a timetable: every entry with its time, a coloured rail by
 * kind, and today's work inside the study blocks. Answers "when", which a task
 * list does not.
 */
export function scheduleHtml(d) {
  const rows = d.schedule.slots
    .map((s, idx, all) => {
      const tone = KIND_TONE[s.kind] ?? C.muted;
      const study = s.capacity > 0;
      const quiet = s.kind === 'sleep' || s.kind === 'meal' || s.kind === 'routine';
      const last = idx === all.length - 1;
      return `
      <tr>
        <td width="52" valign="top" style="padding:10px 0 10px;font:600 12px/1.3 ui-monospace,Menlo,monospace;color:${study ? C.fg : C.muted};">${esc(s.start)}<span style="display:block;font-weight:400;color:${C.faint};">${esc(s.end)}</span></td>
        <td width="3" style="background:${alpha(tone, study ? 0.95 : 0.55)};font-size:0;line-height:0;">&nbsp;</td>
        <td valign="top" style="padding:10px 0 10px 12px;${last ? '' : `border-bottom:1px solid ${C.line};`}">
          <p style="margin:0;font:${study ? 600 : 500} 14px/1.35 ${FONT};color:${quiet ? C.muted : C.fg};">${esc(s.label)}${
            study ? ` <span style="font:400 11px/1 ${FONT};color:${C.faint};">&middot; ${formatHM(s.used)} of ${formatHM(s.capacity)}</span>` : ''
          }</p>
          ${s.items.length ? itemRows(s.items) : ''}
          <p style="margin:5px 0 0;font:400 12px/1.45 ${FONT};color:${C.faint};">${esc(s.note)}</p>
        </td>
      </tr>`;
    })
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>${overflowHtml(d.schedule.overflow)}`;
}

/**
 * What does not fit today. Rendered, never dropped: an earlier version showed
 * only the blocks, so a mission too long for any single block vanished from
 * the mail with no explanation.
 */
function overflowHtml(overflow) {
  if (!overflow?.length) return '';
  const rows = overflow
    .map(
      (i) =>
        `<p style="margin:0 0 5px;font:400 13px/1.45 ${FONT};color:${C.fg};">&rarr;&nbsp; ${esc(i.title)} <span style="color:${C.faint};">&mdash; ${formatHM(i.minutes)} left</span></p>`,
    )
    .join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border:1px solid ${alpha(C.accent, 0.28)};border-radius:10px;">
      <tr><td style="padding:11px 13px;">
        <p style="margin:0 0 7px;font:600 13px/1.2 ${FONT};color:${C.accent};">Continues tomorrow</p>
        ${rows}
        <p style="margin:6px 0 0;font:400 11px/1.45 ${FONT};color:${C.faint};">Today's blocks are full. This moves to the top of tomorrow's plan rather than coming out of your sleep.</p>
      </td></tr>
    </table>`;
}

/** Named wins from the real day-over-day delta, not a stock compliment. */
export function praiseHtml(p) {
  const rows = p.wins
    .map(
      (w) => `
      <tr>
        <td width="12" valign="top" style="padding-top:6px;">
          <div style="width:6px;height:6px;border-radius:50%;background:${C.success};"></div>
        </td>
        <td style="padding:0 0 9px 8px;font:400 14px/1.45 ${FONT};color:${C.fg};">
          <b style="font-weight:600;">${esc(w.label)}</b>
          <span style="display:block;margin-top:2px;font-size:12px;color:${C.muted};">${esc(w.detail)}</span>
        </td>
      </tr>`,
    )
    .join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${alpha(C.success, 0.28)};background:${alpha(C.success, 0.06)};border-radius:10px;">
      <tr><td style="padding:13px 14px 6px;font:700 17px/1.25 ${FONT};color:${C.fg};">${esc(p.headline)}</td></tr>
      <tr><td style="padding:0 14px 12px;"><table role="presentation" width="100%">${rows}</table></td></tr>
    </table>`;
}
