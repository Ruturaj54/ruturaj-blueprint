// The shared-passphrase gate for the on-demand endpoints (send-email,
// mail-status). Same BLUEPRINT_KEY as the progress store; compared in
// constant time after a length check, because timingSafeEqual throws on
// mismatched lengths and the length of a passphrase is not the secret.

import { timingSafeEqual } from 'node:crypto';

/**
 * 'ok', 'no_server_key' or 'mismatch'. The two failures stay separate, as in
 * sync.mjs: an unset key is a deploy problem (503), a wrong passphrase a typo
 * (401), and the app shows a different sentence for each.
 */
export function authorize(req) {
  const expected = process.env.BLUEPRINT_KEY;
  if (!expected) return 'no_server_key';
  const supplied = req.headers.get('x-blueprint-key') ?? '';
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return 'mismatch';
  return timingSafeEqual(a, b) ? 'ok' : 'mismatch';
}

export const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/** The JSON response for a failed authorize(), or null when authorised. */
export function denied(auth) {
  if (auth === 'ok') return null;
  if (auth === 'no_server_key') {
    console.error('BLUEPRINT_KEY is not set in the Netlify environment.');
    return json({ ok: false, error: 'no_server_key', detail: 'BLUEPRINT_KEY is not set in the Netlify environment.' }, 503);
  }
  return json({ ok: false, error: 'unauthorized' }, 401);
}

/** "ruturaj@example.com" -> "r•••@example.com". The full address never leaves the server. */
export function mask(address) {
  const s = String(address ?? '');
  if (!s) return null;
  const at = s.indexOf('@');
  if (at <= 0) return '•••';
  return `${s.charAt(0)}•••@${s.slice(at + 1)}`;
}
