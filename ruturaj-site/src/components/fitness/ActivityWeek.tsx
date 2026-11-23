import { CalendarDays } from 'lucide-react';
import { Card, SectionTitle } from '@/components/ui/primitives';
import { Stat } from '@/components/ui/controls';
import { useAppState } from '@/hooks/useAppState';
import { cn } from '@/lib/cn';
import { todayISO, weekdayOf, parseDay } from '@/engine/dates';
import { activityWeek, walkStreak, formatActivity } from '@/engine/activity';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * The last seven days of logged numbers: one row per day, then the week's
 * totals and per-day averages over the days he actually logged. A blank is
 * a blank; nothing is filled in or estimated.
 */
export function ActivityWeek() {
  const state = useAppState();
  const today = todayISO();
  const target = state.settings.walkTargetKm;
  const week = activityWeek(state, target, today);
  const streak = walkStreak(state, target, today);
  const avgSteps = week.averages.steps;
  const avgActive = week.averages.activeKcal;

  return (
    <section>
      <SectionTitle action={<span className="tnum text-[11px] text-faint">{week.loggedDays} of 7 days logged</span>}>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={13} />
          Numbers · last 7 days
        </span>
      </SectionTitle>
      <Card>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
          <Stat value={week.totals.runKm || '–'} unit={week.totals.runKm ? 'km' : undefined} label="Run" />
          <Stat value={week.totals.walkKm || '–'} unit={week.totals.walkKm ? 'km' : undefined} label="Walk" tone={week.totals.walkKm ? 'success' : 'default'} />
          <Stat value={`${week.walkTargetDays}/7`} label={`Walks of ${target} km+`} tone={week.walkTargetDays >= 5 ? 'success' : 'default'} />
          <Stat value={streak} unit={streak === 1 ? 'day' : 'days'} label="Walk streak" tone={streak > 0 ? 'success' : 'default'} flame={streak > 0} />
        </div>
        <p className="tnum mt-3 text-[12.5px] text-muted">
          {avgSteps !== null ? `${formatActivity('steps', avgSteps)} steps a day` : 'Steps not logged'}
          {' · '}
          {avgActive !== null ? `${formatActivity('activeKcal', avgActive)} active kcal a day` : 'active kcal not logged'}
          {week.averages.totalKcal !== null ? ` · ${formatActivity('totalKcal', week.averages.totalKcal)} kcal burned a day` : ''}
          <span className="text-faint"> (averages over logged days)</span>
        </p>

        <div className="mt-4 overflow-x-auto border-t border-line pt-3">
          <table className="tnum w-full min-w-[320px] text-[12px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-[0.08em] text-muted">
                <th className="py-1.5 pe-2 font-medium">Day</th>
                <th className="py-1.5 pe-2 font-medium">Run km</th>
                <th className="py-1.5 pe-2 font-medium">Walk km</th>
                <th className="py-1.5 pe-2 font-medium">Steps</th>
                <th className="py-1.5 pe-2 font-medium">Active kcal</th>
                <th className="py-1.5 font-medium">Total kcal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[...week.days].reverse().map(({ date, log }) => (
                <tr key={date} className={cn(date === today ? 'text-fg' : 'text-muted')}>
                  <td className="py-1.5 pe-2">
                    <span className="whitespace-nowrap">
                      <span className="font-medium">{DOW[weekdayOf(date)]}</span> <span className="text-faint">{parseDay(date).getDate()}</span>
                    </span>
                  </td>
                  <td className="py-1.5 pe-2 font-mono">{log.runKm ? formatActivity('runKm', log.runKm) : '–'}</td>
                  <td className={cn('py-1.5 pe-2 font-mono', (log.walkKm ?? 0) >= target && 'text-success')}>
                    {log.walkKm ? formatActivity('walkKm', log.walkKm) : '–'}
                  </td>
                  <td className="py-1.5 pe-2 font-mono">{log.steps ? formatActivity('steps', log.steps) : '–'}</td>
                  <td className="py-1.5 pe-2 font-mono">{log.activeKcal ? formatActivity('activeKcal', log.activeKcal) : '–'}</td>
                  <td className="py-1.5 font-mono">{log.totalKcal ? formatActivity('totalKcal', log.totalKcal) : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  );
}
