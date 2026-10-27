// The one routine both scheduled functions run. Everything is injected
// (clock, store, state reader, sender) so scripts/test-mail.mjs can drive it
// with an in-memory store and a fake sender, and no test ever sends mail.

import { parseState, todayISO, istClock, istMinutes } from './engine.mjs';
import { buildDigest } from './digest.mjs';
import { buildMorning, buildEvening } from './templates.mjs';
import { alreadySent, isBeforeTarget, shouldSendNow, recordEntry, prune, readLog, writeLog } from './maillog.mjs';

const message = (err) => String(err?.message ?? err);

/**
 * Decides whether this tick sends, and sends at most once per mission day
 * and type. Reads that fail stop the tick (the next one retries); a claim is
 * written before the send so a crash after SMTP accepted the mail cannot
 * resend it. Returns "sent: …", "failed: …" or "skipped: …".
 */
export async function runScheduled({ type, now = new Date(), store, readState, send }) {
  if (type !== 'morning' && type !== 'evening') return `skipped: unknown type ${String(type)}`;
  const clock = istClock(now);
  const date = todayISO(now);

  let raw;
  try {
    raw = await readState();
  } catch (err) {
    return `failed: ${type} for ${date} — state unreadable, nothing sent (${message(err)})`;
  }
  const state = parseState(raw);
  if (!state.settings.emailEnabled) return 'skipped: mail is turned off in Settings';

  const target = type === 'morning' ? state.settings.morningEmailTime : state.settings.eveningEmailTime;
  const minutes = istMinutes(now);
  if (!shouldSendNow({ nowMinutes: minutes, targetHHMM: target })) {
    return isBeforeTarget(minutes, target)
      ? `skipped: before window (${clock} IST, ${type} target ${target})`
      : `skipped: past the window (${clock} IST, ${type} target ${target})`;
  }

  let log;
  try {
    log = await readLog(store);
  } catch (err) {
    return `failed: ${type} for ${date} — mail log unreadable, nothing sent (${message(err)})`;
  }
  if (alreadySent(log, date, type, now)) return `skipped: ${type} already sent for ${date}`;

  const digest = buildDigest(raw, now);
  const mail = type === 'morning' ? buildMorning(digest) : buildEvening(digest);

  recordEntry(log, date, type, { sentAt: now.toISOString(), subject: mail.subject, ok: false, pending: true });
  try {
    await writeLog(store, prune(log, 30, date));
  } catch (err) {
    return `failed: ${type} for ${date} — could not claim the send, nothing sent (${message(err)})`;
  }

  const result = await send(mail);
  recordEntry(log, date, type, {
    sentAt: now.toISOString(),
    subject: mail.subject,
    ok: result.ok,
    messageId: result.messageId,
    error: result.ok ? undefined : result.error ?? 'send failed',
  });
  try {
    await writeLog(store, log);
  } catch (err) {
    // The pending claim already in the store blocks a resend for PENDING_MINUTES.
    console.error(`maillog: could not record the ${type} result:`, message(err));
  }

  return result.ok
    ? `sent: ${type} for ${date} at ${clock} IST — ${mail.subject}`
    : `failed: ${type} for ${date} at ${clock} IST — ${result.error ?? 'send failed'}`;
}
