import { SectionTitle } from '@/components/ui/primitives';
import { AmazonSet } from '@/components/amazon/AmazonSet';
import { CoachCard } from './CoachCard';
import { MissionList } from './MissionList';
import { CoursePlan } from './CoursePlan';
import { LectureCard } from './LectureCard';
import { formatHM } from '@/engine/schedule';
import type { TodayWork } from '@/engine/today-items';

/**
 * The study section of My Day: the prep set and tonight's Apna College
 * lecture while surprise prep is the programme (and in the preview before
 * Day 1), the roadmap's missions after.
 */
export function TodayPlan({
  work,
  date,
  lectureStart,
  navigate,
}: {
  work: TodayWork;
  date: string;
  lectureStart: string | null;
  navigate: (id: string) => void;
}) {
  if (work.amazon) {
    const n = work.amazon.planned.length;
    return (
      <div className="space-y-6">
        <section>
          <SectionTitle
            action={
              <span className="tnum text-[11px] text-faint">
                {n} item{n === 1 ? '' : 's'} · {formatHM(work.amazon.totalMinutes)}
              </span>
            }
          >
            Today&rsquo;s prep set
          </SectionTitle>
          <AmazonSet plan={work.amazon} compact navigate={navigate} />
        </section>
        <LectureCard work={work} date={date} start={lectureStart} />
      </div>
    );
  }

  const plan = work.general;
  if (!plan) return null;
  return (
    <div className="space-y-6">
      <CoachCard plan={plan} />
      <section>
        <SectionTitle action={<span className="tnum text-[11px] text-faint">{formatHM(plan.estimatedMinutes)} planned</span>}>
          Today&rsquo;s missions
        </SectionTitle>
        <MissionList plan={plan} />
      </section>
      <CoursePlan onOpen={() => navigate('roadmap')} />
    </div>
  );
}
