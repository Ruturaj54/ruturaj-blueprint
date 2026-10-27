import { NotebookPen } from 'lucide-react';
import { Card, SectionTitle, textareaCls } from '@/components/ui/primitives';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { todayISO } from '@/engine/dates';

/**
 * Free text for the day, stored on the day log. Creating the log here also
 * pins today's plan, so a note written before the first tick still leaves a
 * day that can be scored.
 */
export function DayNotes({ plannedIds }: { plannedIds: string[] }) {
  const state = useAppState();
  const update = useUpdateState();
  const today = todayISO();
  const value = state.days[today]?.notes ?? '';

  return (
    <section>
      <SectionTitle>
        <span className="inline-flex items-center gap-1.5">
          <NotebookPen size={13} />
          Notes &amp; blockers
        </span>
      </SectionTitle>
      <Card>
        <textarea
          value={value}
          rows={4}
          placeholder="What blocked you? What went better than expected? One honest line is enough."
          onChange={(e) => {
            const next = e.target.value;
            update((draft) => {
              const d = (draft.days[today] ??= { planned: plannedIds, completed: [] });
              d.notes = next;
            });
          }}
          className={textareaCls}
        />
      </Card>
    </section>
  );
}
