import { ArrowRight, Activity } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { Card, SectionTitle } from '@/components/ui/primitives';
import { Stat } from '@/components/ui/controls';
import { todayISO, addDays } from '@/engine/dates';
import { fitnessWeek } from '@/engine/fitness';
import { buildWeeklyReview, weeklyVerdict } from '@/engine/weekly';
import { formatHM } from '@/engine/schedule';

/**
 * Three plain counts for the last seven days and the week's verdict in one
 * line. Nothing here is a readiness number; it is what actually got logged.
 */
export function ConsistencyStats({ onOpenWeek, navigate }: { onOpenWeek: () => void; navigate: (id: string) => void }) {
  const state = useAppState();
  const today = todayISO();
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, -6 + i));
  const activeDays = last7.filter((d) => (state.days[d]?.completed.length ?? 0) > 0).length;
  const focusMinutes = state.deepWork.filter((s) => last7.includes(s.date)).reduce((n, s) => n + s.actualMinutes, 0);
  const sessions = fitnessWeek(state, today).sessions;
  const verdict = weeklyVerdict(buildWeeklyReview(state, today));

  return (
    <section>
      <SectionTitle>Last 7 days</SectionTitle>
      <Card>
        <div className="grid grid-cols-3 gap-3">
          <Stat value={activeDays} unit="/ 7" label="Days with a tick" />
          <Stat value={formatHM(focusMinutes)} label="Focus time" />
          <Stat value={sessions} label="Workouts" tone={sessions > 0 ? 'success' : 'default'} />
        </div>
        <p className="mt-3 text-[12px] text-faint">
          Days with at least one completed item · deep-work minutes actually logged · fitness sessions logged.
        </p>

        <div className="mt-4 border-t border-line pt-4">
          <p className="text-[11px] uppercase tracking-[0.12em] text-faint">Weekly review</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-fg">{verdict}</p>
          <div className="mt-1 flex flex-wrap gap-x-5">
            <button
              type="button"
              onClick={onOpenWeek}
              className="inline-flex min-h-[44px] items-center gap-1 text-[13px] font-medium text-accent"
            >
              Open the Week tab
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => navigate('fitness')}
              className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-fg"
            >
              <Activity size={14} />
              Fitness
            </button>
          </div>
        </div>
      </Card>
    </section>
  );
}
