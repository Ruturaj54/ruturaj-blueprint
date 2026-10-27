import { ArrowRight, Quote } from 'lucide-react';
import { Card, Button, Chip } from '@/components/ui/primitives';
import { useAppState } from '@/hooks/useAppState';
import { useClock } from '@/hooks/useClock';
import { formatLong } from '@/engine/dates';
import { formatHM } from '@/engine/schedule';
import { quoteForDay } from '@/data/quotes';
import type { ProgramInfo } from '@/engine/program';
import type { TodayWork } from '@/engine/today-items';

function greeting(clock: string): string {
  const hour = Number(clock.slice(0, 2));
  if (hour >= 4 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** One sentence on what today is about, with the count and time from the plan. */
function objective(work: TodayWork): string {
  const n = work.items.length;
  const count = `${n} item${n === 1 ? '' : 's'}`;
  const about = `about ${formatHM(work.minutes)}`;
  if (work.amazon) {
    if (work.amazon.mode === 'interview-day') return 'Interview day. No set planned: review your stories, sleep, arrive early.';
    if (work.amazon.mode === 'done') return 'Curriculum complete. Revisions only, until you mark the Amazon phase done.';
    return n === 0 ? `${work.focus} — nothing left to place today.` : `${work.focus} — ${count}, ${about}`;
  }
  const lead = work.general?.missions[0];
  const head = !lead
    ? 'Roadmap'
    : lead.kind === 'foundation'
      ? `${lead.subject.name} · ${lead.milestone.title}`
      : lead.scored.task.title;
  return `${head} — ${count}, ${about}`;
}

function phaseChip(info: ProgramInfo): string {
  if (!info.started) return 'Preview · not started';
  if (info.phase === 'general') return `Roadmap · Day ${info.general.day} of ${info.general.totalDays}`;
  const { day, windowDays, daysLeft, overrun } = info.amazon;
  if (overrun) return `Amazon intensive · Day ${day} · ${windowDays}-day window over`;
  const left = daysLeft <= 1 ? 'last day' : `${daysLeft} days left`;
  return `Amazon intensive · Day ${day} of ${windowDays} · ${left}`;
}

/**
 * The top of My Day: greeting, date, the day number as the largest type on
 * the screen, the phase chip, today's objective and the one primary action.
 */
export function DayHeader({
  info,
  work,
  today,
  navigate,
}: {
  info: ProgramInfo;
  work: TodayWork;
  today: string;
  navigate: (id: string) => void;
}) {
  const state = useAppState();
  const clock = useClock();
  const amazon = !info.started || info.phase === 'amazon';
  const quote = quoteForDay(info.day);
  const name = state.settings.name.trim() || 'Ruturaj';

  return (
    <Card className="p-5">
      <p className="text-[13px] text-muted">
        {greeting(clock)}, {name}. <span className="text-faint">{formatLong(today)}</span>
      </p>

      <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-2">
        <div>
          <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted">Day</p>
          <p className="tnum font-display text-[56px] font-extrabold leading-none tracking-tight text-fg">
            {info.started ? info.day : 1}
          </p>
        </div>
        <Chip tone={amazon ? 'amazon' : 'accent'} className="mb-1.5 max-w-full">
          {phaseChip(info)}
        </Chip>
      </div>

      <p className="mt-3 text-[15px] leading-snug text-fg">{objective(work)}</p>

      {info.started && (
        <Button
          variant={amazon ? 'amazon' : 'primary'}
          size="lg"
          className="mt-4 w-full sm:w-auto"
          onClick={() => navigate(amazon ? 'amazon' : 'roadmap')}
        >
          {amazon ? 'Start Amazon study' : 'Continue the roadmap'}
          <ArrowRight size={17} />
        </Button>
      )}

      <p className="mt-4 flex items-start gap-2 border-t border-line pt-3 text-[12.5px] leading-relaxed text-muted">
        <Quote size={13} className="mt-[3px] shrink-0 text-faint" />
        <span>
          {quote.line}
          {quote.by && (
            <span className="text-faint">
              {' '}— {quote.by}
              {quote.source ? `, ${quote.source}` : ''}
            </span>
          )}
        </span>
      </p>
    </Card>
  );
}
