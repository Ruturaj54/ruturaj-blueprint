import { useState } from 'react';
import { Copy, Trash2, TriangleAlert, Building2 } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle, Chip, EmptyState } from '@/components/ui/primitives';
import { Stat } from '@/components/ui/controls';
import { todayISO, formatShort, weekStartISO } from '@/engine/dates';
import { WorkComposer } from './WorkComposer';

/** The achievement log: the counts, the composer, and every statement so far. */
export function WorkLog() {
  const state = useAppState();
  const update = useUpdateState();
  const [copied, setCopied] = useState<string | null>(null);
  const thisWeek = weekStartISO(todayISO());
  const weekCount = state.work.filter((w) => weekStartISO(w.date) === thisWeek).length;
  const needMetric = state.work.filter((w) => w.metricNeeded).length;

  const copy = (text: string, id: string) => {
    void navigator.clipboard?.writeText(text);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1600);
  };

  const remove = (id: string) =>
    update((draft) => {
      draft.work = draft.work.filter((x) => x.id !== id);
    });

  return (
    <>
      <Card>
        <div className="flex items-center gap-2 text-muted">
          <Building2 size={15} />
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em]">Parallel Wireless</p>
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          Strong performance here is not a distraction from the switch; it is the material your resume and your
          references are made of. Capture the work while you still remember the detail.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat value={state.work.length} label="Logged" />
          <Stat value={weekCount} label="This week" tone="accent" />
          <Stat value={needMetric} label="Need a metric" tone={needMetric > 0 ? 'warn' : 'default'} />
        </div>
      </Card>

      <WorkComposer />

      <section>
        <SectionTitle>Achievement log</SectionTitle>
        {state.work.length === 0 ? (
          <EmptyState
            icon={<Building2 size={22} />}
            title="Nothing logged yet"
            body="Add one line every Friday. By March that is a resume section you did not have to reconstruct from memory."
          />
        ) : (
          <div className="space-y-3">
            {state.work.map((w) => (
              <Card key={w.id}>
                <p className="text-[14px] leading-relaxed">{w.statement ?? w.raw}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="tnum text-[11px] text-faint">{formatShort(w.date)}</span>
                  {w.tags.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                  {w.metricNeeded && (
                    <Chip tone="warn">
                      <TriangleAlert size={11} />
                      Metric needed
                    </Chip>
                  )}
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-success">{copied === w.id ? 'Copied to clipboard.' : ''}</span>
                  <span className="flex">
                    <button
                      type="button"
                      onClick={() => copy(w.statement ?? w.raw, w.id)}
                      aria-label="Copy statement"
                      className="grid size-[44px] place-items-center rounded-[10px] text-faint transition-colors hover:bg-raised hover:text-fg"
                    >
                      <Copy size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(w.id)}
                      aria-label="Delete"
                      className="grid size-[44px] place-items-center rounded-[10px] text-faint transition-colors hover:bg-danger-soft hover:text-danger"
                    >
                      <Trash2 size={15} />
                    </button>
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
