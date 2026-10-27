// On-demand mail, behind the shared key: POST ?type=morning|evening.
// With &preview=1 it returns the rendered mail without sending. Without it,
// it sends now and records the send in the log as a test, so the routine
// morning and evening mails are never confused with a button press.

import { getStore } from '@netlify/blobs';
import { authorize, denied, json } from './_shared/auth.mjs';
import { readState, buildDigest, STORE } from './_shared/digest.mjs';
import { buildMorning, buildEvening } from './_shared/templates.mjs';
import { sendMail } from './_shared/mail.mjs';
import { todayISO } from './_shared/engine.mjs';
import { readLog, writeLog, recordEntry, prune } from './_shared/maillog.mjs';

export default async function handler(req) {
  if (req.method !== 'POST') return json({ ok: false, error: 'method not allowed' }, 405);
  const refused = denied(authorize(req));
  if (refused) return refused;

  const url = new URL(req.url);
  const type = url.searchParams.get('type') === 'evening' ? 'evening' : 'morning';
  const preview = url.searchParams.get('preview') === '1';

  try {
    const now = new Date();
    const digest = buildDigest(await readState(), now);
    const mail = type === 'evening' ? buildEvening(digest) : buildMorning(digest);
    if (preview) return json({ ok: true, type, subject: mail.subject, html: mail.html, text: mail.text });

    const result = await sendMail(mail);
    const store = getStore(STORE);
    const log = await readLog(store);
    const date = todayISO(now);
    recordEntry(log, date, 'test', {
      type,
      sentAt: now.toISOString(),
      subject: mail.subject,
      ok: result.ok,
      messageId: result.messageId,
      error: result.ok ? undefined : result.error,
      test: true,
    });
    await writeLog(store, prune(log, 30, date));
    console.log(`send-email: ${type} test ${result.ok ? 'sent' : 'failed'} — ${mail.subject}`);

    return result.ok
      ? json({ ok: true, type, subject: mail.subject, messageId: result.messageId })
      : json({ ok: false, type, subject: mail.subject, error: result.error }, 500);
  } catch (err) {
    console.error('send-email failed:', err);
    return json({ ok: false, type, error: String(err?.message ?? err) }, 500);
  }
}

export const config = { path: '/.netlify/functions/send-email' };
