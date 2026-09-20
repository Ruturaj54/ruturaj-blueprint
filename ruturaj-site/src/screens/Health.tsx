import { motion } from 'framer-motion';
import { Info, Footprints, Moon } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle } from '@/components/ui/primitives';
import { listContainer } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { todayISO, formatShort, addDays } from '@/engine/dates';
import { SupplementSection, LabSection } from '@/components/health/Trackers';

const inputCls =
  'w-full rounded-[10px] border border-line bg-bg px-3 py-2.5 text-[14px] text-fg outline-none placeholder:text-faint focus:border-line2';

/**
 * §18 — health support.
 *
 * Tracking only. The app records what a doctor directed and what Ruturaj chose
 * himself, and keeps those visually distinct. It never interprets a lab value,
 * never suggests a dose, and never infers a deficiency.
 */
export function Health() {
  const state = useAppState();
  const update = useUpdateState();

  const today = todayISO();
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, -6 + i));
  const weekRuns = state.runs.filter((r) => last7.includes(r.date));
  const weekKm = weekRuns.reduce((s, r) => s + r.km, 0);

  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-7">
      {/* ---- disclaimer ---- */}
      <Card className="border-info/25">
        <div className="flex items-start gap-2.5">
          <Info size={16} className="mt-0.5 shrink-0 text-info" />
          <div>
            <p className="text-[14px] font-medium">This section tracks. It does not advise.</p>
            <p className="mt-1.5 text-[13px] text-muted">
              Nothing here interprets a lab value, suggests a dose or infers a deficiency. Record
              what your doctor directed, record what you actually took, and take the numbers back to
              your doctor. Anything you added yourself is labelled as such so the distinction stays
              visible.
            </p>
          </div>
        </div>
      </Card>

      {/* ---- running ---- */}
      <section>
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5">
            <Footprints size={13} />
            Running
          </span>
        </SectionTitle>
        <Card>
          <div className="flex gap-6">
            <Stat value={weekKm.toFixed(1)} unit="km" label="Last 7 days" />
            <Stat value={weekRuns.length} label="Runs" />
            <Stat
              value={weekRuns.length ? (weekKm / weekRuns.length).toFixed(1) : '—'}
              unit="km"
              label="Average"
            />
          </div>
          <div className="mt-4 flex gap-1.5">
            {last7.map((d) => {
              const n = state.runs.filter((r) => r.date === d).length;
              return (
                <div key={d} className="flex-1">
                  <div
                    className={cn(
                      'h-[36px] rounded-[6px] border',
                      n >= 2
                        ? 'border-success/40 bg-success/25'
                        : n === 1
                          ? 'border-success/30 bg-success/10'
                          : 'border-line bg-white/[0.02]',
                    )}
                  />
                  <p className="mt-1 text-center text-[10px] text-faint">{formatShort(d).split(' ')[0]}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-3 border-t border-line pt-3 text-[12px] text-muted">
            Two runs a day is a lot alongside a night study block. If the studying is slipping,
            drop the evening run to a walk rather than cutting sleep — recovery is what makes the
            night block usable.
          </p>
        </Card>
      </section>

      {/* ---- sleep ---- */}
      <section>
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5">
            <Moon size={13} />
            Sleep
          </span>
        </SectionTitle>
        <Card>
          <label className="block">
            <span className="mb-1.5 block text-[12px] text-muted">Hours slept last night</span>
            <input
              type="number"
              min={0}
              max={14}
              step={0.5}
              value={state.health.sleep[today] ?? ''}
              onChange={(e) => {
                const v = Number(e.target.value);
                update((draft) => {
                  if (v > 0) draft.health.sleep[today] = v;
                  else delete draft.health.sleep[today];
                });
              }}
              placeholder="e.g. 7"
              className={cn(inputCls, 'tnum font-mono')}
            />
          </label>
          <div className="mt-3 flex gap-1.5">
            {last7.map((d) => {
              const h = state.health.sleep[d];
              return (
                <div key={d} className="flex-1">
                  <div className="flex h-[48px] items-end">
                    <div
                      className={cn(
                        'w-full rounded-[4px]',
                        !h ? 'bg-white/[0.04]' : h >= 7 ? 'bg-success' : h >= 6 ? 'bg-accent' : 'bg-danger',
                      )}
                      style={{ height: h ? `${Math.min(100, (h / 9) * 100)}%` : '4px' }}
                    />
                  </div>
                  <p className="tnum mt-1 text-center text-[10px] text-faint">{h ?? '—'}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <SupplementSection />
      <LabSection />
    </motion.div>
  );
}

function Stat({ value, unit, label }: { value: string | number; unit?: string; label: string }) {
  return (
    <div>
      <p className="tnum font-display text-[24px] font-bold leading-none">
        {value}
        {unit && <span className="ml-1 text-[13px] font-normal text-muted">{unit}</span>}
      </p>
      <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
    </div>
  );
}
