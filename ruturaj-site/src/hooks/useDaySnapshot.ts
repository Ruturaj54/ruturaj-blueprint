import { useEffect } from 'react';
import * as storage from '@/lib/storage';
import { useAppState } from './useAppState';
import { buildPlan } from '@/engine/planner';
import { buildAmazonDay } from '@/engine/amazon-plan';
import { todayISO } from '@/engine/dates';

/**
 * Captures today's plan the first time the app is opened each day, so the
 * day can be scored against what was actually planned. Phase-aware: during
 * the Amazon intensive the plan is the Amazon set; afterwards it is the
 * roadmap's missions. Nothing is written before Day 1 is started, and nothing
 * is written before the first server pull so a fresh device cannot overwrite
 * real progress with an empty plan.
 */
export function useDaySnapshot(): void {
  const state = useAppState();
  const today = todayISO();
  // Before 04:00 on the morning of Day 1 the mission date is still the day
  // before. No snapshot then, or a phantom 0% day would sit in front of Day 1.
  const startedOn = state.program.startedOn ?? null;
  const started = startedOn !== null && today >= startedOn;
  const hasPlan = (state.days[today]?.planned.length ?? 0) > 0;

  useEffect(() => {
    if (!started || hasPlan) return undefined;
    let cancelled = false;
    void storage.whenSynced().then(() => {
      if (cancelled) return;
      const latest = storage.getState();
      if (!latest.program.startedOn || today < latest.program.startedOn) return;
      if ((latest.days[today]?.planned.length ?? 0) > 0) return;
      const ids =
        latest.program.phase === 'amazon' ? buildAmazonDay(latest, today).plannedIds : buildPlan(latest).plannedIds;
      if (ids.length === 0) return;
      storage.update((draft) => {
        const log = (draft.days[today] ??= { planned: [], completed: [] });
        if (log.planned.length === 0) log.planned = ids;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [started, hasPlan, today]);
}
