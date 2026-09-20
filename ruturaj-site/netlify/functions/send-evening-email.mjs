// Scheduled — 22:00 IST = 16:30 UTC daily.
// §20: the accountability mail — planned vs actual, score, recovery plan.

import { readState, buildDigest } from './_shared/digest.mjs';
import { buildEvening } from './_shared/templates.mjs';
import { sendMail } from './_shared/mail.mjs';

export default async function handler() {
  const state = await readState();
  const digest = buildDigest(state);

  if (digest.beforeStart) {
    console.log('evening mail skipped — mission has not started yet');
    return new Response('skipped: before mission start', { status: 200 });
  }
  if (state?.settings?.emailEnabled === false) {
    console.log('evening mail skipped — disabled in settings');
    return new Response('skipped: disabled', { status: 200 });
  }

  const result = await sendMail(buildEvening(digest));
  return new Response(result.ok ? 'sent' : `failed: ${result.error}`, {
    status: result.ok ? 200 : 500,
  });
}

export const config = { schedule: '30 16 * * *' };
