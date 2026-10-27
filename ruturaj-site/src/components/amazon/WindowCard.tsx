import { useState } from 'react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { tierList, type AmazonDayPlan } from '@/engine/amazon-plan';
import type { Priority } from '@/engine/types';
import { programInfo, completeAmazonPhase, reactivateAmazonPhase, extendAmazonWindow, setAmazonWindow } from '@/engine/program';
import { formatShort } from '@/engine/dates';
import { formatHM } from '@/engine/schedule';
import { Card, Button, PriorityPill } from '@/components/ui/primitives';
import { Field, Segmented, Stat } from '@/components/ui/controls';
import { formatDMY } from './status-line';

/**
 * The intensive window: where he is in it, what the planner can still fit,
 * and the three controls that change it (extend, resize, end the phase).
 */

const TIERS: readonly Priority[] = ['P0', 'P1', 'P2', 'P3'];
type WindowLen = '7' | '14' | '21' | '28';
const LENGTHS: ReadonlyArray<{ id: WindowLen; label: string }> = [
  { id: '7', label: '7 days' },
  { id: '14', label: '14' },
  { id: '21', label: '21' },
  { id: '28', label: '28' },
];

export function WindowCard({ plan }: { plan: AmazonDayPlan }) {
  const state = useAppState();
  const update = useUpdateState();
  const info = programInfo(state);
  const [confirm, setConfirm] = useState(false);
  const w = info.amazon;
  const pace = plan.pace;
  const shed = TIERS.filter((t) => !pace.fits.includes(t));
  const base = String(state.program.amazonWindowDays) as WindowLen;

  const title = !info.started
    ? 'Day 1 not started'
    : info.phase === 'general'
      ? 'Amazon phase complete'
      : w.overrun
        ? 'Window over'
        : `Day ${w.day} of ${w.windowDays}`;
  const sub = !info.started
    ? 'Press Start Day 1 on My Day. Until then this previews Day 1.'
    : info.phase === 'general'
      ? `Marked complete${state.program.amazonCompletedOn ? ` on ${formatDMY(state.program.amazonCompletedOn)}` : ''}. The general roadmap is the daily programme.`
      : w.overrun
        ? `The ${w.windowDays}-day window ended ${formatShort(w.endsOn)}. Extend it or mark the phase complete.`
        : `Started ${formatShort(info.startedOn)} · ends ${formatShort(w.endsOn)}${state.program.amazonExtendedDays ? ` · extended by ${state.program.amazonExtendedDays} days` : ''}`;

  const floorWhy =
    shed.length === 0
      ? `every tier fits in the ${formatHM(pace.capacityLeft)} left, so nothing is shed.`
      : `${tierList(pace.fits)} ${pace.fits.length === 1 ? 'fits' : 'fit'} in the ${formatHM(pace.capacityLeft)} left; ${tierList(shed)} ${shed.length === 1 ? 'stays' : 'stay'} optional until you run ahead.`;

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-display text-[16px] font-bold leading-tight">{title}</p>
          <p className="mt-0.5 text-[12px] text-muted">{sub}</p>
        </div>
        {info.started && info.phase === 'amazon' && (
          <Stat value={w.daysLeft} label={w.daysLeft === 1 ? 'day left' : 'days left'} tone={w.overrun ? 'danger' : 'amazon'} />
        )}
      </div>

      <p className="mt-3 text-[13px] leading-relaxed text-fg">{pace.note}</p>
      <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted">
        Tier floor <PriorityPill priority={plan.tierFloor} /> <span>Why: {floorWhy}</span>
      </p>

      <table className="tnum mt-3 w-full text-[12.5px]">
        <thead>
          <tr className="text-left text-[10.5px] uppercase tracking-[0.1em] text-muted">
            <th className="py-1 font-medium">Remaining</th>
            {TIERS.map((t) => (
              <th key={t} className="py-1 font-mono font-medium">
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="text-fg">
            <td className="py-1 text-muted">hours</td>
            {TIERS.map((t) => (
              <td key={t} className={`py-1 font-mono ${pace.fits.includes(t) ? 'text-fg' : 'text-faint'}`}>
                {formatHM(pace.remainingByTier[t])}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <p className="tnum mt-2 text-[12px] text-muted">
        About {pace.hoursPerDayNeeded} h/day over the {pace.daysLeft} day{pace.daysLeft === 1 ? '' : 's'} left clears the tiers that fit.
      </p>

      {info.phase === 'amazon' && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Window length" hint="Changing it resets any extension.">
            <Segmented value={base} options={LENGTHS} layoutId="amazon-window-len" tone="amazon" onChange={(v) => update((d) => setAmazonWindow(d, Number(v)))} />
          </Field>
          <div className="flex items-end">
            <Button variant={w.overrun ? 'amazon' : 'outline'} className="w-full" onClick={() => update((d) => extendAmazonWindow(d, 7))}>
              Extend by 7 days
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-line pt-4">
        {info.phase === 'general' ? (
          <Button variant="amazon" onClick={() => update((d) => reactivateAmazonPhase(d))}>
            Reactivate Amazon as today's priority
          </Button>
        ) : confirm ? (
          <div className="rounded-[12px] border border-line bg-raised p-3">
            <p className="text-[13px] leading-relaxed text-fg">
              From today the general roadmap becomes the daily programme and its Day 1 is set. Amazon stays available in this tab;
              nothing here is deleted, and you can reactivate it when the call comes.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="primary"
                onClick={() => {
                  update((d) => completeAmazonPhase(d));
                  setConfirm(false);
                }}
              >
                Yes, mark complete
              </Button>
              <Button variant="ghost" onClick={() => setConfirm(false)}>
                Keep going
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setConfirm(true)}>
            Mark Amazon phase complete
          </Button>
        )}
      </div>
    </Card>
  );
}
