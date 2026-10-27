import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { SectionTitle } from '@/components/ui/primitives';
import { Banner } from '@/components/ui/controls';
import { listContainer } from '@/lib/motion';
import { useAppState } from '@/hooks/useAppState';
import { todayISO } from '@/engine/dates';
import { programInfo } from '@/engine/program';
import { todayWork } from '@/engine/today-items';
import { StartDayOne } from '@/components/home/StartDayOne';
import { DayHeader } from '@/components/home/DayHeader';
import { NowCard } from '@/components/home/NowCard';
import { TodayPlan } from '@/components/home/TodayPlan';
import { StatsRow } from '@/components/home/StatsRow';
import { ExerciseCard } from '@/components/fitness/ExerciseCard';
import { DayTimetable } from '@/components/today/DayTimetable';
import { revealTimetable } from '@/components/today/timetableReveal';
import { DeepWork } from '@/components/today/DeepWork';
import { QuickLog } from '@/components/today/QuickLog';
import { DayNotes } from '@/components/today/DayNotes';
import { CloseDay } from '@/components/today/CloseDay';

/**
 * The landing screen: what today is, what is happening right now, the work,
 * the timetable, and the evening close. The day's plan is derived once here
 * and handed down; each section owns its own writes.
 */
export function MyDay({ navigate }: { navigate: (id: string) => void }) {
  const state = useAppState();
  const today = todayISO();
  const info = programInfo(state, today);
  const work = todayWork(state, today);
  const completed = new Set(state.days[today]?.completed ?? []);
  const firstOpen = work.items.find((i) => !completed.has(i.id));

  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-6">
      {!info.started && (
        <>
          <StartDayOne navigate={navigate} />
          <Banner icon={<Eye size={15} />} tone="default">
            Below is a preview of My Day from Day 1, built from your settings and the Amazon tracker. Nothing is
            scored until you press Start.
          </Banner>
        </>
      )}

      <DayHeader info={info} work={work} today={today} navigate={navigate} />
      <NowCard items={work.items} date={today} onOpen={revealTimetable} />
      <TodayPlan work={work} navigate={navigate} />
      <ExerciseCard compact onOpen={() => navigate('fitness')} />
      <DayTimetable items={work.items} date={today} />
      <StatsRow />

      <section>
        <SectionTitle>Focus</SectionTitle>
        <DeepWork defaultLabel={firstOpen?.title ?? 'Deep work'} />
      </section>

      <QuickLog />
      <DayNotes plannedIds={work.plannedIds} />
      <CloseDay />
    </motion.div>
  );
}
