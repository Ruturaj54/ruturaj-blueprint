// Scheduled — 07:00 IST = 01:30 UTC daily.
// §19: the morning mission mail, built from real stored progress.

import { readState, buildDigest } from './_shared/digest.mjs';
import { buildMorning } from './_shared/templates.mjs';
import { sendMail } from './_shared/mail.mjs';

export default async function handler() {
  const state = await readState();
  const digest = buildDigest(state);

  if (digest.beforeStart) {
    console.log('morning mail skipped — mission has not started yet');
    return new Response('skipped: before mission start', { status: 200 });
  }
  if (state?.settings?.emailEnabled === false) {
    console.log('morning mail skipped — disabled in settings');
    return new Response('skipped: disabled', { status: 200 });
  }
  if (!digest.hasState) {
    console.warn('morning mail: no state blob yet — sending with defaults');
  }

  const result = await sendMail(buildMorning(digest));
  return new Response(result.ok ? 'sent' : `failed: ${result.error}`, {
    status: result.ok ? 200 : 500,
  });
}

export const config = { schedule: '30 1 * * *' };
