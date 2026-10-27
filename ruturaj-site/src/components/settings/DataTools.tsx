import { useState, useRef } from 'react';
import { Download, Upload, RotateCcw } from 'lucide-react';
import { Card, SectionTitle, Button } from '@/components/ui/primitives';
import * as storage from '@/lib/storage';
import { todayISO } from '@/engine/dates';
import { ConfirmAction } from './ConfirmAction';

/** Backup, restore and the full reset. Two sections, so Settings stays short. */
export function DataTools() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importNote, setImportNote] = useState<string | null>(null);
  const [resetNote, setResetNote] = useState<string | null>(null);

  const exportBackup = () => {
    // The whole state object, so nothing can be silently left out of a backup.
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
        setImportNote('Backup restored and pushed to the server.');
      } catch {
        setImportNote('That file could not be read as a backup.');
      }
      setTimeout(() => setImportNote(null), 3000);
    };
    reader.readAsText(file);
  };

  const doReset = async () => {
    const r = await storage.resetAll();
    setResetNote(
      r.remoteCleared
        ? 'Everything cleared, here and on the server. Day 1 is not started; press Start when you are ready.'
        : r.localCleared
          ? 'Cleared in this browser, but the server was not reachable. Reconnect and reset again, or the old data may sync back.'
          : 'Could not clear local storage. Try a normal window rather than private browsing.',
    );
  };

  return (
    <>
      <section>
        <SectionTitle>Backup</SectionTitle>
        <Card>
          <p className="text-[13px] leading-relaxed text-muted">
            Exports the complete state as one JSON file: programme, Amazon tracker, foundation and
            course ticks, day logs, DSA attempts, deep-work sessions, runs, work, applications, health
            records and settings. Import replaces everything with that file and pushes it to the
            server.
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
          {importNote && <p className="mt-2 text-[12.5px] text-muted">{importNote}</p>}
        </Card>
      </section>

      <section>
        <SectionTitle>Start over</SectionTitle>
        <Card className="border-danger/25">
          <p className="text-[13px] leading-relaxed text-muted">
            Clears progress here and on the server and puts you back to a clean, not-yet-started Day
            1: the Amazon tracker (every logged problem, tick and note; the stage goes back to
            awaiting invitation), the programme (Day 1 and phase), foundation and course ticks, day
            logs, DSA attempts, deep-work sessions, runs and weekly reviews.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Kept: the timetable and every other setting, the sync passphrase, work achievements,
            applications, and the weight and lab records. This cannot be undone.
          </p>
          <div className="mt-3 flex flex-col">
            <ConfirmAction
              variant="danger"
              tone="danger"
              icon={<RotateCcw size={15} />}
              label="Reset all progress"
              confirmLabel="Yes, wipe everything"
              busyLabel="Clearing"
              explain="This wipes progress permanently, here and on the server. Export a backup first if there is anything worth keeping."
              onConfirm={doReset}
            />
          </div>
          {resetNote && <p className="mt-2 text-[12.5px] text-muted">{resetNote}</p>}
        </Card>
      </section>
    </>
  );
}
