import { Card, inputCls } from '@/components/ui/primitives';
import { Field } from '@/components/ui/controls';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { daySlots } from '@/engine/schedule';

/**
 * Runs are morning-only and the evening is the walk, so there is no slot to
 * choose here: the readout shows where both sit, and the walk target is his.
 */
export function ExerciseSettings() {
  const { settings } = useAppState();
  const update = useUpdateState();
  const slots = daySlots(settings, 'weekday', 'morning');
  const run = slots.find((s) => s.kind === 'move');
  const walk = slots.find((s) => s.kind === 'walk');

  return (
    <Card>
      <div className="space-y-1.5 text-[13px] text-fg">
        {run && (
          <p>
            Weekday run <span className="tnum font-medium">{run.start} – {run.end}</span>
            <span className="text-muted"> · move it with Exercise start and end under Timetable</span>
          </p>
        )}
        {walk && (
          <p>
            Evening walk <span className="tnum font-medium">{walk.start} – {walk.end}</span>
            <span className="text-muted"> · in the society, while you call home</span>
          </p>
        )}
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <Field label="Walk target (km)" hint="Today’s numbers show the walk against this, and the week counts the days you reached it.">
          <input
            type="number"
            min={1}
            max={20}
            step={0.5}
            inputMode="decimal"
            className={inputCls}
            value={settings.walkTargetKm}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isFinite(n) || n <= 0) return;
              update((draft) => {
                draft.settings.walkTargetKm = Math.min(20, Math.max(1, Math.round(n * 2) / 2));
              });
            }}
          />
        </Field>
      </div>

      <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
        Runs are in the morning only. Any single day can be marked as rest on My Day or on Fitness, and that
        morning&rsquo;s timetable follows.
      </p>
    </Card>
  );
}
