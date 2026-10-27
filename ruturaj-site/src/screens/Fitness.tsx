import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Info, ChevronDown, FlaskConical } from 'lucide-react';
import { SectionTitle } from '@/components/ui/primitives';
import { Banner } from '@/components/ui/controls';
import { listContainer, spring } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { FAT_LOSS_NOTE } from '@/data/fitness';
import { ExerciseCard } from '@/components/fitness/ExerciseCard';
import { WeekPlan } from '@/components/fitness/WeekPlan';
import { WeekStrip } from '@/components/fitness/WeekStrip';
import { HabitsCard } from '@/components/fitness/HabitsCard';
import { SleepCard } from '@/components/fitness/SleepCard';
import { WeightLog } from '@/components/health/WeightLog';
import { LabSection } from '@/components/health/Labs';

/**
 * Fitness tracks and informs: today's session, the week, the two daily
 * habits, sleep and weight. Lab values sit behind a disclosure at the bottom.
 * Supplements, skin care and health-focus cards are retired from this screen.
 */
export function Fitness() {
  const [recordsOpen, setRecordsOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-7">
      <section>
        <SectionTitle>Today</SectionTitle>
        <ExerciseCard />
      </section>

      <WeekPlan />
      <WeekStrip />

      <Banner tone="info" icon={<Info size={15} className="text-info" />}>
        <p className="font-medium text-fg">About belly fat</p>
        <p className="mt-1 text-muted">{FAT_LOSS_NOTE}</p>
      </Banner>

      <HabitsCard />
      <SleepCard />
      <WeightLog />

      <section>
        <motion.button
          type="button"
          onClick={() => setRecordsOpen((v) => !v)}
          aria-expanded={recordsOpen}
          whileTap={reduce ? undefined : { scale: 0.99 }}
          transition={spring}
          className="flex min-h-[48px] w-full items-center justify-between rounded-[12px] border border-line bg-surface px-4 text-left shadow-card"
        >
          <span className="inline-flex items-center gap-2 text-[14px] font-medium text-fg">
            <FlaskConical size={15} className="text-muted" />
            Health records
          </span>
          <span className="inline-flex items-center gap-2 text-[12px] text-faint">
            {recordsOpen ? 'Hide' : 'Show'}
            <ChevronDown size={16} className={cn('transition-transform', recordsOpen && 'rotate-180')} />
          </span>
        </motion.button>
        <AnimatePresence initial={false}>
          {recordsOpen && (
            <motion.div
              key="records"
              initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: reduce ? 0 : 0.22, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="pt-4">
                <LabSection />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}
