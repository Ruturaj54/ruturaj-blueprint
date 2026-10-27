import { useEffect, useState } from 'react';
import { KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card, Button, Chip, inputCls } from '@/components/ui/primitives';
import { useSyncStatus } from '@/hooks/useAppState';
import * as storage from '@/lib/storage';
import type { SyncStatus } from '@/lib/storage';

const STATUS: Record<SyncStatus, { label: string; tone: 'default' | 'info' | 'success' | 'danger' }> = {
  idle: { label: 'This device only', tone: 'default' },
  syncing: { label: 'Syncing', tone: 'info' },
  synced: { label: 'Synced', tone: 'success' },
  offline: { label: 'Offline', tone: 'default' },
  unauthorized: { label: 'Key rejected', tone: 'danger' },
  misconfigured: { label: 'Server key unset', tone: 'danger' },
};

/** Passphrase entry, the live sync status and a manual pull from the server. */
export function SyncCard() {
  const status = useSyncStatus();
  const [pass, setPass] = useState(() => storage.getPassphrase() ?? '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return undefined;
    const t = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(t);
  }, [saved]);

  const save = () => {
    storage.setPassphrase(pass.trim());
    setSaved(true);
    void storage.pullRemote();
  };

  const chip = STATUS[status];

  return (
    <Card>
      <p className="text-[13px] leading-relaxed text-muted">
        Your progress lives in this browser. The passphrase also syncs it to the server, so the daily
        mails read real progress and the phone and laptop stay in step.
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="password"
          autoComplete="off"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Passphrase (BLUEPRINT_KEY)"
          aria-label="Sync passphrase"
          className={inputCls}
        />
        <Button variant="primary" onClick={save} disabled={!pass.trim()} className="sm:shrink-0">
          {saved ? <CheckCircle2 size={15} /> : <KeyRound size={15} />}
          {saved ? 'Saved' : 'Save & sync'}
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <Chip tone={chip.tone}>{chip.label}</Chip>
        <Button variant="ghost" size="md" onClick={() => void storage.pullRemote()} disabled={status === 'syncing'}>
          <RefreshCw size={14} className={status === 'syncing' ? 'animate-spin' : undefined} />
          Pull from server
        </Button>
      </div>

      {status === 'unauthorized' && (
        <p className="mt-2 text-[12.5px] leading-relaxed text-danger">
          The server has a BLUEPRINT_KEY, but this passphrase does not match it. Check for a trailing
          space or a case difference, and confirm the value in Netlify.
        </p>
      )}
      {status === 'misconfigured' && (
        <p className="mt-2 text-[12.5px] leading-relaxed text-danger">
          BLUEPRINT_KEY is not set on the server at all, so nothing you type here can match. Add it in
          Netlify under Site settings, Environment variables, then redeploy.
        </p>
      )}
      {status === 'idle' && !storage.getPassphrase() && (
        <p className="mt-2 text-[12.5px] text-faint">
          No passphrase yet: everything stays on this device and the mails cannot see it.
        </p>
      )}
    </Card>
  );
}
