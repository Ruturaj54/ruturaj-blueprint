import { useState } from 'react';
import { Code2, Footprints, Plus } from 'lucide-react';
import { Card, SectionTitle, Button, Chip } from '@/components/ui/primitives';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { todayISO } from '@/engine/dates';
import { DSA_PATTERNS } from '@/data/tasks/dsa';
import { cn } from '@/lib/cn';
import type { DsaOutcome } from '@/engine/types';

const inputCls =
  'h-[42px] w-full rounded-[10px] border border-line bg-bg px-3 text-[14px] text-fg outline-none placeholder:text-faint focus:border-line2';

/** Logging has to be fast or it does not happen. Two forms, no navigation. */
export function QuickLog() {
  return (
    <section>
      <SectionTitle>Quick log</SectionTitle>
      <div className="grid gap-3 lg:grid-cols-2">
        <DsaForm />
        <RunForm />
      </div>
    </section>
  );
}

function DsaForm() {
  const update = useUpdateState();
  const [problem, setProblem] = useState('');
  const [pattern, setPattern] = useState(DSA_PATTERNS[0]!.id);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [outcome, setOutcome] = useState<DsaOutcome>('solved');
  const [minutes, setMinutes] = useState('25');
  const [saved, setSaved] = useState(false);

  const submit = () => {
    if (!problem.trim()) return;
    update((draft) => {
      draft.dsa.push({
        id: `dsa-${Date.now()}`,
        date: todayISO(),
        problem: problem.trim(),
        pattern,
        difficulty,
        outcome,
        minutes: Number(minutes) || 0,
        revision: false,
      });
    });
    setProblem('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <Card>
      <div className="flex items-center gap-2 text-muted">
        <Code2 size={15} />
        <p className="text-[12px] uppercase tracking-[0.12em]">Log a DSA problem</p>
      </div>

      <div className="mt-3 space-y-2">
        <input
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Problem name"
          className={inputCls}
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className={inputCls}
          >
            {DSA_PATTERNS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            value={minutes}
            onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            placeholder="Minutes"
            className={cn(inputCls, 'tnum font-mono')}
          />
        </div>

        <div className="flex gap-1.5">
          {(['easy', 'medium', 'hard'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={cn(
                'min-h-[36px] flex-1 rounded-[8px] border text-[12px] capitalize transition-colors',
                difficulty === d
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-line text-muted hover:bg-raised',
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5">
          {(
            [
              ['solved', 'Solved'],
              ['solved_with_hint', 'With hint'],
              ['failed', 'Failed'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setOutcome(id)}
              className={cn(
                'min-h-[36px] flex-1 rounded-[8px] border text-[12px] transition-colors',
                outcome === id
                  ? id === 'solved'
                    ? 'border-success/40 bg-success/10 text-success'
                    : id === 'failed'
                      ? 'border-danger/40 bg-danger/10 text-danger'
                      : 'border-info/40 bg-info/10 text-info'
                  : 'border-line text-muted hover:bg-raised',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <Button variant="primary" className="w-full" onClick={submit} disabled={!problem.trim()}>
          <Plus size={15} />
          {saved ? 'Logged' : 'Log problem'}
        </Button>
      </div>
    </Card>
  );
}

function RunForm() {
  const state = useAppState();
  const update = useUpdateState();
  const today = todayISO();
  const [slot, setSlot] = useState<'morning' | 'evening'>('morning');
  const [km, setKm] = useState('');
  const [minutes, setMinutes] = useState('');

  const todayRuns = state.runs.filter((r) => r.date === today);

  const submit = () => {
    const distance = Number(km);
    if (!distance) return;
    update((draft) => {
      draft.runs.push({
        id: `run-${Date.now()}`,
        date: today,
        slot,
        km: distance,
        minutes: Number(minutes) || 0,
      });
    });
    setKm('');
    setMinutes('');
  };

  const pace =
    Number(km) > 0 && Number(minutes) > 0
      ? (Number(minutes) / Number(km)).toFixed(1)
      : null;

  return (
    <Card>
      <div className="flex items-center gap-2 text-muted">
        <Footprints size={15} />
        <p className="text-[12px] uppercase tracking-[0.12em]">Log a run</p>
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex gap-1.5">
          {(['morning', 'evening'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSlot(s)}
              className={cn(
                'min-h-[36px] flex-1 rounded-[8px] border text-[12px] capitalize transition-colors',
                slot === s
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-line text-muted hover:bg-raised',
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            value={km}
            onChange={(e) => setKm(e.target.value.replace(/[^\d.]/g, ''))}
            inputMode="decimal"
            placeholder="Distance (km)"
            className={cn(inputCls, 'tnum font-mono')}
          />
          <input
            value={minutes}
            onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            placeholder="Minutes"
            className={cn(inputCls, 'tnum font-mono')}
          />
        </div>

        {pace && <p className="tnum text-[12px] text-muted">Pace {pace} min/km</p>}

        <Button variant="primary" className="w-full" onClick={submit} disabled={!Number(km)}>
          <Plus size={15} />
          Log run
        </Button>

        {todayRuns.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {todayRuns.map((r) => (
              <Chip key={r.id} tone="success">
                {r.slot} · {r.km}km
              </Chip>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
