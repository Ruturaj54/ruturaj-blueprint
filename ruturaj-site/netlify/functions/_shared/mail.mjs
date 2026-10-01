// Transport and layout for the daily mail.
//
// Credentials come from the environment only. Layout is table-based with inline
// styles because Gmail strips <style> blocks and ignores most modern CSS.

import nodemailer from 'nodemailer';

const C = {
  bg: '#08080A',
  surface: '#101014',
  line: '#232329',
  fg: '#F4F4F5',
  muted: '#A1A1AA',
  faint: '#6B6B75',
  accent: '#FBBF24',
  success: '#34D399',
  info: '#38BDF8',
  danger: '#FB7185',
};

/** One font stack everywhere — Gmail ignores web fonts. */
export const FONT = '-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif';

/** Where the mail sends him. Overridable so a rename does not need a code change. */
export const SITE_URL = process.env.SITE_URL || 'https://winner-ruturaj.netlify.app';

export function mailConfig() {
  const user = process.env.SENDER_EMAIL;
  const pass = process.env.SENDER_PASS;
  const to = process.env.MY_EMAIL;
  if (!user || !pass || !to) {
    throw new Error(
      'Missing mail configuration. SENDER_EMAIL, SENDER_PASS and MY_EMAIL must be set in the Netlify environment.',
    );
  }
  return { user, pass, to };
}

/** Retries once — a transient SMTP refusal should not lose the day's mail. */
export async function sendMail({ subject, html, text }) {
  const { user, pass, to } = mailConfig();
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  let lastErr;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const info = await transporter.sendMail({
        from: `Ruturaj Blueprint <${user}>`,
        to,
        subject,
        html,
        text,
      });
      console.log(`mail sent (attempt ${attempt}): ${info.messageId} — ${subject}`);
      return { ok: true, messageId: info.messageId };
    } catch (err) {
      lastErr = err;
      console.error(`mail attempt ${attempt} failed:`, err?.message ?? err);
      if (attempt === 1) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  return { ok: false, error: String(lastErr?.message ?? lastErr) };
}

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** "#RRGGBB" at an opacity, as rgba — 8-digit hex is not safe in every client. */
export function alpha(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** A thin progress bar. Tables, not flex — Outlook and Gmail both render it. */
export function bar(pct, tone = C.accent, height = 6) {
  const w = Math.max(0, Math.min(100, Math.round(pct)));
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,.07);border-radius:99px;"><tr>
    ${w > 0 ? `<td width="${w}%" style="height:${height}px;background:${tone};border-radius:99px;font-size:0;line-height:0;">&nbsp;</td>` : ''}
    ${w < 100 ? `<td style="height:${height}px;font-size:0;line-height:0;">&nbsp;</td>` : ''}
  </tr></table>`;
}

/** Small rounded label. */
export function pill(text, tone = C.muted) {
  return `<span style="display:inline-block;padding:2px 8px;border:1px solid ${alpha(tone, 0.35)};border-radius:99px;font:500 11px/1.5 ${FONT};color:${tone};white-space:nowrap;">${esc(text)}</span>`;
}

/** A bordered card with an optional tinted edge. */
export function card(inner, tone = null) {
  const edge = tone
    ? `border:1px solid ${alpha(tone, 0.28)};background:${alpha(tone, 0.06)};`
    : `border:1px solid ${C.line};`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${edge}border-radius:12px;"><tr><td style="padding:14px 15px;">${inner}</td></tr></table>`;
}

/** Bulleted lines with a coloured dot. Items are { text, sub? }. */
export function bullets(items, tone = C.accent) {
  return items
    .map(
      (it) => `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:7px;"><tr>
        <td width="14" valign="top" style="padding-top:8px;"><div style="width:6px;height:6px;border-radius:50%;background:${tone};"></div></td>
        <td style="font:400 14px/1.5 ${FONT};color:${C.fg};">${esc(it.text)}${it.sub ? `<span style="display:block;margin-top:2px;font-size:12px;color:${C.faint};">${esc(it.sub)}</span>` : ''}</td>
      </tr></table>`,
    )
    .join('');
}

/** A small uppercase label inside a section. */
export function label(text, tone = C.faint) {
  return `<p style="margin:0 0 7px;font:600 10px/1 ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${tone};">${esc(text)}</p>`;
}

export function section(title, inner) {
  return `
    <tr><td style="padding:22px 24px 0;">
      <p style="margin:0 0 10px;font:600 11px/1 -apple-system,Segoe UI,Roboto,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:${C.faint};">${esc(title)}</p>
      ${inner}
    </td></tr>`;
}

export function numberedList(items) {
  if (!items.length) {
    return `<p style="margin:0;font:400 14px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.muted};">Nothing queued — open the roadmap and pull the next milestone forward.</p>`;
  }
  return items
    .map(
      (it, i) => `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
        <tr>
          <td width="26" valign="top" style="font:500 13px/1.6 ui-monospace,monospace;color:${C.faint};">${i + 1}</td>
          <td style="font:400 15px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.fg};">
            ${esc(it.title)}
            ${it.context ? `<span style="display:block;margin-top:3px;font-size:12px;color:${C.faint};">${esc(it.context)}</span>` : ''}
          </td>
        </tr>
      </table>`,
    )
    .join('');
}

export function statRow(stats) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${stats
        .map(
          (s) => `
        <td align="left" style="padding-right:18px;">
          <div style="font:700 24px/1 -apple-system,Segoe UI,Roboto,sans-serif;color:${s.tone ?? C.fg};">${esc(s.value)}</div>
          <div style="margin-top:5px;font:400 10px/1 -apple-system,Segoe UI,Roboto,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:${C.muted};">${esc(s.label)}</div>
        </td>`,
        )
        .join('')}
    </tr></table>`;
}

export function callout(text, tone = C.accent) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-left:3px solid ${tone};background:rgba(255,255,255,.025);">
      <tr><td style="padding:12px 14px;font:400 14px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.fg};">${esc(text)}</td></tr>
    </table>`;
}

export function paragraph(text) {
  return `<p style="margin:0;font:400 14px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.muted};">${esc(text)}</p>`;
}

/** Wraps sections in the dark shell with the day header and footer. */
export function layout({ kicker, day, daysLeft, phase, dateLine = '', body }) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"></head>
<body style="margin:0;padding:0;background:${C.bg};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.surface};border:1px solid ${C.line};border-radius:16px;overflow:hidden;">

        <tr><td style="padding:26px 24px 0;">
          <p style="margin:0 0 6px;font:600 11px/1 -apple-system,Segoe UI,Roboto,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:${C.accent};">${esc(kicker)}</p>
          <p style="margin:0;font:700 38px/1 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.fg};">Day ${day}<span style="font-size:16px;font-weight:400;color:${C.faint};"> / 161</span></p>
          <p style="margin:8px 0 0;font:400 13px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.muted};">${dateLine ? `${esc(dateLine)} &middot; ` : ''}${esc(phase)}</p>
          <p style="margin:2px 0 12px;font:400 12px/1.5 ${FONT};color:${C.faint};">${daysLeft} days to 10 Mar 2027 &middot; ${Math.round((day / 161) * 100)}% of the mission behind you</p>
          ${bar((day / 161) * 100, C.accent, 4)}
        </td></tr>

        ${body}

        <tr><td style="padding:22px 24px 0;">
          <a href="${SITE_URL}/#/today"
             style="display:block;padding:14px 18px;border-radius:10px;background:${C.accent};color:#000;font:600 15px/1 -apple-system,Segoe UI,Roboto,sans-serif;text-align:center;text-decoration:none;">
            Open today&rsquo;s plan &rarr;
          </a>
          <p style="margin:10px 0 0;text-align:center;font:400 11px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.faint};">
            <a href="${SITE_URL}/#/home" style="color:${C.muted};text-decoration:none;">Home</a> &middot;
            <a href="${SITE_URL}/#/dsa" style="color:${C.muted};text-decoration:none;">DSA</a> &middot;
            <a href="${SITE_URL}/#/ai" style="color:${C.muted};text-decoration:none;">AI</a> &middot;
            <a href="${SITE_URL}/#/health" style="color:${C.muted};text-decoration:none;">Health</a> &middot;
            <a href="${SITE_URL}/#/analytics" style="color:${C.muted};text-decoration:none;">Analytics</a>
          </p>
        </td></tr>

        <tr><td style="padding:24px;">
          <div style="border-top:1px solid ${C.line};padding-top:14px;">
            <p style="margin:0;font:400 11px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.faint};">
              Ruturaj Blueprint &middot; 161-day mission, 1 Oct 2026 &rarr; 10 Mar 2027 &middot; AI Engineer / SDE
            </p>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

export { C as COLORS };
