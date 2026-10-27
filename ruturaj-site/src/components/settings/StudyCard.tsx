import { Card, inputCls } from '@/components/ui/primitives';
import { Field } from '@/components/ui/controls';
import { useAppState, useUpdateState } from '@/hooks/useAppState';

type NumberKey = 'deepWorkMinutes' | 'dsaTargetPerDay';

/** The two study numbers: the deep-work timer length and the weekday DSA target. */
export function StudyCard() {
  const { settings } = useAppState();
  const update = useUpdateState();

  const setNumber = (key: NumberKey, raw: string, min: number, max: number) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    update((draft) => {
      draft.settings[key] = Math.min(max, Math.max(min, Math.round(n)));
    });
  };

  return (
    <Card>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Deep work block (minutes)" hint="The length of the deep-work timer on My Day.">
          <input
            type="number"
            min={10}
            max={120}
            step={5}
            inputMode="numeric"
            className={inputCls}
            value={settings.deepWorkMinutes}
            onChange={(e) => setNumber('deepWorkMinutes', e.target.value, 10, 120)}
          />
        </Field>
        <Field
          label="DSA problems per day"
          hint="The weekday count in the roadmap's DSA mission. Sunday's timed set stays at three."
        >
          <input
            type="number"
            min={1}
            max={10}
            inputMode="numeric"
            className={inputCls}
            value={settings.dsaTargetPerDay}
            onChange={(e) => setNumber('dsaTargetPerDay', e.target.value, 1, 10)}
          />
        </Field>
      </div>
    </Card>
  );
}
