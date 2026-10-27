import { useState } from 'react';
import { Moon } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle, inputCls } from '@/components/ui/primitives';
import { Field } from '@/components/ui/controls';
import { cn } from '@/lib/cn';
import { todayISO, addDays, weekdayOf } from '@/engine/dates';
import { weekdaySleepHours } from '@/engine/schedule';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * Hours slept last night, written through as he types, plus the last seven
 * nights as bars. Private data: it lives only in the synced store.
 */
export function SleepCard() {
  const state = useAppState();
  const update = useUpdateState();
  const today = todayISO();
  const stored = state.health.sleep[today];
  const [draftHours, setDraftHours] = useState(stored === undefined ? '' : String(stored));
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, -6 + i));
  const allowed = weekdaySleepHours(state.settings);
  const values = last7.map((d) => state.health.sleep[d]).filter((v): v is number => typeof v === 'number' && v > 0);
  const avg = values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : null;

  const setHours = (raw: string) => {
    setDraftHours(raw);
    const v = Number(raw);
    update((draft) => {
      if (raw !== '' && Number.isFinite(v) && v > 0) draft.health.sleep[today] = Math.min(14, v);
      else delete draft.health.sleep[today];
    });
  };

  return (
    <section>
      <SectionTitle
        action={
          avg !== null ? (
            <span className="tnum text-[11px] text-faint">
              {avg} h average · {values.length} {values.length === 1 ? 'night' : 'nights'}
            </span>
          ) : undefined
        }
      >
        <span className="inline-flex items-center gap-1.5">
          <Moon size={13} />
          Sleep
        </span>
      </SectionTitle>
      <Card>
        <Field label="Hours slept last night" hint={`Your weekday timetable leaves ${allowed} h between the last block and the alarm.`}>
          <input
            type="number"
            min={0}
            max={14}
            step={0.5}
            inputMode="decimal"
            value={draftHours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="e.g. 6.5"
            className={cn(inputCls, 'tnum font-mono')}
          />
        </Field>

        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {last7.map((d) => {
            const h = state.health.sleep[d];
            return (
              <div key={d} className="text-center">
                <div className="flex h-[56px] items-end rounded-[6px] bg-raised px-1 pb-1">
                  <div
                    className={cn('w-full rounded-[4px]', !h ? 'bg-line' : h >= 7 ? 'bg-success' : h >= 6 ? 'bg-accent' : 'bg-danger')}
                    style={{ height: h ? `${Math.min(100, (h / 9) * 100)}%` : '4px' }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-faint">{DOW[weekdayOf(d)]}</p>
                <p className="tnum text-[10px] text-muted">{h ?? '–'}</p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[12px] text-faint">
          Green from 7 h, blue from 6 h, red below. Six is the weekday floor; the weekend pays it back.
        </p>
      </Card>
    </section>
  );
}
