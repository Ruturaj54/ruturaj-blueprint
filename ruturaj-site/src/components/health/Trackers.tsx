import { useState } from 'react';
import { Plus, Trash2, FlaskConical, Pill } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle, Button, Chip, EmptyState } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { todayISO, formatShort } from '@/engine/dates';

const inputCls =
  'w-full rounded-[10px] border border-line bg-bg px-3 py-2.5 text-[14px] text-fg outline-none placeholder:text-faint focus:border-line2';

export function SupplementSection() {
  const state = useAppState();
  const update = useUpdateState();
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [directedBy, setDirectedBy] = useState<'doctor' | 'self'>('doctor');
  const today = todayISO();
  const takenToday = state.health.adherence[today] ?? [];

  const add = () => {
    if (!name.trim()) return;
    update((draft) => {
      draft.health.supplements.push({
        id: `sup-${Date.now()}`,
        name: name.trim(),
        dose: dose.trim(),
        directedBy,
        startedOn: today,
        active: true,
      });
    });
    setName('');
    setDose('');
  };

  return (
    <section>
      <SectionTitle>
        <span className="inline-flex items-center gap-1.5">
          <Pill size={13} />
          Supplements
        </span>
      </SectionTitle>
      <Card>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className={inputCls}
          />
          <input
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            placeholder="Dose exactly as prescribed"
            className={inputCls}
          />
        </div>
        <div className="mt-2 flex gap-1.5">
          {(
            [
              ['doctor', 'Doctor-directed'],
              ['self', 'Self-added'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setDirectedBy(id)}
              className={cn(
                'min-h-[36px] flex-1 rounded-[8px] border text-[12px] transition-colors',
                directedBy === id
                  ? id === 'doctor'
                    ? 'border-success/40 bg-success/10 text-success'
                    : 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-line text-muted hover:bg-raised',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <Button variant="primary" className="mt-2 w-full" onClick={add} disabled={!name.trim()}>
          <Plus size={15} />
          Add supplement
        </Button>

        {state.health.supplements.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-line pt-4">
            {state.health.supplements.map((s) => {
              const taken = takenToday.includes(s.id);
              return (
                <div key={s.id} className="flex items-center gap-2.5">
                  <button
                    onClick={() =>
                      update((draft) => {
                        const list = (draft.health.adherence[today] ??= []);
                        draft.health.adherence[today] = taken
                          ? list.filter((x) => x !== s.id)
                          : [...list, s.id];
                      })
                    }
                    className={cn(
                      'grid size-[20px] shrink-0 place-items-center rounded-[6px] border text-[11px]',
                      taken ? 'border-success bg-success text-black' : 'border-line2',
                    )}
                  >
                    {taken ? '✓' : ''}
                  </button>
                  <span className={cn('min-w-0 flex-1 text-[14px]', taken && 'text-faint')}>
                    {s.name}
                    {s.dose && <span className="ml-1.5 text-[12px] text-muted">{s.dose}</span>}
                  </span>
                  <Chip tone={s.directedBy === 'doctor' ? 'success' : 'accent'}>
                    {s.directedBy === 'doctor' ? 'Doctor' : 'Self'}
                  </Chip>
                  <button
                    onClick={() =>
                      update((draft) => {
                        draft.health.supplements = draft.health.supplements.filter(
                          (x) => x.id !== s.id,
                        );
                      })
                    }
                    aria-label="Remove"
                    className="text-faint hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </section>
  );
}

export function LabSection() {
  const state = useAppState();
  const update = useUpdateState();
  const [marker, setMarker] = useState('');
  const [value, setValue] = useState('');
  const [range, setRange] = useState('');

  const add = () => {
    if (!marker.trim() || !value.trim()) return;
    update((draft) => {
      draft.health.labs.unshift({
        id: `lab-${Date.now()}`,
        date: todayISO(),
        marker: marker.trim(),
        value: value.trim(),
        referenceRange: range.trim() || undefined,
      });
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
          Copy the reference range from your own report — ranges differ between labs, and the app
          does not supply one.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <input
            value={marker}
            onChange={(e) => setMarker(e.target.value)}
            placeholder="Marker"
            className={inputCls}
          />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Value + unit"
            className={inputCls}
          />
          <input
            value={range}
            onChange={(e) => setRange(e.target.value)}
            placeholder="Range from report"
            className={inputCls}
          />
        </div>
        <Button
          variant="primary"
          className="mt-2 w-full"
          onClick={add}
          disabled={!marker.trim() || !value.trim()}
        >
          <Plus size={15} />
          Record value
        </Button>

        <label className="mt-4 block border-t border-line pt-4">
          <span className="mb-1.5 block text-[12px] text-muted">Next test date</span>
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
              body="Add results after each test so you and your doctor can see the trend rather than one isolated number."
            />
          </div>
        ) : (
          <div className="mt-4 space-y-2 border-t border-line pt-4">
            {state.health.labs.map((l) => (
              <div key={l.id} className="flex items-baseline gap-3 text-[13px]">
                <span className="min-w-0 flex-1 truncate">{l.marker}</span>
                <span className="tnum font-mono">{l.value}</span>
                {l.referenceRange && (
                  <span className="tnum hidden font-mono text-[11px] text-faint sm:inline">
                    ref {l.referenceRange}
                  </span>
                )}
                <span className="tnum text-[11px] text-faint">{formatShort(l.date)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}
