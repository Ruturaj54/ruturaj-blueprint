import { Moon } from 'lucide-react';
import { Card, inputCls } from '@/components/ui/primitives';
import { Field, Toggle, Banner } from '@/components/ui/controls';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { studyCapacity, roleCapacity, weekdaySleepHours, formatHM } from '@/engine/schedule';
import type { Settings } from '@/lib/schema';
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
  | 'dinnerStart'
  | 'studyBlock2Start'
  | 'studyBlock2End'
  | 'walkEnd'
  | 'studyBlock3End'
  | 'weekendWakeTime'
  | 'weekendSleepTime';

type ToggleKey = 'freelanceEnabled' | 'studyBlock3Enabled' | 'parallelLecture';

interface TimeField {
  key: TimeKey;
  label: string;
  hint?: string;
}

const DAYTIME: TimeField[] = [
  { key: 'wakeTime', label: 'Wake' },
  { key: 'exerciseStart', label: 'Run start' },
  { key: 'exerciseEnd', label: 'Run end' },
  { key: 'officeStart', label: 'Leave for office' },
  { key: 'officeEnd', label: 'Home from office', hint: 'Your own time runs from here to the prep block.' },
  { key: 'studyBlock1Start', label: 'Surprise prep starts' },
];

const LECTURE: TimeField[] = [
  { key: 'studyBlock2Start', label: 'Lecture starts' },
  { key: 'studyBlock2End', label: 'Lecture ends', hint: 'The walk starts here.' },
  { key: 'walkEnd', label: 'Walk ends' },
];

const WEEKEND: TimeField[] = [
  { key: 'weekendWakeTime', label: 'Weekend wake' },
  { key: 'weekendSleepTime', label: 'Weekend sleep' },
];

/**
 * The weekday timetable as time inputs and switches, the weekend wake and
 * sleep, and a live readout of what the settings add up to. Each block ends
 * where the next one starts, so changing one time moves its neighbour too.
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
  const setToggle = (key: ToggleKey, value: boolean) =>
    update((draft) => {
      draft.settings[key] = value;
    });

  const capacity = studyCapacity(settings, 'weekday');
  const lecture = roleCapacity(settings, 'weekday', 'lecture');
  const sleep = weekdaySleepHours(settings);
  const shortSleep = sleep < 7;

  const timeInput = (f: TimeField, disabled = false) => (
    <Field key={f.key} label={f.label} hint={f.hint}>
      <input
        type="time"
        className={cn(inputCls, 'disabled:bg-raised disabled:text-faint')}
        value={settings[f.key]}
        disabled={disabled}
        onChange={(e) => setTime(f.key, e.target.value)}
      />
    </Field>
  );

  return (
    <Card>
      <p className="text-[13px] leading-relaxed text-muted">
        Your weekday. Change a time and the whole day follows it, in the app and in both mails. Saturday and
        Sunday keep their own plan; only their wake and sleep times move.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">{DAYTIME.map((f) => timeInput(f))}</div>

      <div className="mt-4 grid gap-3 border-t border-line pt-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Toggle
            checked={settings.freelanceEnabled}
            onChange={(v) => setToggle('freelanceEnabled', v)}
            label="Freelance block before dinner"
            hint="Off gives that time back to surprise prep. Weekend freelance blocks follow this too."
          />
        </div>
        {timeInput({ key: 'studyBlock1End', label: 'Prep ends · freelance starts' }, !settings.freelanceEnabled)}
        {timeInput({ key: 'dinnerStart', label: 'Dinner starts' })}
      </div>

      <div className="mt-4 grid gap-3 border-t border-line pt-3 sm:grid-cols-2">
        {LECTURE.map((f) => timeInput(f))}
        <div className="sm:col-span-2">
          <Toggle
            checked={settings.parallelLecture}
            onChange={(v) => setToggle('parallelLecture', v)}
            label="Apna College in the lecture block"
            hint="During surprise prep the lecture block holds the next Apna module. Off gives it to prep too."
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-line pt-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Toggle
            checked={settings.studyBlock3Enabled}
            onChange={(v) => setToggle('studyBlock3Enabled', v)}
            label="Revise and plan tomorrow after the walk"
            hint="Off means sleep starts when the walk ends."
          />
        </div>
        {timeInput({ key: 'studyBlock3End', label: 'Lights out' }, !settings.studyBlock3Enabled)}
      </div>

      <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
        {WEEKEND.map((f) => timeInput(f))}
        <OfficeHours
          settings={settings}
          onChange={(n) =>
            update((draft) => {
              draft.settings.officeStudyHours = n;
            })
          }
        />
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <p className="tnum text-[13px] text-fg">
          Weekday study <span className="font-semibold">{formatHM(capacity)}</span>
          <span className="text-faint"> · </span>
          lecture <span className="font-semibold">{formatHM(lecture)}</span>
          <span className="text-faint"> · </span>
          sleep <span className={cn('font-semibold', shortSleep && 'text-warn')}>{sleep} h</span>
        </p>
        {shortSleep && (
          <div className="mt-2">
            <Banner tone="warn" icon={<Moon size={14} className="text-warn" />}>
              Under seven hours. With two workouts a day, recovery needs the sleep; move lights out earlier.
            </Banner>
          </div>
        )}
      </div>
    </Card>
  );
}

function OfficeHours({ settings, onChange }: { settings: Settings; onChange: (n: number) => void }) {
  return (
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
          if (Number.isFinite(n)) onChange(Math.min(3, Math.max(0, n)));
        }}
      />
    </Field>
  );
}
