// The send log that makes "exactly two mails a day" true (CLAUDE.md rule 10).
//
// Lives in Netlify Blobs next to the state. Shape:
//   { days: { [date]: { morning?: Entry, evening?: Entry, tests?: Entry[] } }, updatedAt }
//   Entry { sentAt, subject, messageId?, ok, error?, test? }
// Every helper here is pure except readLog/writeLog, which take any store with
// get(key, { type: 'json' }) and setJSON(key, value), so tests pass a Map-backed one.

import { addDays } from './engine.mjs';

export const MAIL_LOG_KEY = 'mail-log';

/** Ticks keep retrying inside this many minutes after the target; after that the mail is simply missed. */
export const WINDOW_MINUTES = 240;

/** A pending claim (written before the send) blocks re-sends for this long. */
export const PENDING_MINUTES = 20;

export function emptyLog() {
  return { days: {}, updatedAt: null };
}

const toMinutes = (hhmm) => {
  const [h, m] = String(hhmm ?? '').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * True for a successful send, or for a claim written less than PENDING_MINUTES
 * ago (the send is in flight or its result write failed). A failed attempt
 * must not block the retry; an old abandoned claim must not either.
 */
export function alreadySent(log, date, type, now = null) {
  const entry = log?.days?.[date]?.[type];
  if (!entry) return false;
  if (entry.ok) return true;
  if (entry.pending && now) {
    const age = (now.getTime() - Date.parse(entry.sentAt)) / 60_000;
    return Number.isFinite(age) && age >= 0 && age < PENDING_MINUTES;
  }
  return false;
}

/** True when the clock has not yet reached the target (as opposed to past the window). */
export function isBeforeTarget(nowMinutes, targetHHMM) {
  return nowMinutes < toMinutes(targetHHMM);
}

/**
 * A tick may send when it is at or after the target and still inside the
 * window. Before the target: wait. Past the window: the day's mail is skipped
 * rather than bursting late.
 */
export function shouldSendNow({ nowMinutes, targetHHMM }) {
  const target = toMinutes(targetHHMM);
  return nowMinutes >= target && nowMinutes < target + WINDOW_MINUTES;
}

/**
 * Records one attempt. `type` is 'morning', 'evening' or 'test'; a test entry
 * is appended to tests[] and keeps the kind of mail it was in `entry.type`.
 */
export function recordEntry(log, date, type, entry) {
  const days = (log.days ??= {});
  const day = (days[date] ??= {});
  const clean = {
    sentAt: entry.sentAt,
    subject: entry.subject,
    ok: Boolean(entry.ok),
    ...(entry.messageId ? { messageId: entry.messageId } : {}),
    ...(entry.error ? { error: String(entry.error) } : {}),
    ...(entry.pending ? { pending: true } : {}),
    ...(entry.test || type === 'test' ? { test: true, type: entry.type === 'evening' ? 'evening' : 'morning' } : {}),
  };
  if (type === 'test') (day.tests ??= []).push(clean);
  else day[type] = clean;
  return log;
}

/** Drops days older than `keepDays` before the newest date in the log (or `today` when given). */
export function prune(log, keepDays = 30, today = null) {
  const dates = Object.keys(log?.days ?? {}).sort();
  const anchor = today ?? dates[dates.length - 1];
  if (!anchor) return log;
  const cutoff = addDays(anchor, -keepDays);
  for (const d of dates) if (d < cutoff) delete log.days[d];
  return log;
}

/** The last `days` worth of entries, newest first, flattened for the status endpoint. */
export function recentEntries(log, days = 14, today = null) {
  const dates = Object.keys(log?.days ?? {}).sort().reverse();
  const anchor = today ?? dates[0];
  const cutoff = anchor ? addDays(anchor, -(days - 1)) : '';
  const out = [];
  for (const date of dates) {
    if (date < cutoff) break;
    const day = log.days[date];
    for (const type of ['evening', 'morning']) {
      if (day[type]) out.push(flat(date, type, day[type]));
    }
    for (const t of [...(day.tests ?? [])].reverse()) out.push(flat(date, t.type ?? 'morning', t));
  }
  return out.sort((a, b) => (a.sentAt < b.sentAt ? 1 : a.sentAt > b.sentAt ? -1 : 0));
}

/** One flat row: `type` is always the kind of mail; `test` says whether a button sent it. */
const flat = (date, type, e) => ({
  date,
  type,
  sentAt: e.sentAt,
  subject: e.subject,
  ok: e.ok,
  test: Boolean(e.test),
  error: e.error ?? (e.pending ? 'send did not complete' : null),
});

/** Throws on a read failure: an unreadable log must stop the tick, never be treated as empty. */
export async function readLog(store) {
  const data = await store.get(MAIL_LOG_KEY, { type: 'json' });
  return data && typeof data === 'object' ? { ...emptyLog(), ...data, days: data.days ?? {} } : emptyLog();
}

export async function writeLog(store, log) {
  log.updatedAt = new Date().toISOString();
  await store.setJSON(MAIL_LOG_KEY, log);
  return log;
}
