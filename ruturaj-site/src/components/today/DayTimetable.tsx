import { Clock, Briefcase, BookOpen, Footprints, Moon, ArrowRight, CornerDownRight } from 'lucide-react';
import { Card, SectionTitle, Chip, ProgressBar } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { useAppState } from '@/hooks/useAppState';
import { buildSchedule, formatRange, formatHM, type Slot } from '@/engine/schedule';
import type { DailyPlan } from '@/engine/planner';

const SLOT_ICON = {
  office: Briefcase,
  block1: BookOpen,
  run: Footprints,
  block2: Moon,
} as const;

/** The day as a timetable — what to do, and when. */
export function DayTimetable({ plan }: { plan: DailyPlan }) {
  const state = useAppState();
  const schedule = buildSchedule(state, plan);
  const today = state.days[plan.ctx.date];
  const completed = new Set(today?.completed ?? []);

  return (
    <section>
      <SectionTitle
        action={
          <span className="tnum text-[11px] text-faint">
            {formatHM(schedule.totalPlanned)} of {formatHM(schedule.totalCapacity)}
          </span>
        }
      >
        <span className="inline-flex items-center gap-1.5">
          <Clock size={13} />
          Today&rsquo;s schedule
        </span>
      </SectionTitle>

      <div className="space-y-2.5">
        {schedule.slots.map((slot) => (
          <SlotCard key={slot.id} slot={slot} completed={completed} />
        ))}
      </div>

      {schedule.overflow.length > 0 && (
        <Card className="mt-2.5 border-accent/25">
          <div className="flex items-start gap-2">
            <ArrowRight size={15} className="mt-0.5 shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="text-[13px]">Continues tomorrow</p>
              {schedule.overflow.map((i) => (
                <p key={i.id} className="mt-1 text-[12px] text-muted">
                  {i.title}{' '}
                  <span className="tnum text-faint">— {formatHM(i.minutes)} left</span>
                </p>
              ))}
              <p className="mt-1.5 text-[12px] text-faint">
                Today&rsquo;s blocks are full. It moves to the top of tomorrow&rsquo;s plan rather than
                coming out of your sleep.
              </p>
            </div>
          </div>
        </Card>
      )}
    </section>
  );
}

function SlotCard({ slot, completed }: { slot: Slot; completed: Set<string> }) {
  const Icon = SLOT_ICON[slot.id];
  const isRest = slot.id === 'run';
  const pct = slot.capacity === 0 ? 0 : (slot.used / slot.capacity) * 100;

  return (
    <Card className={cn('p-0', isRest && 'opacity-80')}>
      <div className="flex items-center gap-3 p-3.5">
        <span
          className={cn(
            'grid size-[34px] shrink-0 place-items-center rounded-[9px] border',
            isRest ? 'border-success/30 bg-success/10 text-success' : 'border-line text-muted',
          )}
        >
          <Icon size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium">{slot.label}</p>
          <p className="tnum text-[12px] text-muted">{formatRange(slot)}</p>
        </div>
        {!isRest && (
          <span className="tnum shrink-0 font-mono text-[12px] text-faint">
            {formatHM(slot.used)} / {formatHM(slot.capacity)}
          </span>
        )}
      </div>

      {/* w-auto, not the default w-full: with a horizontal margin, w-full is
          100% + 28px and the bar pokes 13px out of the card at full capacity. */}
      {!isRest && (
        <ProgressBar value={pct} tone={pct > 100 ? 'danger' : 'accent'} className="mx-3.5 mb-1 w-auto" />
      )}

      {slot.items.length > 0 && (
        <div className="space-y-2 border-t border-line px-3.5 py-3">
          {slot.items.map((item) => {
            const done = completed.has(item.id);
            return (
              <div key={item.id} className="flex items-start gap-2.5">
                <span
                  className={cn(
                    'mt-[7px] size-[6px] shrink-0 rounded-full',
                    done ? 'bg-success' : item.kind === 'dsa' ? 'bg-info' : 'bg-accent',
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-[13px] leading-snug',
                      done ? 'text-faint line-through' : 'text-fg',
                    )}
                  >
                    {item.title}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Chip>
                      {item.partial && item.totalMinutes
                        ? `${formatHM(item.minutes)} of ${formatHM(item.totalMinutes)}`
                        : formatHM(item.minutes)}
                    </Chip>
                    <Chip tone={item.kind === 'dsa' ? 'info' : 'default'}>{item.context}</Chip>
                    {item.carried && (
                      <Chip tone="accent">
                        <CornerDownRight size={11} />
                        Carried over
                      </Chip>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {slot.note && (
        <p className="border-t border-line px-3.5 py-2.5 text-[12px] text-faint">{slot.note}</p>
      )}
    </Card>
  );
}
