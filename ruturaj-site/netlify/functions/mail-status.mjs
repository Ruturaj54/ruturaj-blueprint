// GET, behind the shared key: is mail configured, when do the two routine
// mails go, and what went out in the last 14 days. Addresses are masked;
// the full address never leaves the server.

import { getStore } from '@netlify/blobs';
import { authorize, denied, json, mask } from './_shared/auth.mjs';
import { readState, STORE } from './_shared/digest.mjs';
import { parseState, istClock, todayISO } from './_shared/engine.mjs';
import { readLog, recentEntries } from './_shared/maillog.mjs';
import { CRONS } from './_shared/crons.mjs';

export default async function handler(req) {
  if (req.method !== 'GET') return json({ ok: false, error: 'method not allowed' }, 405);
  const refused = denied(authorize(req));
  if (refused) return refused;

  try {
    const now = new Date();
    const today = todayISO(now);
    const state = parseState(await readState());
    const log = await readLog(getStore(STORE));
    const sender = process.env.SENDER_EMAIL;
    const recipient = process.env.MY_EMAIL;

    return json({
      ok: true,
      configured: { sender: Boolean(sender), recipient: Boolean(recipient), key: true },
      senderMasked: mask(sender),
      recipientMasked: mask(recipient),
      emailEnabled: state.settings.emailEnabled,
      schedule: {
        morning: { ...CRONS.morning, configured: state.settings.morningEmailTime },
        evening: { ...CRONS.evening, configured: state.settings.eveningEmailTime },
      },
      log: recentEntries(log, 14, today),
      now: istClock(now),
      today,
    });
  } catch (err) {
    console.error('mail-status failed:', err);
    return json({ ok: false, error: String(err?.message ?? err) }, 500);
  }
}

export const config = { path: '/.netlify/functions/mail-status' };
