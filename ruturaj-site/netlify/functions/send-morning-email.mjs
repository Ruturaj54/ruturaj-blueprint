// Scheduled: ticks every 15 minutes from 00:00 to 03:45 UTC (05:30–09:15 IST).
// Each tick asks runScheduled whether the morning mail is due; the send log in
// Blobs guarantees at most one morning mail per mission day, and a tick that
// fails is retried by the next one inside the window.

import { getStore } from '@netlify/blobs';
import { runScheduled } from './_shared/scheduled.mjs';
import { readState, STORE } from './_shared/digest.mjs';
import { sendMail } from './_shared/mail.mjs';

export default async function handler() {
  let status;
  try {
    status = await runScheduled({ type: 'morning', now: new Date(), store: getStore(STORE), readState, send: sendMail });
  } catch (err) {
    status = `failed: morning — ${err?.message ?? err}`;
  }
  console.log(`send-morning-email: ${status}`);
  return new Response(status, { status: status.startsWith('failed') ? 500 : 200 });
}

export const config = { schedule: '0,15,30,45 0-3 * * *' };
