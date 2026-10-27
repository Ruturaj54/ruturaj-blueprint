import { motion, useReducedMotion } from 'framer-motion';
import { Lock, Unlock, ArrowRight } from 'lucide-react';
import { Card, SectionTitle, ProgressBar, Chip } from '@/components/ui/primitives';
import { useAppState } from '@/hooks/useAppState';
import { spring } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { courseProgress, gateDeadlineDay, type CourseStatus } from '@/engine/courses';
import { gateStatus } from '@/engine/foundation';
import { dateForDay, formatShort } from '@/engine/dates';

const STATUS: Record<CourseStatus, { label: string; tone: 'success' | 'accent' | 'info' | 'default' }> = {
  done: { label: 'Done', tone: 'success' },
  active: { label: 'Now', tone: 'accent' },
  next: { label: 'Next', tone: 'info' },
  queued: { label: 'After that', tone: 'default' },
};

/**
 * The plan in his order: Course 1 (Apna College), Course 2 (Five Minute
 * Engineering), then practice — with a forecast of when each closes at three
 * missions a day, measured against the gate deadline.
 */
export function CoursePlan({ onOpen }: { onOpen: () => void }) {
  const state = useAppState();
  const reduce = useReducedMotion();
  const courses = courseProgress(state);
  const gate = gateStatus(state);
  const finish = courses.at(-1)?.etaDay ?? null;
  const margin = finish === null ? null : gateDeadlineDay() - finish;

  return (
    <section>
      <SectionTitle
        action={
          <span className="tnum font-display text-[15px] font-bold text-accent">{gate.pct}%</span>
        }
      >
        The plan, in order
      </SectionTitle>
      <Card className="p-0">
        <motion.button
          type="button"
          onClick={onOpen}
          whileTap={reduce ? undefined : { scale: 0.99 }}
          transition={spring}
          className="block w-full p-4 text-left"
        >
          <div className="space-y-4">
            {courses.map((c) => {
              const s = STATUS[c.status];
              return (
                <div key={c.tier} className={cn(c.status === 'queued' && 'opacity-70')}>
                  <div className="flex items-center gap-2">
                    <p className="min-w-0 flex-1 text-[14px] font-medium leading-snug">{c.label}</p>
                    <Chip tone={s.tone}>{s.label}</Chip>
                  </div>
                  <ProgressBar
                    value={c.pct}
                    tone={c.status === 'done' ? 'success' : c.status === 'active' ? 'accent' : 'info'}
                    className="mt-2"
                  />
                  <p className="tnum mt-1.5 text-[12px] text-muted">
                    {c.done} of {c.total} modules
                    {c.status !== 'done' && c.etaDate && (
                      <span className="text-faint"> · at three a day, done Day {c.etaDay} · {formatShort(c.etaDate)}</span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-start gap-2 border-t border-line pt-3">
            {gate.unlocked ? (
              <Unlock size={15} className="mt-0.5 shrink-0 text-success" />
            ) : (
              <Lock size={15} className="mt-0.5 shrink-0 text-accent" />
            )}
            <p className="min-w-0 flex-1 text-[13px] text-muted">
              {gate.unlocked
                ? gate.overridden
                  ? 'Advanced Mode unlocked by override, not by completion.'
                  : 'Foundation Gate cleared on merit. Advanced Mode is open.'
                : margin === null
                  ? 'Every mandatory module is done — clear the gate on the roadmap.'
                  : margin >= 0
                    ? `At this pace the gate closes on Day ${finish} — ${margin} day${margin === 1 ? '' : 's'} inside the ${formatShort(dateForDay(gateDeadlineDay()))} deadline.`
                    : `At three a day the gate closes ${-margin} day${margin === -1 ? '' : 's'} after the ${formatShort(dateForDay(gateDeadlineDay()))} deadline. Close a fourth module on weekends.`}
            </p>
            <ArrowRight size={14} className="mt-1 shrink-0 text-faint" />
          </div>
        </motion.button>
      </Card>
    </section>
  );
}
