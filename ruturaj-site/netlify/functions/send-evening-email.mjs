// Scheduled: ticks every 15 minutes from 10:00 to 13:45 UTC (15:30–19:15 IST).
// The evening mail goes at his configured time (17:00 by default, as he
// leaves the office). Same guard as the morning: the send log allows one
// evening mail per mission day and the next tick retries a failed send.

import { getStore } from '@netlify/blobs';
import { runScheduled } from './_shared/scheduled.mjs';
import { readState, STORE } from './_shared/digest.mjs';
import { sendMail } from './_shared/mail.mjs';

export default async function handler() {
  let status;
  try {
    status = await runScheduled({ type: 'evening', now: new Date(), store: getStore(STORE), readState, send: sendMail });
  } catch (err) {
    status = `failed: evening — ${err?.message ?? err}`;
  }
  console.log(`send-evening-email: ${status}`);
  return new Response(status, { status: status.startsWith('failed') ? 500 : 200 });
}

export const config = { schedule: '0,15,30,45 10-13 * * *' };
