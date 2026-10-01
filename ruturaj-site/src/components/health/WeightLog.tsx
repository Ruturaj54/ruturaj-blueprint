import { useState } from 'react';
import { Scale, Plus, Trash2 } from 'lucide-react';
import { Card, SectionTitle, Button } from '@/components/ui/primitives';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { cn } from '@/lib/cn';
import { todayISO, formatShort } from '@/engine/dates';

const inputCls =
  'h-[44px] w-full rounded-[10px] border border-line bg-bg px-3 text-[14px] text-fg outline-none placeholder:text-faint focus:border-line2';

/**
 * Weekly weigh-ins and the trend. Only what he measured is drawn — no
 * smoothing, no projection, no target the app invented.
 */
export function WeightLog() {
  const state = useAppState();
  const update = useUpdateState();
  const [kg, setKg] = useState('');
  const [date, setDate] = useState(todayISO());

  const entries = Object.entries(state.health.weight).sort(([a], [b]) => (a < b ? -1 : 1));
  const first = entries[0];
  const latest = entries.at(-1);
  const change = first && latest ? Math.round((latest[1] - first[1]) * 10) / 10 : 0;

  const value = Number(kg);
  const valid = Number.isFinite(value) && value >= 30 && value <= 250;
  const add = () => {
    if (!valid) return;
    update((draft) => {
      draft.health.weight[date] = Math.round(value * 10) / 10;
    });
    setKg('');
  };

  // A small, honest chart: bars scaled between the lowest and highest weigh-in.
  const recent = entries.slice(-10);
  const lo = Math.min(...recent.map((e) => e[1]));
  const hi = Math.max(...recent.map((e) => e[1]));

  return (
    <section>
      <SectionTitle
        action={
          latest && entries.length > 1 ? (
            <span className={cn('tnum text-[12px]', change < 0 ? 'text-success' : change > 0 ? 'text-accent' : 'text-faint')}>
              {change > 0 ? '+' : ''}
              {change} kg since {formatShort(first![0])}
            </span>
          ) : undefined
        }
      >
        <span className="inline-flex items-center gap-1.5">
          <Scale size={13} />
          Weight
        </span>
      </SectionTitle>
      <Card>
        <div className="flex items-baseline gap-2">
          <p className="tnum font-display text-[28px] font-bold leading-none">{latest ? latest[1] : '—'}</p>
          <p className="text-[13px] text-muted">{latest ? `kg · ${formatShort(latest[0])}` : 'No weigh-in yet'}</p>
        </div>

        {recent.length > 1 && (
          <div className="mt-4 flex h-[64px] items-end gap-1.5">
            {recent.map(([d, w]) => (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-[4px] bg-info/60"
                  style={{ height: `${hi === lo ? 60 : 25 + ((w - lo) / (hi - lo)) * 75}%` }}
                  title={`${w} kg · ${formatShort(d)}`}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-2 border-t border-line pt-4">
          <input
            type="number"
            inputMode="decimal"
            step={0.1}
            value={kg}
            onChange={(e) => setKg(e.target.value)}
            placeholder="kg"
            aria-label="Weight in kg"
            className={cn(inputCls, 'tnum font-mono')}
          />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value || todayISO())} aria-label="Weigh-in date" className={inputCls} />
          <Button variant="primary" onClick={add} disabled={!valid} aria-label="Log weigh-in">
            <Plus size={15} />
          </Button>
        </div>
        <p className="mt-2 text-[12px] text-faint">Once a week, same morning, before breakfast. Daily numbers are mostly water.</p>

        {entries.length > 0 && (
          <div className="mt-3 space-y-1.5 border-t border-line pt-3">
            {[...entries].reverse().slice(0, 6).map(([d, w]) => (
              <div key={d} className="flex items-center gap-3 text-[13px]">
                <span className="tnum min-w-0 flex-1 text-muted">{formatShort(d)}</span>
                <span className="tnum font-mono">{w} kg</span>
                <button
                  onClick={() =>
                    update((draft) => {
                      delete draft.health.weight[d];
                    })
                  }
                  aria-label={`Remove weigh-in on ${formatShort(d)}`}
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
