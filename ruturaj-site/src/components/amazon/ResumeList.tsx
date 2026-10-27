import { useAppState } from '@/hooks/useAppState';
import { AMAZON_RESUME } from '@/data/amazon';
import { Card } from '@/components/ui/primitives';
import { TaskCheckbox } from '@/components/ui/controls';
import { useAmazonActions } from './useAmazonActions';

/** The 13 resume items with the questions the tracker expects on each. */
export function ResumeList() {
  const state = useAppState();
  const act = useAmazonActions();
  const done = AMAZON_RESUME.filter((r) => state.amazon.items[r.id]).length;

  return (
    <div className="space-y-3">
      <Card>
        <p className="tnum text-[14px] font-medium text-fg">
          {done} of {AMAZON_RESUME.length} deep dives ready
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">
          Round 2, the hiring manager and the Bar Raiser all dig into your resume. For each item, prepare a 2-minute and a
          10-minute version. Tick an item when both exist and you have said the 2-minute one aloud.
        </p>
      </Card>
      <Card className="divide-y divide-line p-2">
        {AMAZON_RESUME.map((r) => (
          <TaskCheckbox
            key={r.id}
            tone="amazon"
            checked={Boolean(state.amazon.items[r.id])}
            onChange={() => act.toggleCheck(r.id)}
            label={r.t}
            sublabel={r.q}
          />
        ))}
      </Card>
    </div>
  );
}
