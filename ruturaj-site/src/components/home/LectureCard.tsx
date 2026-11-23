import { MonitorPlay } from 'lucide-react';
import { Card, Chip, SectionTitle } from '@/components/ui/primitives';
import { TaskCheckbox } from '@/components/ui/controls';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { toggleLecture } from '@/engine/lecture';
import { formatHM } from '@/engine/schedule';
import type { TodayWork } from '@/engine/today-items';

/**
 * Tonight's Apna College module, in the lecture block after dinner. Ticking it
 * ticks the same module on the Roadmap, so the course carries straight on when
 * surprise prep is complete.
 */
export function LectureCard({ work, date, start }: { work: TodayWork; date: string; start: string | null }) {
  const state = useAppState();
  const update = useUpdateState();
  if (work.lecture.length === 0) return null;

  return (
    <section>
      <SectionTitle action={start ? <span className="tnum text-[11px] text-faint">from {start}</span> : undefined}>
        Tonight&rsquo;s lecture
      </SectionTitle>
      <Card className="p-1.5">
        {work.lecture.map((m) => {
          const done = Boolean(state.foundation[m.milestone.id]);
          const capped = m.minutes < m.milestone.estMinutes;
          return (
            <TaskCheckbox
              key={m.milestone.id}
              checked={done}
              onChange={(next) => update((draft) => toggleLecture(draft, m.milestone.id, next, date, work.plannedIds))}
              label={m.milestone.title}
              sublabel={
                <span className="flex flex-wrap items-center gap-1.5">
                  <Chip tone="info">
                    <MonitorPlay size={11} />
                    Apna College
                  </Chip>
                  <Chip>{m.subject.name}</Chip>
                  <Chip>{capped ? `${formatHM(m.minutes)} tonight of ~${formatHM(m.milestone.estMinutes)}` : formatHM(m.minutes)}</Chip>
                </span>
              }
            />
          );
        })}
        <p className="px-3 pb-2 pt-1 text-[12px] leading-relaxed text-muted">
          One module a night, in course order. Tick it when the module is finished; until then it stays tonight&rsquo;s
          lecture.
        </p>
      </Card>
    </section>
  );
}
