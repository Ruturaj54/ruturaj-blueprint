import { Card } from '@/components/ui/primitives';
import { Segmented } from '@/components/ui/controls';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { daySlots } from '@/engine/schedule';

type Slot = 'morning' | 'evening';

const SLOTS: ReadonlyArray<{ id: Slot; label: string }> = [
  { id: 'morning', label: 'Morning' },
  { id: 'evening', label: 'Evening' },
];

/** The default exercise slot; the readout is the routine entry it produces. */
export function ExerciseSettings() {
  const { settings } = useAppState();
  const update = useUpdateState();
  const move = daySlots(settings, 'weekday').find((s) => s.kind === 'move');

  return (
    <Card>
      <p className="mb-1.5 text-[12px] font-medium text-muted">Preferred slot on weekdays</p>
      <Segmented
        value={settings.exerciseSlot}
        options={SLOTS}
        onChange={(v) =>
          update((draft) => {
            draft.settings.exerciseSlot = v;
          })
        }
        layoutId="settings-exercise-slot"
      />
      {move && (
        <p className="mt-3 text-[13px] text-fg">
          On a weekday that puts <span className="font-medium">{move.label}</span> at{' '}
          <span className="tnum font-medium">
            {move.start} – {move.end}
          </span>
          .
        </p>
      )}
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
        This is only the default. Any single day can be switched to the other slot, or to rest, on
        My Day or on Fitness, and that day&rsquo;s timetable follows.
      </p>
    </Card>
  );
}
