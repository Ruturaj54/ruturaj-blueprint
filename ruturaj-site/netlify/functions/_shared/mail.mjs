// Transport and the light-theme layout for the two daily mails.
//
// Credentials come from the environment only. The HTML is table-based with
// inline styles because Gmail strips <style> blocks and ignores most modern
// CSS. Tokens mirror design.md; orange is reserved for the Amazon label/button.

import nodemailer from 'nodemailer';

export const C = {
  paper: '#F6F4EF',
  card: '#FFFFFF',
  raised: '#F1EEE8',
  line: '#E6E1D8',
  fg: '#1C2333',
  muted: '#5C6578',
  faint: '#8B93A3',
  accent: '#2B57D9',
  success: '#1F8A5B',
  warn: '#B4731A',
  danger: '#C43D3D',
  info: '#1F7AA6',
  amazon: '#D9770A',
};

/** One font stack everywhere; Gmail ignores web fonts. */
export const FONT = '-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif';
export const MONO = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';

/** Where the buttons send him. Overridable so a rename needs no code change. */
export const SITE_URL = process.env.SITE_URL || 'https://winner-ruturaj.netlify.app';

export function mailConfig() {
  const user = process.env.SENDER_EMAIL;
  const pass = process.env.SENDER_PASS;
  const to = process.env.MY_EMAIL;
  if (!user || !pass || !to) {
    throw new Error('Missing mail configuration: SENDER_EMAIL, SENDER_PASS and MY_EMAIL must be set in the Netlify environment.');
  }
  return { user, pass, to };
}

/** Gmail SMTP with one retry; a transient refusal must not lose the day's mail. */
export async function sendMail({ subject, html, text }) {
  const { user, pass, to } = mailConfig();
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user, pass },
    // Two attempts must fit inside the 30 s scheduled-function limit.
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
  });

  let lastErr;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const info = await transporter.sendMail({ from: `Ruturaj Blueprint <${user}>`, to, subject, html, text });
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

/* ---------- primitives ----------------------------------------------------- */

export const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const TIER_TONE = { P0: C.danger, P1: C.warn, P2: C.info, P3: C.faint };

/** Small rounded label. A tier ("P0") picks its own colour; anything else uses `tone`. */
export function pill(text, tone = C.muted) {
  const color = TIER_TONE[text] ?? tone;
  return `<span style="display:inline-block;padding:1px 7px;border:1px solid ${color};border-radius:999px;font:500 11px/1.5 ${MONO};color:${color};white-space:nowrap;">${esc(text)}</span>`;
}

export function paragraph(text, { tone = C.muted, size = 14 } = {}) {
  return `<p style="margin:0;font:400 ${size}px/1.55 ${FONT};color:${tone};">${esc(text)}</p>`;
}

export function link(text, href, tone = C.accent) {
  return `<a href="${esc(href)}" style="color:${tone};text-decoration:underline;">${esc(text)}</a>`;
}

/** A white card with a hairline border; `tone` adds a coloured left edge. */
export function card(inner, tone = null) {
  const edge = tone ? `border-left:3px solid ${tone};` : '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.card};border:1px solid ${C.line};${edge}border-radius:14px;"><tr><td style="padding:14px 16px;">${inner}</td></tr></table>`;
}

/** A titled block of the body. The title is small, uppercase and muted. */
export function section(title, inner, tone = C.muted) {
  const head = title
    ? `<p style="margin:0 0 8px;font:600 11px/1 ${FONT};letter-spacing:.12em;text-transform:uppercase;color:${tone};">${esc(title)}</p>`
    : '';
  return `<tr><td style="padding:18px 20px 0;">${head}${inner}</td></tr>`;
}

/**
 * Compact rows: a narrow mono lead (time or number), the text, and optional
 * sub-lines underneath. Items: { lead, text | html, subs?: (string | { html })[], tone? }.
 */
export function rows(items) {
  if (!items.length) return paragraph('Nothing here today.');
  return items
    .map((it) => {
      const subs = (it.subs ?? [])
        .filter(Boolean)
        .map((s) => `<div style="margin-top:2px;font:400 12.5px/1.45 ${FONT};color:${C.muted};">${s.html ?? esc(s)}</div>`)
        .join('');
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 7px;"><tr>
  <td width="84" valign="top" style="padding-top:1px;font:500 12px/1.5 ${MONO};color:${it.tone ?? C.faint};white-space:nowrap;">${esc(it.lead ?? '')}</td>
  <td valign="top" style="font:400 14px/1.45 ${FONT};color:${C.fg};">${it.html ?? esc(it.text ?? '')}${subs}</td>
</tr></table>`;
    })
    .join('');
}

/** A full-width button. Blue by default; orange only for the Amazon CTA. */
export function button(label, href, tone = C.accent) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="border-radius:12px;background:${tone};">
  <a href="${esc(href)}" style="display:block;padding:14px 18px;border-radius:12px;font:600 15px/1 ${FONT};color:#FFFFFF;text-align:center;text-decoration:none;">${esc(label)}</a>
</td></tr></table>`;
}

/** The shell: ivory paper, one 560px white card, kicker, title, subtitle, body rows, CTA. */
export function layout({ kicker, title, subtitle = '', body, cta, kickerTone = C.accent }) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.paper};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};padding:20px 10px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.card};border:1px solid ${C.line};border-radius:14px;">
        <tr><td style="padding:22px 20px 0;">
          <p style="margin:0 0 6px;font:600 11px/1 ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${kickerTone};">${esc(kicker)}</p>
          <p style="margin:0;font:700 24px/1.2 ${FONT};color:${C.fg};">${esc(title)}</p>
          ${subtitle ? `<p style="margin:6px 0 0;font:400 14px/1.5 ${FONT};color:${C.muted};">${esc(subtitle)}</p>` : ''}
        </td></tr>
        ${body}
        ${cta ? `<tr><td style="padding:22px 20px 0;">${button(cta.label, cta.href, cta.tone ?? C.accent)}</td></tr>` : ''}
        <tr><td style="padding:18px 20px 20px;">
          <p style="margin:0;padding-top:12px;border-top:1px solid ${C.line};font:400 11px/1.5 ${FONT};color:${C.faint};">Ruturaj Blueprint · <a href="${SITE_URL}/#/settings" style="color:${C.faint};">mail settings</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
