import { Moon } from 'lucide-react';
import { Card, inputCls } from '@/components/ui/primitives';
import { Field, Toggle, Banner } from '@/components/ui/controls';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { studyCapacity, weekdaySleepHours, formatHM } from '@/engine/schedule';
import { cn } from '@/lib/cn';

/** Only the "HH:MM" settings; the engine resolves the rest of the day from these. */
type TimeKey =
  | 'wakeTime'
  | 'exerciseStart'
  | 'exerciseEnd'
  | 'officeStart'
  | 'officeEnd'
  | 'studyBlock1Start'
  | 'studyBlock1End'
  | 'studyBlock2Start'
  | 'studyBlock2End'
  | 'walkEnd'
  | 'studyBlock3End'
  | 'weekendWakeTime'
  | 'weekendSleepTime';

interface TimeField {
  key: TimeKey;
  label: string;
  hint?: string;
}

const DAYTIME: TimeField[] = [
  { key: 'wakeTime', label: 'Wake' },
  { key: 'exerciseStart', label: 'Exercise start' },
  { key: 'exerciseEnd', label: 'Exercise end' },
  { key: 'officeStart', label: 'Leave for office' },
  { key: 'officeEnd', label: 'Home from office' },
];

const BLOCK1: TimeField[] = [
  { key: 'studyBlock1Start', label: 'Study block 1 start' },
  { key: 'studyBlock1End', label: 'Study block 1 end' },
];

const BLOCK2: TimeField[] = [
  { key: 'studyBlock2Start', label: 'Study block 2 start' },
  { key: 'studyBlock2End', label: 'Study block 2 end' },
  { key: 'walkEnd', label: 'Walk ends', hint: 'The walk runs from the end of block 2.' },
];

const WEEKEND: TimeField[] = [
  { key: 'weekendWakeTime', label: 'Weekend wake' },
  { key: 'weekendSleepTime', label: 'Weekend sleep' },
];

/**
 * The weekday timetable as time inputs, the weekend wake and sleep, and a
 * live readout of what the settings add up to. Dinner is not a field: it is
 * whatever sits between block 1 and block 2.
 */
export function TimetableSettings() {
  const { settings } = useAppState();
  const update = useUpdateState();

  const setTime = (key: TimeKey, value: string) => {
    if (!value) return; // a cleared field keeps its last value instead of breaking the day
    update((draft) => {
      draft.settings[key] = value;
    });
  };

  const capacity = studyCapacity(settings, 'weekday');
  const sleep = weekdaySleepHours(settings);
  const shortSleep = sleep < 6;

  const timeInput = (f: TimeField) => (
    <Field key={f.key} label={f.label} hint={f.hint}>
      <input type="time" className={inputCls} value={settings[f.key]} onChange={(e) => setTime(f.key, e.target.value)} />
    </Field>
  );

  return (
    <Card>
      <p className="text-[13px] leading-relaxed text-muted">
        Your weekday. Change a time and the whole day follows it, in the app and in the morning mail.
        Saturday and Sunday keep their own plan; only their wake and sleep times move.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">{DAYTIME.map(timeInput)}</div>

      <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
        {BLOCK1.map(timeInput)}
        <div className="rounded-[10px] border border-line bg-raised px-3 py-2 text-[12.5px] text-muted sm:col-span-2">
          Dinner and rest:{' '}
          <span className="tnum font-medium text-fg">
            {settings.studyBlock1End} – {settings.studyBlock2Start}
          </span>
          , the gap between block 1 and block 2.
        </div>
        {BLOCK2.map(timeInput)}
      </div>

      <div className="mt-4 grid gap-3 border-t border-line pt-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Toggle
            checked={settings.studyBlock3Enabled}
            onChange={(v) =>
              update((draft) => {
                draft.settings.studyBlock3Enabled = v;
              })
            }
            label="Final block after the walk"
            hint="Revision and lighter items only. Off means sleep starts when the walk ends."
          />
        </div>
        <Field label="Final block end">
          <input
            type="time"
            className={cn(inputCls, 'disabled:bg-raised disabled:text-faint')}
            value={settings.studyBlock3End}
            disabled={!settings.studyBlock3Enabled}
            onChange={(e) => setTime('studyBlock3End', e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
        {WEEKEND.map(timeInput)}
        <Field label="Office spare study hours" hint="Light reading only; not counted as study capacity.">
          <input
            type="number"
            min={0}
            max={3}
            step={0.5}
            inputMode="decimal"
            className={inputCls}
            value={settings.officeStudyHours}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isFinite(n)) return;
              update((draft) => {
                draft.settings.officeStudyHours = Math.min(3, Math.max(0, n));
              });
            }}
          />
        </Field>
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <p className="tnum text-[13px] text-fg">
          Weekday study capacity <span className="font-semibold">{formatHM(capacity)}</span>
          <span className="text-faint"> · </span>
          Weekday sleep <span className={cn('font-semibold', shortSleep && 'text-warn')}>{sleep} h</span>
        </p>
        {shortSleep && (
          <div className="mt-2">
            <Banner tone="warn" icon={<Moon size={14} className="text-warn" />}>
              Below six hours. Turn the final block off or end it earlier.
            </Banner>
          </div>
        )}
      </div>
    </Card>
  );
}
