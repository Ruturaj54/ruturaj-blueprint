import { useEffect } from 'react';
import * as storage from '@/lib/storage';
import { useAppState } from './useAppState';
import { buildPlan } from '@/engine/planner';
import { todayISO, dayForDate, TOTAL_DAYS } from '@/engine/dates';

/**
 * Starts the day automatically the first time the app is opened.
 *
 * The end-of-day mail scores the day against its plan. Before this, a day only
 * had a plan if "Start today" was pressed — forget it once and that day could
 * never be scored, and nothing unfinished could be carried to the next one.
 *
 * Waits for the first server pull before writing. A write stamps the current
 * time, and on a fresh device that would make an empty plan look newer than
 * real progress on the server and overwrite it.
 */
export function useDaySnapshot(): void {
  const state = useAppState();
  const today = todayISO();
  const hasLog = Boolean(state.days[today]);

  useEffect(() => {
    if (hasLog) return undefined;
    const day = dayForDate(today);
    if (day < 1 || day > TOTAL_DAYS) return undefined;

    let cancelled = false;
    void storage.whenSynced().then(() => {
      if (cancelled) return;
      const latest = storage.getState();
      if (latest.days[today]) return; // synced from another device meanwhile
      const plan = buildPlan(latest);
      if (plan.plannedIds.length === 0) return;
      storage.update((draft) => {
        draft.days[today] ??= { planned: plan.plannedIds, completed: [] };
      });
    });
    return () => {
      cancelled = true;
    };
  }, [hasLog, today]);
}
