import { useState } from 'react';
import { Plus, FlaskConical, Trash2 } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle, Button, EmptyState } from '@/components/ui/primitives';
import { todayISO, formatShort } from '@/engine/dates';
import { COMMON_MARKERS } from '@/data/health';

const inputCls =
  'w-full rounded-[10px] border border-line bg-bg px-3 py-2.5 text-[14px] text-fg outline-none placeholder:text-faint focus:border-line2';

/**
 * Lab values, verbatim from the report and dated by the report, so a result
 * from last month can be entered today without pretending it is new. The app
 * never interprets a value or supplies a reference range.
 */
export function LabSection() {
  const state = useAppState();
  const update = useUpdateState();
  const [marker, setMarker] = useState('');
  const [value, setValue] = useState('');
  const [range, setRange] = useState('');
  const [date, setDate] = useState(todayISO());

  const add = () => {
    if (!marker.trim() || !value.trim()) return;
    update((draft) => {
      draft.health.labs.unshift({
        id: `lab-${Date.now()}`,
        date,
        marker: marker.trim(),
        value: value.trim(),
        referenceRange: range.trim() || undefined,
      });
      draft.health.labs.sort((a, b) => (a.date < b.date ? 1 : -1));
    });
    setMarker('');
    setValue('');
    setRange('');
  };

  return (
    <section>
      <SectionTitle>
        <span className="inline-flex items-center gap-1.5">
          <FlaskConical size={13} />
          Lab values
        </span>
      </SectionTitle>
      <Card>
        <p className="text-[13px] text-muted">
          Enter each value exactly as the report prints it, with the report&rsquo;s date and its own
          reference range — ranges differ between labs, and the app does not supply one.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            value={marker}
            onChange={(e) => setMarker(e.target.value)}
            placeholder="Marker, e.g. Triglycerides"
            list="lab-markers"
            className={inputCls}
          />
          <datalist id="lab-markers">
            {COMMON_MARKERS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value + unit" className={inputCls} />
          <input value={range} onChange={(e) => setRange(e.target.value)} placeholder="Range from report" className={inputCls} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value || todayISO())} aria-label="Report date" className={inputCls} />
        </div>
        <Button variant="primary" className="mt-2 w-full" onClick={add} disabled={!marker.trim() || !value.trim()}>
          <Plus size={15} />
          Record value
        </Button>

        <label className="mt-4 block border-t border-line pt-4">
          <span className="mb-1.5 block text-[12px] text-muted">Next test date — the mail reminds you a month out</span>
          <input
            type="date"
            value={state.health.nextTestDate ?? ''}
            onChange={(e) =>
              update((draft) => {
                draft.health.nextTestDate = e.target.value || undefined;
              })
            }
            className={inputCls}
          />
        </label>

        {state.health.labs.length === 0 ? (
          <div className="mt-2">
            <EmptyState
              icon={<FlaskConical size={20} />}
              title="No values recorded"
              body="Add your last report now and each new one after a test, so you and your doctor see the trend rather than one isolated number."
            />
          </div>
        ) : (
          <div className="mt-4 space-y-2 border-t border-line pt-4">
            {state.health.labs.map((l) => (
              <div key={l.id} className="flex items-center gap-3 text-[13px]">
                <span className="min-w-0 flex-1 truncate">{l.marker}</span>
                <span className="tnum font-mono">{l.value}</span>
                {l.referenceRange && (
                  <span className="tnum hidden font-mono text-[11px] text-faint sm:inline">ref {l.referenceRange}</span>
                )}
                <span className="tnum text-[11px] text-faint">{formatShort(l.date)}</span>
                <button
                  onClick={() =>
                    update((draft) => {
                      draft.health.labs = draft.health.labs.filter((x) => x.id !== l.id);
                    })
                  }
                  aria-label={`Remove ${l.marker}`}
                  className="grid size-[32px] place-items-center text-faint hover:text-danger"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}
