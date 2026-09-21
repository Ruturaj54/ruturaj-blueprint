import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, KeyRound, Clock, CheckCircle2, RefreshCw, TriangleAlert, RotateCcw } from 'lucide-react';
import { useAppState, useUpdateState, useSyncStatus } from '@/hooks/useAppState';
import { Card, SectionTitle, Button, Chip } from '@/components/ui/primitives';
import { listContainer } from '@/lib/motion';
import * as storage from '@/lib/storage';
import { todayISO } from '@/engine/dates';
import type { Settings as SettingsShape } from '@/lib/schema';

const inputCls =
  'h-[42px] w-full rounded-[10px] border border-line bg-bg px-3 text-[14px] text-fg outline-none placeholder:text-faint focus:border-line2';

/** Only the string-valued "HH:MM" settings belong in the time grid. */
type TimeKey =
  | 'wakeTime'
  | 'morningRunTime'
  | 'officeStart'
  | 'officeEnd'
  | 'eveningRunTime'
  | 'studyBlock1Start'
  | 'studyBlock1End'
  | 'studyBlock2Start'
  | 'studyBlock2End'
  | 'morningEmailTime'
  | 'eveningEmailTime';

const TIME_FIELDS: Array<{ key: TimeKey; label: string }> = [
  { key: 'wakeTime', label: 'Wake up' },
  { key: 'morningRunTime', label: 'Morning run' },
  { key: 'officeStart', label: 'Office start' },
  { key: 'officeEnd', label: 'Office end' },
  { key: 'studyBlock1Start', label: 'Study block 1 start' },
  { key: 'studyBlock1End', label: 'Study block 1 end' },
  { key: 'eveningRunTime', label: 'Evening run' },
  { key: 'studyBlock2Start', label: 'Night block start' },
  { key: 'studyBlock2End', label: 'Night block end' },
  { key: 'morningEmailTime', label: 'Morning email' },
  { key: 'eveningEmailTime', label: 'Evening email' },
];

export function Settings() {
  const state = useAppState();
  const update = useUpdateState();
  const syncStatus = useSyncStatus();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pass, setPass] = useState(storage.getPassphrase() ?? '');
  const [passSaved, setPassSaved] = useState(false);
  const [importNote, setImportNote] = useState<string | null>(null);
  const [resetStep, setResetStep] = useState<0 | 1>(0);
  const [resetNote, setResetNote] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  /** Generic so each call is checked against that field's own type. */
  const setField = <K extends keyof SettingsShape>(key: K, value: SettingsShape[K]) => {
    update((draft) => {
      draft.settings[key] = value;
    });
  };

  const savePass = () => {
    storage.setPassphrase(pass.trim());
    setPassSaved(true);
    void storage.pullRemote();
    setTimeout(() => setPassSaved(false), 2000);
  };

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
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-7">
      {/* ---- sync ---- */}
      <section>
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5">
            <KeyRound size={13} />
            Sync
          </span>
        </SectionTitle>
        <Card>
          <p className="text-[13px] text-muted">
            Your progress lives in this browser. Entering the passphrase also syncs it to the server,
            which is what lets the daily emails reference what you actually did — and keeps your
            phone and laptop in step.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Passphrase (BLUEPRINT_KEY)"
              className={inputCls}
            />
            <Button variant="primary" onClick={savePass} disabled={!pass.trim()}>
              {passSaved ? <CheckCircle2 size={15} /> : <KeyRound size={15} />}
              {passSaved ? 'Saved' : 'Save & sync'}
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Chip
              tone={
                syncStatus === 'synced'
                  ? 'success'
                  : syncStatus === 'unauthorized'
                    ? 'default'
                    : 'default'
              }
            >
              {syncStatus}
            </Chip>
            <button
              onClick={() => void storage.pullRemote()}
              className="inline-flex items-center gap-1.5 text-[12px] text-muted hover:text-fg"
            >
              <RefreshCw size={12} />
              Pull from server
            </button>
          </div>
          {syncStatus === 'unauthorized' && (
            <p className="mt-2 text-[12px] text-danger">
              The server has a BLUEPRINT_KEY, but this passphrase does not match it. Check for a
              trailing space or a case difference, and confirm the value in Netlify.
            </p>
          )}
          {syncStatus === 'misconfigured' && (
            <p className="mt-2 text-[12px] text-danger">
              BLUEPRINT_KEY is not set on the server at all, so nothing you type here can match.
              Add it in Netlify under Site settings &rarr; Environment variables, then redeploy.
            </p>
          )}
        </Card>
      </section>

      {/* ---- schedule ---- */}
      <section>
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} />
            Daily schedule
          </span>
        </SectionTitle>
        <Card>
          <p className="text-[13px] text-muted">
            Nothing here is hardcoded. Change a time and the planner and emails follow it.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {TIME_FIELDS.map((f) => (
              <label key={String(f.key)} className="block">
                <span className="mb-1.5 block text-[12px] text-muted">{f.label}</span>
                <input
                  type="time"
                  value={state.settings[f.key]}
                  onChange={(e) => setField(f.key, e.target.value)}
                  className={inputCls}
                />
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[12px] text-muted">
                Deep work block (minutes)
              </span>
              <input
                type="number"
                min={10}
                max={120}
                value={state.settings.deepWorkMinutes}
                onChange={(e) => setField('deepWorkMinutes', Number(e.target.value))}
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] text-muted">Office study hours</span>
              <input
                type="number"
                min={0}
                max={6}
                step={0.5}
                value={state.settings.officeStudyHours}
                onChange={(e) => setField('officeStudyHours', Number(e.target.value))}
                className={inputCls}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] text-muted">DSA problems per day</span>
              <input
                type="number"
                min={1}
                max={10}
                value={state.settings.dsaTargetPerDay}
                onChange={(e) => setField('dsaTargetPerDay', Number(e.target.value))}
                className={inputCls}
              />
            </label>
          </div>

          <label className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="text-[14px]">Daily emails</span>
            <button
              onClick={() => setField('emailEnabled', !state.settings.emailEnabled)}
              role="switch"
              aria-checked={state.settings.emailEnabled}
              className={`relative h-[26px] w-[46px] rounded-full transition-colors ${
                state.settings.emailEnabled ? 'bg-success' : 'bg-white/10'
              }`}
            >
              <motion.span
                animate={{ x: state.settings.emailEnabled ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="absolute top-[3px] size-[20px] rounded-full bg-white"
              />
            </button>
          </label>
        </Card>
      </section>

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
    </motion.div>
  );
}
