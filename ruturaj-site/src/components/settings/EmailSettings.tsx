import { useState } from 'react';
import { Card, inputCls } from '@/components/ui/primitives';
import { Toggle, Field } from '@/components/ui/controls';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { MailStatusPanel } from './MailStatusPanel';
import { MailActions } from './MailActions';

/** "HH:MM" values from `from` to `to` inclusive, every `stepMinutes`. */
function timeOptions(from: string, to: string, stepMinutes = 15): string[] {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
  };
  const out: string[] = [];
  for (let m = toMin(from); m <= toMin(to); m += stepMinutes) {
    out.push(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
  }
  return out;
}

const MORNING_TIMES = timeOptions('05:30', '09:00');
const EVENING_TIMES = timeOptions('15:30', '19:00');

/** A stored value from before the list existed stays selectable rather than silently moving. */
function withCurrent(list: string[], current: string): string[] {
  return list.includes(current) ? list : [...list, current].sort();
}

/** Enabled toggle and the two send times, then the server panel and the actions. */
export function EmailSettings() {
  const { settings } = useAppState();
  const update = useUpdateState();
  const [reloadKey, setReloadKey] = useState(0);

  const setTime = (key: 'morningEmailTime' | 'eveningEmailTime', value: string) =>
    update((draft) => {
      draft.settings[key] = value;
    });

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <Toggle
          checked={settings.emailEnabled}
          onChange={(v) =>
            update((draft) => {
              draft.settings.emailEnabled = v;
            })
          }
          label="Daily mails"
          hint="Two a day: the morning plan and the evening recap. Off means the scheduled functions skip you."
        />

        <div className="mt-3 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
          <Field label="Morning mail">
            <select
              className={inputCls}
              value={settings.morningEmailTime}
              onChange={(e) => setTime('morningEmailTime', e.target.value)}
            >
              {withCurrent(MORNING_TIMES, settings.morningEmailTime).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Evening mail">
            <select
              className={inputCls}
              value={settings.eveningEmailTime}
              onChange={(e) => setTime('eveningEmailTime', e.target.value)}
            >
              {withCurrent(EVENING_TIMES, settings.eveningEmailTime).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <p className="mt-2 text-[12px] leading-relaxed text-faint">
          Times are Asia/Kolkata. The mails run inside a 15-minute cron window and send at the first
          tick at or after the time you choose, so a mail can land up to fifteen minutes after it.
        </p>
      </Card>

      <MailStatusPanel reloadKey={reloadKey} />
      <MailActions onSent={() => setReloadKey((k) => k + 1)} />
    </div>
  );
}
