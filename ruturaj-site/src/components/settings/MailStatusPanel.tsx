import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, CheckCircle2, XCircle, FlaskConical } from 'lucide-react';
import { Card, Chip, Button } from '@/components/ui/primitives';
import { Banner } from '@/components/ui/controls';
import { getMailStatus, type MailStatus, type MailFailure, type MailLogEntry, type MailWindow } from '@/lib/mail-api';
import { useSyncStatus } from '@/hooks/useAppState';

/** An ISO timestamp as "26 Oct, 06:02" on the IST clock; falls back to the raw string. */
function istStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function ConfigChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <Chip tone={ok ? 'success' : 'danger'}>
      {ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
      {label}
    </Chip>
  );
}

function ScheduleBox({ label, win }: { label: string; win: MailWindow }) {
  return (
    <div className="rounded-[10px] border border-line bg-raised px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.1em] text-muted">{label} window</p>
      <p className="tnum mt-0.5 text-[13px] font-medium text-fg">{win.windowIst || 'Not reported'}</p>
      {win.cron && <p className="tnum mt-0.5 font-mono text-[11px] text-faint">cron {win.cron}</p>}
    </div>
  );
}

function LogRow({ entry }: { entry: MailLogEntry }) {
  return (
    <li className="flex items-start gap-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] text-fg">{entry.subject || '(no subject)'}</p>
        <p className="tnum mt-0.5 text-[11.5px] text-muted">
          {istStamp(entry.sentAt)} · {entry.type}
          {entry.error ? ` · ${entry.error}` : ''}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {entry.test && (
          <Chip tone="info">
            <FlaskConical size={11} />
            test
          </Chip>
        )}
        <Chip tone={entry.ok ? 'success' : 'danger'}>{entry.ok ? 'sent' : 'failed'}</Chip>
      </div>
    </li>
  );
}

/**
 * What the server knows: provider configured or not, the masked recipient,
 * the cron windows and the last 14 days of sends. Loads on mount and again
 * whenever `reloadKey` changes (after a test send).
 */
export function MailStatusPanel({ reloadKey }: { reloadKey: number }) {
  const [status, setStatus] = useState<MailStatus | null>(null);
  const [failure, setFailure] = useState<MailFailure | null>(null);
  const [loading, setLoading] = useState(true);
  const sync = useSyncStatus();

  const load = useCallback(async () => {
    setLoading(true);
    const r = await getMailStatus();
    if (r.ok) {
      setStatus(r);
      setFailure(null);
    } else {
      setFailure(r);
    }
    setLoading(false);
  }, []);

  // Reloads after a test send and whenever the sync status settles, so saving
  // the passphrase under Sync refreshes this panel without a page reload.
  useEffect(() => {
    if (sync === 'syncing') return;
    void load();
  }, [load, reloadKey, sync]);

  const log = status ? [...status.log].sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1)) : [];
  const allSet = Boolean(status && status.configured.sender && status.configured.recipient && status.configured.key);

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-semibold text-fg">Server status</p>
        <Button variant="ghost" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : undefined} />
          {loading ? 'Checking' : 'Refresh'}
        </Button>
      </div>

      {failure && (
        <div className="mt-3">
          <Banner tone={failure.reason === 'offline' ? 'default' : 'warn'}>{failure.error}</Banner>
        </div>
      )}

      {status && (
        <>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <ConfigChip ok={status.configured.sender} label="Sender" />
            <ConfigChip ok={status.configured.recipient} label="Recipient" />
            <ConfigChip ok={status.configured.key} label="Server key" />
          </div>
          <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
            {allSet
              ? 'Provider configured.'
              : 'Provider not fully configured; the scheduled mails cannot send until every value is set in Netlify.'}
            {status.recipientMasked && (
              <>
                {' '}
                Sends to <span className="tnum font-medium text-fg">{status.recipientMasked}</span>
                {status.senderMasked && (
                  <>
                    {' '}
                    from <span className="font-medium text-fg">{status.senderMasked}</span>
                  </>
                )}
                .
              </>
            )}{' '}
            The address itself lives in the Netlify env var MY_EMAIL and is never stored in the app.
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <ScheduleBox label="Morning" win={status.schedule.morning} />
            <ScheduleBox label="Evening" win={status.schedule.evening} />
          </div>

          <div className="mt-4 border-t border-line pt-3">
            <p className="text-[12px] font-medium text-muted">Sends in the last 14 days</p>
            {log.length === 0 ? (
              <p className="mt-1 text-[13px] text-faint">Nothing logged yet.</p>
            ) : (
              <ul className="mt-1 divide-y divide-line">
                {log.map((e, i) => (
                  <LogRow key={`${e.sentAt}-${i}`} entry={e} />
                ))}
              </ul>
            )}
          </div>
          <p className="mt-2 text-[11.5px] text-faint">Checked {istStamp(status.now)} IST.</p>
        </>
      )}

      {!status && !failure && loading && <p className="mt-3 text-[13px] text-muted">Checking the mail functions...</p>}
    </Card>
  );
}
