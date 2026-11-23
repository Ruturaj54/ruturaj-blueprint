import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Quote } from 'lucide-react';
import { Card, Button, Chip } from '@/components/ui/primitives';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { popSpring, spring } from '@/lib/motion';
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
  // During prep the lecture is named on its own, so the count and time are the prep set's.
  const n = work.amazon ? work.amazon.planned.length : work.items.length;
  const count = `${n} item${n === 1 ? '' : 's'}`;
  const about = `about ${formatHM(work.amazon ? work.amazon.totalMinutes : work.minutes)}`;
  if (work.amazon) {
    if (work.amazon.mode === 'interview-day') return 'Interview day. No set planned: review your stories, sleep, arrive early.';
    if (work.amazon.mode === 'done') return 'Curriculum complete. Revisions only, until you mark surprise prep done.';
    const lecture = work.lecture[0];
    const tail = lecture ? `, then the lecture: ${lecture.milestone.title}` : '';
    return n === 0 ? `${work.focus} — nothing left to place today.` : `${work.focus} — ${count}, ${about}${tail}.`;
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
  if (overrun) return `Surprise prep · Day ${day} · ${windowDays}-day window over`;
  const left = daysLeft <= 1 ? 'last day' : `${daysLeft} days left`;
  return `Surprise prep · Day ${day} of ${windowDays} · ${left}`;
}

/**
 * The top of My Day: greeting, date, the day number as the largest type on
 * the screen, the phase chip, today's objective and the one primary action.
 * The number lands with a spring and counts to today; the chip re-enters when
 * its text changes (pressing Start, a new day); the arrow nudges now and then.
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
  const reduce = useReducedMotion();
  const amazon = !info.started || info.phase === 'amazon';
  const chip = phaseChip(info);
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
          <motion.p
            initial={reduce ? false : { opacity: 0, scale: 0.6, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ ...popSpring, delay: 0.05 }}
            className="tnum origin-bottom-left font-display text-[56px] font-extrabold leading-none tracking-tight text-fg"
          >
            <AnimatedNumber value={info.started ? info.day : 1} duration={0.9} />
          </motion.p>
        </div>
        <motion.span
          key={chip}
          initial={reduce ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...spring, delay: 0.12 }}
          className="mb-1.5 inline-flex max-w-full"
        >
          <Chip tone={amazon ? 'amazon' : 'accent'} className="max-w-full">
            {chip}
          </Chip>
        </motion.span>
      </div>

      <p className="mt-3 text-[15px] leading-snug text-fg">{objective(work)}</p>

      <AnimatePresence initial={false}>
        {info.started && (
          <motion.div
            key="cta"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={popSpring}
          >
            <Button
              variant={amazon ? 'amazon' : 'primary'}
              size="lg"
              className="mt-4 w-full sm:w-auto"
              onClick={() => navigate(amazon ? 'prep' : 'roadmap')}
            >
              {amazon ? 'Start today’s prep' : 'Continue the roadmap'}
              <motion.span
                className="inline-flex"
                animate={reduce ? undefined : { x: [0, 5, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, repeatDelay: 2.6, ease: 'easeInOut' }}
              >
                <ArrowRight size={17} />
              </motion.span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

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
