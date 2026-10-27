import { getPassphrase, flush } from './storage';

/**
 * The only module that talks to the mail functions. Components call these
 * and render the typed result. A failure always carries a sentence the UI
 * can show as-is, plus a reason code for anything that wants to branch.
 */

export type MailType = 'morning' | 'evening';

export interface MailLogEntry {
  date: string;
  type: MailType;
  sentAt: string;
  subject: string;
  ok: boolean;
  test?: boolean;
  error?: string;
}

export interface MailWindow {
  cron: string;
  windowIst: string;
}

export interface MailStatus {
  ok: true;
  configured: { sender: boolean; recipient: boolean; key: boolean };
  recipientMasked: string | null;
  senderMasked: string | null;
  schedule: { morning: MailWindow; evening: MailWindow };
  log: MailLogEntry[];
  now: string;
}

export interface MailPreviewResult {
  ok: true;
  type: MailType;
  subject: string;
  html: string;
  text: string;
}

export interface MailSendResult {
  ok: true;
  type: MailType;
  subject: string;
}

export type MailFailReason = 'no-passphrase' | 'unauthorized' | 'misconfigured' | 'offline' | 'server';

export interface MailFailure {
  ok: false;
  reason: MailFailReason;
  error: string;
}

export type MailResult<T> = T | MailFailure;

const STATUS_URL = '/.netlify/functions/mail-status';
const SEND_URL = '/.netlify/functions/send-email';

const MESSAGES: Record<MailFailReason, string> = {
  'no-passphrase': 'Set the passphrase first. The mail functions are key-gated, so without it nothing here can be read or sent.',
  unauthorized: 'The passphrase does not match the server key. Fix it under Sync and try again.',
  misconfigured: 'The server has no BLUEPRINT_KEY set, so no passphrase can match. Add it in Netlify and redeploy.',
  offline: 'Could not reach the mail function. This only works on the deployed site; the dev server has no functions.',
  server: 'The mail function failed.',
};

function fail(reason: MailFailReason, detail?: string): MailFailure {
  const base = MESSAGES[reason];
  return { ok: false, reason, error: detail ? `${base} (${detail})` : base };
}

type Body = Record<string, unknown>;
type CallResult = { ok: true; body: Body } | MailFailure;

const str = (v: unknown): string => (typeof v === 'string' ? v : '');

/** One request with the key header; every failure mode becomes a MailFailure. */
async function call(url: string, method: 'GET' | 'POST'): Promise<CallResult> {
  const pass = getPassphrase();
  if (!pass) return fail('no-passphrase');
  let res: Response;
  try {
    res = await fetch(url, { method, headers: { 'x-blueprint-key': pass } });
  } catch {
    return fail('offline');
  }
  if (res.status === 401) return fail('unauthorized');
  if (res.status === 503) return fail('misconfigured');
  if (res.status === 404) return fail('offline');
  const body = (await res.json().catch(() => null)) as Body | null;
  if (!body || typeof body !== 'object') return fail('offline');
  if (!res.ok || body.ok === false) return fail('server', str(body.error) || `HTTP ${res.status}`);
  return { ok: true, body };
}

const EMPTY_WINDOW: MailWindow = { cron: '', windowIst: '' };

/** Tolerates a partial payload so a half-deployed function cannot break the panel. */
function normaliseStatus(raw: Body): MailStatus {
  const configured = (raw.configured ?? {}) as Partial<MailStatus['configured']>;
  const schedule = (raw.schedule ?? {}) as Partial<MailStatus['schedule']>;
  return {
    ok: true,
    configured: {
      sender: Boolean(configured.sender),
      recipient: Boolean(configured.recipient),
      key: Boolean(configured.key),
    },
    recipientMasked: str(raw.recipientMasked) || null,
    senderMasked: str(raw.senderMasked) || null,
    schedule: {
      morning: { ...EMPTY_WINDOW, ...schedule.morning },
      evening: { ...EMPTY_WINDOW, ...schedule.evening },
    },
    log: Array.isArray(raw.log) ? (raw.log as MailLogEntry[]) : [],
    now: str(raw.now) || new Date().toISOString(),
  };
}

/** Provider configuration, the cron windows and the last 14 days of sends. */
export async function getMailStatus(): Promise<MailResult<MailStatus>> {
  const r = await call(STATUS_URL, 'GET');
  return r.ok ? normaliseStatus(r.body) : r;
}

/** Builds the mail from the synced state without sending it. */
export async function previewMail(type: MailType): Promise<MailResult<MailPreviewResult>> {
  flush(); // push what is on screen first, so the preview reads it
  const r = await call(`${SEND_URL}?type=${type}&preview=1`, 'POST');
  if (!r.ok) return r;
  return { ok: true, type, subject: str(r.body.subject), html: str(r.body.html), text: str(r.body.text) };
}

/** A real send, now, logged as a test. The scheduled mails are unaffected. */
export async function sendTestMail(type: MailType): Promise<MailResult<MailSendResult>> {
  flush();
  const r = await call(`${SEND_URL}?type=${type}`, 'POST');
  if (!r.ok) return r;
  return { ok: true, type, subject: str(r.body.subject) };
}
