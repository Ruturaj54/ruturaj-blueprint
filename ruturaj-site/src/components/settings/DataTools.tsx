import { useState, useRef } from 'react';
import { Download, Upload, TriangleAlert, RotateCcw } from 'lucide-react';
import { Card, SectionTitle, Button } from '@/components/ui/primitives';
import * as storage from '@/lib/storage';
import { todayISO } from '@/engine/dates';

/** Backup, restore and reset. Split out to keep Settings under 300 lines. */
export function DataTools() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importNote, setImportNote] = useState<string | null>(null);
  const [resetStep, setResetStep] = useState<0 | 1>(0);
  const [resetNote, setResetNote] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  const exportBackup = () => {
    // Exports the whole state object, so nothing can be silently omitted the
    // way the old app's hand-listed key array dropped three stores.
    const blob = new Blob([storage.exportState()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blueprint-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        storage.replaceState(JSON.parse(String(e.target?.result)));
        setImportNote('Backup restored.');
      } catch {
        setImportNote('That file could not be read as a backup.');
      }
      setTimeout(() => setImportNote(null), 3000);
    };
    reader.readAsText(file);
  };

  const doReset = async () => {
    setResetting(true);
    const r = await storage.resetAll();
    setResetting(false);
    setResetStep(0);
    setResetNote(
      r.remoteCleared
        ? 'Everything cleared, here and on the server. You are back to a clean Day 1.'
        : r.localCleared
          ? 'Cleared in this browser, but the server was not reachable. Reconnect and reset again, or the old data may sync back.'
          : 'Could not clear local storage. Try a normal window rather than private browsing.',
    );
  };

  return (
    <>
      {/* ---- backup ---- */}
      <section>
        <SectionTitle>Backup</SectionTitle>
        <Card>
          <p className="text-[13px] text-muted">
            Exports the complete state in one object — foundation ticks, tasks, day logs, DSA
            attempts, runs, work, applications, health and settings.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button onClick={exportBackup} className="flex-1">
              <Download size={15} />
              Export backup
            </Button>
            <Button onClick={() => fileRef.current?.click()} className="flex-1">
              <Upload size={15} />
              Import backup
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importBackup(f);
                e.target.value = '';
              }}
            />
          </div>
          {importNote && <p className="mt-2 text-[12px] text-muted">{importNote}</p>}
        </Card>
      </section>

      {/* ---- reset ---- */}
      <section>
        <SectionTitle>Start over</SectionTitle>
        <Card className="border-danger/25">
          <p className="text-[13px] text-muted">
            Clears every tick, task, day log, DSA attempt, run, achievement and health entry —
            here and on the server — and puts you back to a clean Day 1. Your sync passphrase and
            your schedule settings are kept. This cannot be undone.
          </p>

          {resetStep === 0 ? (
            <Button variant="danger" className="mt-3 w-full" onClick={() => setResetStep(1)}>
              <RotateCcw size={15} />
              Reset all progress
            </Button>
          ) : (
            <div className="mt-3 rounded-[10px] border border-danger/30 bg-danger/[0.05] p-3">
              <div className="flex items-start gap-2">
                <TriangleAlert size={15} className="mt-0.5 shrink-0 text-danger" />
                <div className="min-w-0">
                  <p className="text-[13px]">
                    This wipes everything permanently. Export a backup first if there is anything
                    here worth keeping.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="danger" size="sm" onClick={() => void doReset()} disabled={resetting}>
                      {resetting ? 'Clearing…' : 'Yes, wipe everything'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setResetStep(0)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {resetNote && <p className="mt-2 text-[12px] text-muted">{resetNote}</p>}
        </Card>
      </section>
    </>
  );
}
