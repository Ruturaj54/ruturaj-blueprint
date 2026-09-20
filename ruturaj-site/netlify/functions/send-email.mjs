// On-demand send, used by the "Send test email" button.
// Gated by the same shared key as the progress store so a public URL cannot be
// used to fire mail at Ruturaj on demand.

import { timingSafeEqual } from 'node:crypto';
import { readState, buildDigest } from './_shared/digest.mjs';
import { buildMorning, buildEvening } from './_shared/templates.mjs';
import { sendMail } from './_shared/mail.mjs';

function authorized(req) {
  const expected = process.env.BLUEPRINT_KEY;
  if (!expected) return false;
  const supplied = req.headers.get('x-blueprint-key') ?? '';
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export default async function handler(req) {
  if (!authorized(req)) return json({ error: 'unauthorized' }, 401);

  const url = new URL(req.url);
  const type = url.searchParams.get('type') === 'evening' ? 'evening' : 'morning';

  try {
    const digest = buildDigest(await readState());
    const mail = type === 'evening' ? buildEvening(digest) : buildMorning(digest);
    const result = await sendMail(mail);
    return result.ok
      ? json({ ok: true, type, subject: mail.subject })
      : json({ ok: false, error: result.error }, 500);
  } catch (err) {
    console.error('send-email failed:', err);
    return json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
}

export const config = { path: '/.netlify/functions/send-email' };
