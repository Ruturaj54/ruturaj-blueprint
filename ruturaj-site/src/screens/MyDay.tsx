import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { SectionTitle } from '@/components/ui/primitives';
import { Banner } from '@/components/ui/controls';
import { listContainer } from '@/lib/motion';
import { useAppState } from '@/hooks/useAppState';
import { todayISO } from '@/engine/dates';
import { programInfo } from '@/engine/program';
import { todayWork } from '@/engine/today-items';
import { daySlots, dayTypeOf } from '@/engine/schedule';
import { exerciseSlotFor } from '@/engine/fitness';
import { DINNER_SLOT_IDS } from '@/data/meals';
import { StartDayOne } from '@/components/home/StartDayOne';
import { DayHeader } from '@/components/home/DayHeader';
import { NowCard } from '@/components/home/NowCard';
import { TodayPlan } from '@/components/home/TodayPlan';
import { StatsRow } from '@/components/home/StatsRow';
import { DinnerCard } from '@/components/home/DinnerCard';
import { ExerciseCard } from '@/components/fitness/ExerciseCard';
import { DayTimetable } from '@/components/today/DayTimetable';
import { revealTimetable } from '@/components/today/timetableReveal';
import { DeepWork } from '@/components/today/DeepWork';
import { QuickLog } from '@/components/today/QuickLog';
import { DayNotes } from '@/components/today/DayNotes';
import { CloseDay } from '@/components/today/CloseDay';
import { ActivityCard } from '@/components/today/ActivityCard';
import { TomorrowCard } from '@/components/today/TomorrowCard';

/**
 * The landing screen, in the order the day runs: what today is, what is
 * happening right now, the prep set and tonight's lecture, the run, dinner,
 * the timetable, then the night: today's numbers, tomorrow's plan, the close.
 * The day's plan is derived once here and handed down; each section owns its
 * own writes.
 */
export function MyDay({ navigate }: { navigate: (id: string) => void }) {
  const state = useAppState();
  const reduce = useReducedMotion();
  const today = todayISO();
  const info = programInfo(state, today);
  const work = todayWork(state, today);
  const completed = new Set(state.days[today]?.completed ?? []);
  const firstOpen = work.items.find((i) => !completed.has(i.id));
  const slots = daySlots(state.settings, dayTypeOf(today), exerciseSlotFor(state, today));
  const lectureStart = slots.find((s) => s.study === 'lecture')?.start ?? null;
  const dinnerAt = slots.find((s) => DINNER_SLOT_IDS.has(s.id))?.start ?? null;

  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-6">
      {/* Pressing Start folds the card away instead of making it vanish. */}
      <AnimatePresence initial={false}>
        {!info.started && (
          <motion.div
            key="start"
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, height: 0 }}
            transition={{ duration: 0.32, ease: 'easeInOut' }}
            className="origin-top space-y-6 overflow-hidden"
          >
            <StartDayOne navigate={navigate} />
            <Banner icon={<Eye size={15} />} tone="default">
              Below is a preview of My Day from Day 1, built from your timetable, the prep tracker and the Apna College
              course. Nothing is scored until you press Start.
            </Banner>
          </motion.div>
        )}
      </AnimatePresence>

      <DayHeader info={info} work={work} today={today} navigate={navigate} />
      <NowCard items={work.items} date={today} onOpen={revealTimetable} />
      <TodayPlan work={work} date={today} lectureStart={lectureStart} navigate={navigate} />
      <ExerciseCard compact onOpen={() => navigate('fitness')} />
      <DinnerCard date={today} at={dinnerAt} />
      <DayTimetable items={work.items} date={today} />
      <ActivityCard date={today} />
      <StatsRow />

      <section>
        <SectionTitle>Focus</SectionTitle>
        <DeepWork defaultLabel={firstOpen?.title ?? 'Deep work'} />
      </section>

      <QuickLog />
      <TomorrowCard date={today} />
      <DayNotes plannedIds={work.plannedIds} />
      <CloseDay />
    </motion.div>
  );
}
