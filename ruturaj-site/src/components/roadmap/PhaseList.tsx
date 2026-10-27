import { Card, Chip } from '@/components/ui/primitives';
import { useAppState } from '@/hooks/useAppState';
import { cn } from '@/lib/cn';
import { programInfo } from '@/engine/program';
import { missionPhases } from '@/engine/mission';
import { dateForDay, formatShort, TARGET_DATE } from '@/engine/dates';

/**
 * The four general phases with their scaled day ranges and dates. Lengths
 * scale to the days left until the target date from the day the Amazon
 * phase ends, so until that day the ranges are a preview.
 */
export function PhaseList() {
  const state = useAppState();
  const info = programInfo(state);
  const phases = missionPhases();
  const active = info.phase === 'general' && info.general.started;
  const day = active ? info.general.day : 0;
  const target = `${formatShort(TARGET_DATE)} ${TARGET_DATE.slice(0, 4)}`;

  return (
    <section className="space-y-3">
      <p className="px-1 text-[13px] leading-relaxed text-muted">
        {active && info.general.startedOn
          ? `Phase lengths were scaled to the ${info.general.totalDays} days between ${formatShort(info.general.startedOn)}, the day the Amazon phase ended, and ${target}.`
          : `Lengths scale to the days left until ${target} from the day the Amazon phase ends. Until then these ranges are a preview, computed as if it ended today.`}
      </p>
      {phases.map((phase) => {
        const current = active && day >= phase.startDay && day <= phase.endDay;
        const done = active && day > phase.endDay;
        return (
          <Card key={phase.id} className={cn(current && 'border-accent/35', done && 'opacity-60')}>
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  'tnum mt-0.5 grid size-[36px] shrink-0 place-items-center rounded-[10px] border font-mono text-[12px]',
                  current ? 'border-accent/40 bg-accent-soft text-accent' : 'border-line bg-raised text-faint',
                )}
              >
                {phase.label}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[15px] font-semibold leading-snug">{phase.title}</p>
                  {current && <Chip tone="accent">Current</Chip>}
                  {done && <Chip tone="success">Done</Chip>}
                </div>
                <p className="tnum mt-1 text-[12px] text-muted">
                  Days {phase.startDay}–{phase.endDay} · {formatShort(dateForDay(phase.startDay))} to{' '}
                  {formatShort(dateForDay(phase.endDay))}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-faint">{phase.focus}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{phase.description}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
