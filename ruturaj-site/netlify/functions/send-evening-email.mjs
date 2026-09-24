// Scheduled — 02:30 IST = 21:00 UTC daily. The end-of-day recap.
//
// Moved from 22:00. That was the exact minute the night block starts, so the
// "end of day" mail reported on a day that was only half over — it said
// "DSA 0 of 3" every night because DSA happens 22:00–02:00. At 02:30 the day is
// genuinely finished; the 04:00 day boundary means it still reports on that
// day rather than the one just starting.
//
// §20: planned vs actual, what was achieved, what carries to tomorrow.

import { readState, buildDigest } from './_shared/digest.mjs';
import { buildEvening } from './_shared/templates.mjs';
import { sendMail } from './_shared/mail.mjs';

export default async function handler() {
  const state = await readState();
  const digest = buildDigest(state);

  if (digest.beforeStart) {
    console.log('end-of-day mail skipped — mission has not started yet');
    return new Response('skipped: before mission start', { status: 200 });
  }
  if (state?.settings?.emailEnabled === false) {
    console.log('end-of-day mail skipped — disabled in settings');
    return new Response('skipped: disabled', { status: 200 });
  }
  if (digest.todayLog?.recapSent) {
    // He closed the day early and asked for the recap himself. Sending the
    // same mail again at 02:30 would only train him to ignore it.
    console.log('end-of-day mail skipped — recap already sent on demand');
    return new Response('skipped: recap already sent', { status: 200 });
  }

  const result = await sendMail(buildEvening(digest));
  return new Response(result.ok ? 'sent' : `failed: ${result.error}`, {
    status: result.ok ? 200 : 500,
  });
}

export const config = { schedule: '0 21 * * *' };
