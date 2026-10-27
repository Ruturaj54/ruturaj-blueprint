import { Code2, Trash2 } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle, Chip, EmptyState } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { formatShort } from '@/engine/dates';
import { patternName } from '@/data/tasks/dsa';
import type { DsaOutcome } from '@/engine/types';

const OUTCOME_LABEL: Record<DsaOutcome, string> = {
  solved: 'Solved clean',
  solved_with_hint: 'Solved with a hint',
  failed: 'Failed',
};

const OUTCOME_DOT: Record<DsaOutcome, string> = {
  solved: 'bg-success',
  solved_with_hint: 'bg-info',
  failed: 'bg-danger',
};

/** The latest logged attempts, newest first, each deletable. */
export function RecentProblems({ limit = 12 }: { limit?: number }) {
  const state = useAppState();
  const update = useUpdateState();
  const recent = [...state.dsa].reverse().slice(0, limit);

  const remove = (id: string) =>
    update((draft) => {
      draft.dsa = draft.dsa.filter((x) => x.id !== id);
    });

  return (
    <section>
      <SectionTitle action={<span className="tnum text-[11px] text-faint">{state.dsa.length} logged in total</span>}>
        Recent problems
      </SectionTitle>
      {recent.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Code2 size={22} />}
            title="No problems logged"
            body="Every solve you log feeds the weakness engine and the streak. Nothing counts until it is logged."
          />
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-line">
            {recent.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-1.5 text-[13px] first:pt-0 last:pb-0">
                <span
                  className={cn('size-[8px] shrink-0 rounded-full', OUTCOME_DOT[a.outcome])}
                  role="img"
                  aria-label={OUTCOME_LABEL[a.outcome]}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-fg">{a.problem}</p>
                  <p className="tnum truncate text-[11px] text-faint">
                    {patternName(a.pattern)} · {a.minutes} min · {formatShort(a.date)}
                    {a.revision ? ' · revision' : ''}
                  </p>
                </div>
                <Chip>{a.difficulty}</Chip>
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  aria-label={`Delete ${a.problem}`}
                  className="-mr-2 grid size-[44px] shrink-0 place-items-center rounded-full text-faint transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-line pt-3 text-[11px] text-faint">
            Green dot: solved clean · blue: needed a hint · red: failed.
          </p>
        </Card>
      )}
    </section>
  );
}
