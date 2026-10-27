import { useAppState } from '@/hooks/useAppState';
import { AMAZON_DAYOF } from '@/data/amazon';
import { Card } from '@/components/ui/primitives';
import { TaskCheckbox } from '@/components/ui/controls';
import { useAmazonActions } from './useAmazonActions';

/** The interview-day checklist. Ticked the day before, not the morning of. */
export function DayOfList() {
  const state = useAppState();
  const act = useAmazonActions();
  const done = AMAZON_DAYOF.filter((d) => state.amazon.items[d.id]).length;

  return (
    <Card>
      <p className="tnum text-[14px] font-medium text-fg">
        {done} of {AMAZON_DAYOF.length} ready
      </p>
      <p className="mt-1 text-[13px] text-muted">Tick these the day before. General advice, not an Amazon requirement.</p>
      <div className="mt-2 divide-y divide-line">
        {AMAZON_DAYOF.map((d) => (
          <TaskCheckbox
            key={d.id}
            tone="amazon"
            checked={Boolean(state.amazon.items[d.id])}
            onChange={() => act.toggleCheck(d.id)}
            label={d.q}
          />
        ))}
      </div>
    </Card>
  );
}
