import { Check } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { Card, SectionTitle } from '@/components/ui/primitives';
import { Stat } from '@/components/ui/controls';
import { cn } from '@/lib/cn';
import { weekdayOf } from '@/engine/dates';
import { fitnessWeek, fitnessStreak } from '@/engine/fitness';

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** The last seven days: logged or not, minutes and km per day, and the streak. */
export function WeekStrip() {
  const state = useAppState();
  const week = fitnessWeek(state);
  const streak = fitnessStreak(state);

  return (
    <section>
      <SectionTitle>Last 7 days</SectionTitle>
      <Card>
        <div className="grid grid-cols-7 gap-1.5">
          {week.days.map(({ date, logged }) => (
            <div key={date} className="text-center">
              <div
                className={cn(
                  'grid h-[40px] place-items-center rounded-[10px] border',
                  logged ? 'border-success/30 bg-success-soft text-success' : 'border-line bg-raised text-faint',
                )}
              >
                {logged ? <Check size={16} strokeWidth={3} /> : <span className="text-[11px]">–</span>}
              </div>
              <p className="mt-1 text-[10px] text-faint">{DOW[weekdayOf(date)]}</p>
              <p className="tnum min-h-[14px] text-[10px] text-muted">{logged ? `${logged.minutes}m` : ''}</p>
              <p className="tnum min-h-[14px] text-[10px] text-muted">{logged?.km ? `${logged.km}km` : ''}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3 border-t border-line pt-4">
          <Stat value={week.sessions} label="Sessions" />
          <Stat value={week.minutes} label="Minutes" />
          <Stat value={week.km} unit="km" label="Distance" />
          <Stat value={streak} label="Streak" tone={streak > 0 ? 'success' : 'default'} />
        </div>
        <p className="mt-3 text-[12px] text-faint">
          The streak counts consecutive days with a logged session, ending today or yesterday.
        </p>
      </Card>
    </section>
  );
}
