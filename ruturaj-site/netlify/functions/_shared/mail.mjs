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
  danger: '#FB7185',
};

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

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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
export function layout({ kicker, day, daysLeft, phase, body }) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${C.bg};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.surface};border:1px solid ${C.line};border-radius:16px;overflow:hidden;">

        <tr><td style="padding:26px 24px 0;">
          <p style="margin:0 0 6px;font:600 11px/1 -apple-system,Segoe UI,Roboto,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:${C.accent};">${esc(kicker)}</p>
          <p style="margin:0;font:700 38px/1 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.fg};">Day ${day}<span style="font-size:16px;font-weight:400;color:${C.faint};"> / 117</span></p>
          <p style="margin:8px 0 0;font:400 13px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.muted};">${esc(phase)} &middot; ${daysLeft} days to 15 Jan 2027</p>
        </td></tr>

        ${body}

        <tr><td style="padding:24px;">
          <div style="border-top:1px solid ${C.line};padding-top:14px;">
            <p style="margin:0;font:400 11px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;color:${C.faint};">
              Ruturaj Blueprint &middot; 117-day mission &middot; AI Engineer / SDE
            </p>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

export { C as COLORS };
