// Progress store — GET reads, PUT writes.
//
// This exists so the scheduled email functions can see real progress. They run
// server-side and have no access to the browser's localStorage, which is why
// the old morning email could only ever send a date-derived day counter.
//
// Auth is a single shared passphrase in BLUEPRINT_KEY. That is proportionate:
// one user, one device set, no accounts. It is not a login system and is not
// meant to be one.

import { getStore } from '@netlify/blobs';
import { timingSafeEqual } from 'node:crypto';

const STORE = 'blueprint';
const KEY = 'state';

function authorized(req) {
  const expected = process.env.BLUEPRINT_KEY;
  // With no key configured the endpoint stays shut rather than open.
  if (!expected) return false;

  const supplied = req.headers.get('x-blueprint-key') ?? '';
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  // timingSafeEqual throws on length mismatch, so compare lengths first — the
  // length of a passphrase is not the secret.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export default async function handler(req) {
  if (!authorized(req)) {
    return json({ error: 'unauthorized' }, 401);
  }

  const store = getStore(STORE);

  if (req.method === 'GET') {
    try {
      const data = await store.get(KEY, { type: 'json' });
      // No blob yet is a normal first run, not an error.
      return json(data ?? {});
    } catch (err) {
      console.error('sync GET failed:', err);
      return json({ error: 'read failed' }, 500);
    }
  }

  if (req.method === 'PUT') {
    try {
      const body = await req.json();
      if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        return json({ error: 'expected a state object' }, 400);
      }
      await store.setJSON(KEY, body);
      return json({ ok: true, updatedAt: body.updatedAt ?? null });
    } catch (err) {
      console.error('sync PUT failed:', err);
      return json({ error: 'write failed' }, 500);
    }
  }

  return json({ error: 'method not allowed' }, 405);
}

export const config = { path: '/.netlify/functions/sync' };
