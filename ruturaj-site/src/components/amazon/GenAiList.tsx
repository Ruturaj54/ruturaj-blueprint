import { useAppState } from '@/hooks/useAppState';
import { AMAZON_GENAI } from '@/data/amazon';
import { Card } from '@/components/ui/primitives';
import { TaskCheckbox } from '@/components/ui/controls';
import { Proof } from './Proof';
import { useAmazonActions } from './useAmazonActions';

/** The 12 GenAI questions candidates reported, with the project to use for each. */
export function GenAiList() {
  const state = useAppState();
  const act = useAmazonActions();
  const done = AMAZON_GENAI.filter((g) => state.amazon.items[g.id]).length;

  return (
    <div className="space-y-3">
      <Card>
        <p className="tnum text-[14px] font-medium text-fg">
          {done} of {AMAZON_GENAI.length} answers ready
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">
          Round 3 in several 2026 loops was a GenAI conversation before any code. Tick a question once you can answer it in
          two minutes with a real example from your own work, said aloud.
        </p>
      </Card>
      <Card className="divide-y divide-line p-2">
        {AMAZON_GENAI.map((g) => (
          <div key={g.id} className="py-0.5">
            <TaskCheckbox
              tone="amazon"
              checked={Boolean(state.amazon.items[g.id])}
              onChange={() => act.toggleCheck(g.id)}
              label={g.q}
              sublabel={g.s ? `Use: ${g.s}` : undefined}
            />
            <div className="px-3 pb-2">
              <Proof src={g.src} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
