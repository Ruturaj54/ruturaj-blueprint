// Reusable HTML blocks for the daily mail. Split out of templates.mjs to keep
// each file under the 300-line rule in CLAUDE.md.

import { formatHM } from './schedule.mjs';
import { COLORS as C, paragraph, statRow } from './mail.mjs';

/** Motivation, given room to breathe rather than buried as a footnote. */
export function quoteHtml(q) {
  const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px;background:linear-gradient(180deg,rgba(251,191,36,.09),rgba(251,191,36,.03));border:1px solid rgba(251,191,36,.22);">
      <tr><td style="padding:16px 18px;">
        <p style="margin:0 0 7px;font:600 10px/1 -apple-system,Segoe UI,Roboto,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:${C.accent};">${esc(q.tag ?? 'Today')}</p>
        <p style="margin:0;font:500 16px/1.5 Georgia,'Times New Roman',serif;color:${C.fg};">${esc(q.line ?? q)}</p>
      </td></tr>
    </table>`;
}

/** What today is worth, stated forward rather than as a raw counter. */
export function unlockHtml(d) {
  const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const delta = Math.max(0, (d.gateAfterToday ?? d.gate.pct) - d.gate.pct);
  const msg = d.gate.open
    ? `Finish today's three and you close ${d.missions.length} more items in ${esc(d.phase.title)}.`
    : delta > 0
      ? `Finish today's three and the Foundation Gate moves ${d.gate.pct}% → ${d.gateAfterToday}%. ${d.gate.total - d.gate.done} mandatory milestones stand between you and Advanced Mode.`
      : `Foundation Gate sits at ${d.gate.pct}%. ${d.gate.total - d.gate.done} mandatory milestones left.`;
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.line};border-radius:10px;">
      <tr><td style="padding:13px 14px;">
        <p style="margin:0 0 8px;font:600 10px/1 -apple-system,Segoe UI,Roboto,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:${C.faint};">What today is worth</p>
        <p style="margin:0 0 10px;font:400 14px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.fg};">${msg}</p>
        <div style="height:7px;background:rgba(255,255,255,.07);border-radius:99px;overflow:hidden;">
          <div style="width:${d.gateAfterToday ?? d.gate.pct}%;height:7px;background:${C.accent};border-radius:99px;"></div>
        </div>
      </td></tr>
    </table>`;
}

/** The day as a timetable — answers "when", which a task list does not. */
export function scheduleHtml(d) {
  const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return d.schedule.slots
    .filter((s) => s.items.length > 0 || s.id === 'run')
    .map((s) => {
      const rest = s.id === 'run';
      const rows = s.items
        .map(
          (i) => `
          <tr>
            <td width="10" valign="top" style="padding-top:7px;">
              <div style="width:6px;height:6px;border-radius:50%;background:${i.context === 'DSA' ? C.info : C.accent};"></div>
            </td>
            <td style="padding:2px 0 8px 8px;font:400 14px/1.45 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.fg};">
              ${esc(i.title)}
              <span style="display:block;margin-top:2px;font-size:11px;color:${C.faint};">${esc(i.context)} &middot; ${i.partial && i.totalMinutes ? `${formatHM(i.minutes)} of ${formatHM(i.totalMinutes)}` : formatHM(i.minutes)}${i.carried ? ` &middot; <span style="color:${C.accent};">carried over</span>` : ''}</span>
            </td>
          </tr>`,
        )
        .join('');
      return `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;border:1px solid ${C.line};border-radius:10px;">
          <tr><td style="padding:11px 13px ${s.items.length ? '4px' : '11px'};">
            <table role="presentation" width="100%"><tr>
              <td style="font:600 13px/1.2 -apple-system,Segoe UI,Roboto,sans-serif;color:${rest ? C.success : C.fg};">${esc(s.label)}</td>
              <td align="right" style="font:500 12px/1.2 ui-monospace,monospace;color:${C.muted};">${esc(s.start)}&ndash;${esc(s.end)}</td>
            </tr></table>
          </td></tr>
          ${s.items.length ? `<tr><td style="padding:0 13px 8px;"><table role="presentation" width="100%">${rows}</table></td></tr>` : ''}
          ${s.note ? `<tr><td style="padding:0 13px 11px;font:400 11px/1.45 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.faint};">${esc(s.note)}</td></tr>` : ''}
        </table>`;
    })
    .join('') + overflowHtml(d.schedule.overflow);
}

/**
 * What does not fit today. Rendered, never dropped: the previous version showed
 * only the blocks, so a mission too long for any single block vanished from
 * the mail with no explanation.
 */
function overflowHtml(overflow) {
  if (!overflow?.length) return '';
  const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const rows = overflow
    .map(
      (i) =>
        `<p style="margin:0 0 5px;font:400 13px/1.45 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.fg};">&rarr;&nbsp; ${esc(i.title)} <span style="color:${C.faint};">&mdash; ${formatHM(i.minutes)} left</span></p>`,
    )
    .join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;border:1px solid rgba(251,191,36,.28);border-radius:10px;">
      <tr><td style="padding:11px 13px;">
        <p style="margin:0 0 7px;font:600 13px/1.2 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.accent};">Continues tomorrow</p>
        ${rows}
        <p style="margin:6px 0 0;font:400 11px/1.45 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.faint};">Today's blocks are full. This moves to the top of tomorrow's plan rather than coming out of your sleep.</p>
      </td></tr>
    </table>`;
}

/** Named wins from the real day-over-day delta, not a stock compliment. */
export function praiseHtml(p) {
  const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const rows = p.wins
    .map(
      (w) => `
      <tr>
        <td width="12" valign="top" style="padding-top:6px;">
          <div style="width:6px;height:6px;border-radius:50%;background:${C.success};"></div>
        </td>
        <td style="padding:0 0 9px 8px;font:400 14px/1.45 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.fg};">
          <b style="font-weight:600;">${esc(w.label)}</b>
          <span style="display:block;margin-top:2px;font-size:12px;color:${C.muted};">${esc(w.detail)}</span>
        </td>
      </tr>`,
    )
    .join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(52,211,153,.28);background:rgba(52,211,153,.06);border-radius:10px;">
      <tr><td style="padding:13px 14px 6px;font:700 17px/1.25 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.fg};">${esc(p.headline)}</td></tr>
      <tr><td style="padding:0 14px 12px;"><table role="presentation" width="100%">${rows}</table></td></tr>
    </table>`;
}
