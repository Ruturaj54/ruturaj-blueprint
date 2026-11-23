import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Footprints, Check } from 'lucide-react';
import { Card, SectionTitle, ProgressBar, Chip, inputCls } from '@/components/ui/primitives';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { spring } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { ACTIVITY_FIELDS, activityFor, setActivity, type ActivityKey } from '@/engine/activity';
import type { ActivityLog } from '@/lib/schema';

const asText = (log: ActivityLog): Record<ActivityKey, string> =>
  Object.fromEntries(ACTIVITY_FIELDS.map((f) => [f.key, log[f.key] === undefined ? '' : String(log[f.key])])) as Record<ActivityKey, string>;

/**
 * Today's numbers, typed in from the phone or watch before bed: run and walk
 * km, steps, total distance, calories from moving and calories for the whole
 * day. Each field saves on blur; an empty field clears that number.
 */
export function ActivityCard({ date }: { date: string }) {
  const state = useAppState();
  const update = useUpdateState();
  const reduce = useReducedMotion();
  const log = activityFor(state, date);
  const [draft, setDraft] = useState(() => asText(log));
  const [savedKey, setSavedKey] = useState<ActivityKey | null>(null);
  const editing = useRef<ActivityKey | null>(null);
  const target = state.settings.walkTargetKm;
  const walk = log.walkKm ?? 0;
  const stored = JSON.stringify(log);

  // A save or a sync from another device refreshes the fields, except the one he is typing in.
  useEffect(() => {
    setDraft((prev) => {
      const next = asText(JSON.parse(stored) as ActivityLog);
      if (editing.current) next[editing.current] = prev[editing.current];
      return next;
    });
  }, [stored]);

  const commit = (key: ActivityKey) => {
    const raw = draft[key].trim();
    const value = raw === '' ? undefined : Number(raw);
    if (value !== undefined && (!Number.isFinite(value) || value < 0)) {
      setDraft((d) => ({ ...d, [key]: log[key] === undefined ? '' : String(log[key]) }));
      return;
    }
    if ((value ?? undefined) === log[key]) return;
    update((s) => setActivity(s, date, key, value));
    setSavedKey(key);
    window.setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 1400);
  };

  const filled = ACTIVITY_FIELDS.filter((f) => log[f.key] !== undefined).length;

  return (
    <section>
      <SectionTitle action={<span className="tnum text-[11px] text-faint">{filled} of {ACTIVITY_FIELDS.length} logged</span>}>
        <span className="inline-flex items-center gap-1.5">
          <Footprints size={13} />
          Today&rsquo;s numbers
        </span>
      </SectionTitle>
      <Card>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-[13px] text-fg">
            Walk <span className="tnum font-semibold">{walk ? `${Math.round(walk * 10) / 10} km` : 'not logged'}</span>
            <span className="text-muted"> of {target} km</span>
          </p>
          {walk >= target && <Chip tone="success">Target reached</Chip>}
        </div>
        <ProgressBar value={(walk / target) * 100} tone={walk >= target ? 'success' : 'accent'} className="mt-2" />

        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-3">
          {ACTIVITY_FIELDS.map((f) => (
            <label key={f.key} className="block min-w-0">
              <span className="mb-1.5 flex items-center justify-between gap-1 text-[12px] font-medium text-muted">
                <span className="truncate">{f.label}</span>
                {savedKey === f.key && (
                  <motion.span
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={spring}
                    className="shrink-0 text-success"
                  >
                    <Check size={13} strokeWidth={3} />
                  </motion.span>
                )}
              </span>
              <div className="relative">
                <input
                  type="number"
                  inputMode={f.decimals ? 'decimal' : 'numeric'}
                  step={f.decimals ? 0.1 : 1}
                  min={0}
                  value={draft[f.key]}
                  onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                  onFocus={() => {
                    editing.current = f.key;
                  }}
                  onBlur={() => {
                    editing.current = null;
                    commit(f.key);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                  }}
                  placeholder="–"
                  aria-label={`${f.label} in ${f.unit}`}
                  className={cn(inputCls, 'tnum pe-12 font-mono')}
                />
                <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-[11px] text-faint">{f.unit}</span>
              </div>
            </label>
          ))}
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-faint">
          Copy them from your phone&rsquo;s health app in the revise-and-plan block. Calories from moving is the active
          figure; total adds what the body burns at rest. Only what you type is shown; nothing is estimated.
        </p>
      </Card>
    </section>
  );
}
