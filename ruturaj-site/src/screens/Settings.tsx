import { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAppState, useUpdateState, useSyncStatus } from '@/hooks/useAppState';
import { Card, SectionTitle, Button, Chip } from '@/components/ui/primitives';
import { listContainer } from '@/lib/motion';
import * as storage from '@/lib/storage';
import { DataTools } from '@/components/settings/DataTools';
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
  const [pass, setPass] = useState(storage.getPassphrase() ?? '');
  const [passSaved, setPassSaved] = useState(false);

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

      <DataTools />

    </motion.div>
  );
}
