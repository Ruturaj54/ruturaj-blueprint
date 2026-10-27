import { useState } from 'react';
import { Code2, Plus } from 'lucide-react';
import { Card, SectionTitle, Button, Chip, inputCls } from '@/components/ui/primitives';
import { Field, Segmented, Toggle } from '@/components/ui/controls';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { todayISO } from '@/engine/dates';
import { DSA_PATTERNS } from '@/data/tasks/dsa';
import { cn } from '@/lib/cn';
import type { DsaOutcome } from '@/engine/types';

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
] as const;

const OUTCOME = [
  { id: 'solved', label: 'Solved' },
  { id: 'solved_with_hint', label: 'With a hint' },
  { id: 'failed', label: 'Not solved' },
] as const;

/**
 * The DSA log for problems outside today's set. It writes the same attempt
 * record the pattern engine reads, so an extra problem still counts toward
 * weak-pattern detection. Runs are logged on the Fitness tab.
 */
export function QuickLog() {
  const state = useAppState();
  const update = useUpdateState();
  const today = todayISO();
  const [problem, setProblem] = useState('');
  const [pattern, setPattern] = useState<string>(DSA_PATTERNS[0]?.id ?? 'arrays');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [outcome, setOutcome] = useState<DsaOutcome>('solved');
  const [minutes, setMinutes] = useState('25');
  const [revision, setRevision] = useState(false);
  const [saved, setSaved] = useState(false);

  const todayCount = state.dsa.filter((a) => a.date === today).length;
  const ready = problem.trim().length > 0;

  const submit = () => {
    if (!ready) return;
    update((draft) => {
      draft.dsa.push({
        id: `dsa-${Date.now()}`,
        date: today,
        problem: problem.trim(),
        pattern,
        difficulty,
        outcome,
        minutes: Number(minutes) || 0,
        revision,
      });
    });
    setProblem('');
    setRevision(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  };

  return (
    <section>
      <SectionTitle action={todayCount > 0 ? <Chip tone="info">{todayCount} logged today</Chip> : undefined}>
        Log a problem outside the plan
      </SectionTitle>
      <Card>
        <div className="flex items-center gap-2 text-muted">
          <Code2 size={15} />
          <p className="text-[12px] uppercase tracking-[0.12em]">DSA problem</p>
        </div>
        <p className="mt-1.5 text-[13px] text-muted">
          Solved something that was not in today&rsquo;s set? Log it here; it still feeds the pattern engine.
        </p>

        <div className="mt-3 space-y-3">
          <Field label="Problem">
            <input
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
              placeholder="e.g. Koko Eating Bananas"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-[1fr_96px] gap-2">
            <Field label="Pattern">
              <select value={pattern} onChange={(e) => setPattern(e.target.value)} className={inputCls}>
                {DSA_PATTERNS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Minutes">
              <input
                value={minutes}
                onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ''))}
                inputMode="numeric"
                className={cn(inputCls, 'tnum font-mono')}
              />
            </Field>
          </div>

          <Segmented value={difficulty} options={DIFFICULTY} onChange={setDifficulty} layoutId="quicklog-difficulty" />
          <Segmented value={outcome} options={OUTCOME} onChange={setOutcome} layoutId="quicklog-outcome" />

          <Toggle
            checked={revision}
            onChange={setRevision}
            label="Cold re-solve of a problem seen before"
            hint="Retention is the metric; re-solves are tracked apart from first attempts."
          />

          <Button variant="primary" className="w-full" onClick={submit} disabled={!ready}>
            <Plus size={15} />
            {saved ? 'Logged' : 'Log problem'}
          </Button>
        </div>
      </Card>
    </section>
  );
}
