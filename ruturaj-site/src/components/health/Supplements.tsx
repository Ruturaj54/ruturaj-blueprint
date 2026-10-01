import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Plus, Trash2, Pill, Check } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle, Button, Chip } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import { todayISO } from '@/engine/dates';
import type { Supplement } from '@/lib/schema';

const inputCls =
  'w-full rounded-[10px] border border-line bg-bg px-3 py-2.5 text-[14px] text-fg outline-none placeholder:text-faint focus:border-line2';

function Toggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: ReadonlyArray<readonly [T, string, 'success' | 'accent' | 'info']>;
  onChange: (v: T) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="flex gap-1.5">
      {options.map(([id, label, tone]) => (
        <motion.button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          whileTap={reduce ? undefined : { scale: 0.96 }}
          transition={spring}
          aria-pressed={value === id}
          className={cn(
            'min-h-[38px] flex-1 rounded-[8px] border text-[12px] transition-colors',
            value === id
              ? tone === 'success'
                ? 'border-success/40 bg-success/10 text-success'
                : tone === 'info'
                  ? 'border-info/40 bg-info/10 text-info'
                  : 'border-accent/40 bg-accent/10 text-accent'
              : 'border-line text-muted hover:bg-raised',
          )}
        >
          {label}
        </motion.button>
      ))}
    </div>
  );
}

/**
 * What he takes, who directed it, and when in the day. The app records; it
 * never prescribes, so the dose field is copied from the prescription or left
 * empty.
 */
export function SupplementSection() {
  const state = useAppState();
  const update = useUpdateState();
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [directedBy, setDirectedBy] = useState<Supplement['directedBy']>('doctor');
  const [timing, setTiming] = useState<NonNullable<Supplement['timing']>>('morning');
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
        timing,
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
          Directed items
        </span>
      </SectionTitle>
      <Card>
        <p className="text-[13px] text-muted">
          Medicines, supplements, topical treatments. Copy the dose from the prescription — the app
          never suggests one. Each item appears on Today to tick, at the time you set.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className={inputCls} />
          <input value={dose} onChange={(e) => setDose(e.target.value)} placeholder="Dose exactly as prescribed" className={inputCls} />
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <Toggle
            value={directedBy}
            onChange={setDirectedBy}
            options={[
              ['doctor', 'Doctor-directed', 'success'],
              ['self', 'Self-added', 'accent'],
            ]}
          />
          <Toggle
            value={timing}
            onChange={setTiming}
            options={[
              ['morning', 'Morning', 'info'],
              ['night', 'Night', 'info'],
            ]}
          />
        </div>
        <Button variant="primary" className="mt-2 w-full" onClick={add} disabled={!name.trim()}>
          <Plus size={15} />
          Add item
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
                        const list = draft.health.adherence[today] ?? [];
                        draft.health.adherence[today] = taken ? list.filter((x) => x !== s.id) : [...list, s.id];
                      })
                    }
                    aria-label={`Mark ${s.name} taken`}
                    aria-pressed={taken}
                    className={cn('grid size-[22px] shrink-0 place-items-center rounded-[6px] border', taken ? 'border-success bg-success' : 'border-line2')}
                  >
                    {taken && <Check size={13} strokeWidth={3.5} className="text-black" />}
                  </button>
                  <span className={cn('min-w-0 flex-1 text-[14px]', taken && 'text-faint')}>
                    {s.name}
                    <span className="ml-1.5 text-[12px] text-muted">
                      {s.timing === 'night' ? 'night' : 'morning'}
                      {s.dose && ` · ${s.dose}`}
                    </span>
                  </span>
                  <Chip tone={s.directedBy === 'doctor' ? 'success' : 'accent'}>{s.directedBy === 'doctor' ? 'Doctor' : 'Self'}</Chip>
                  <button
                    onClick={() =>
                      update((draft) => {
                        draft.health.supplements = draft.health.supplements.filter((x) => x.id !== s.id);
                      })
                    }
                    aria-label={`Remove ${s.name}`}
                    className="grid size-[32px] place-items-center text-faint hover:text-danger"
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
