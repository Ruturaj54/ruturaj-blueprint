import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { Session } from '@/data/fitness';
import { Button, inputCls } from '@/components/ui/primitives';
import { Field } from '@/components/ui/controls';
import { cn } from '@/lib/cn';
import { SessionChecklist } from './SessionChecklist';

export interface WorkoutInput {
  minutes: number;
  km?: number;
  parts: string[];
}

/**
 * The inline "mark done" form. Minutes start at the session total and follow
 * the parts he unticks until he types a number himself; km is optional.
 */
export function WorkoutForm({
  session,
  dense,
  onSave,
  onCancel,
}: {
  session: Session;
  dense?: boolean;
  onSave: (input: WorkoutInput) => void;
  onCancel: () => void;
}) {
  const [parts, setParts] = useState<ReadonlySet<string>>(() => new Set(session.parts.map((p) => p.id)));
  const [minutes, setMinutes] = useState(String(session.minutes));
  const [touched, setTouched] = useState(false);
  const [km, setKm] = useState('');

  const toggle = (id: string, next: boolean) => {
    const set = new Set(parts);
    if (next) set.add(id);
    else set.delete(id);
    setParts(set);
    if (!touched) {
      const sum = session.parts.filter((p) => set.has(p.id)).reduce((n, p) => n + p.minutes, 0);
      setMinutes(String(sum));
    }
  };

  const mins = Number(minutes);
  const dist = Number(km);
  const minutesOk = Number.isFinite(mins) && mins > 0 && mins <= 300;
  const kmOk = km === '' || (Number.isFinite(dist) && dist >= 0 && dist <= 100);
  const valid = minutesOk && kmOk;

  const submit = () => {
    if (!valid) return;
    onSave({ minutes: mins, ...(dist > 0 ? { km: dist } : {}), parts: [...parts] });
  };

  return (
    <div className="rounded-[12px] border border-line bg-raised p-3">
      <p className="px-1 text-[11px] font-medium uppercase tracking-[0.1em] text-muted">What you did</p>
      <div className="mt-2 rounded-[10px] bg-surface p-1">
        <SessionChecklist session={session} checked={parts} onToggle={toggle} dense={dense} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Field label="Minutes">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={300}
            value={minutes}
            onChange={(e) => {
              setTouched(true);
              setMinutes(e.target.value);
            }}
            className={cn(inputCls, 'tnum font-mono')}
          />
        </Field>
        <Field label="Distance (km, optional)">
          <input
            type="number"
            inputMode="decimal"
            step={0.1}
            min={0}
            value={km}
            onChange={(e) => setKm(e.target.value)}
            placeholder="e.g. 4.5"
            className={cn(inputCls, 'tnum font-mono')}
          />
        </Field>
      </div>
      <div className="mt-3 flex gap-2">
        <Button variant="primary" className="flex-1" onClick={submit} disabled={!valid}>
          <Check size={15} />
          Save session
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          <X size={15} />
          Cancel
        </Button>
      </div>
    </div>
  );
}
