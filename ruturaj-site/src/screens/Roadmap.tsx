import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useAppState } from '@/hooks/useAppState';
import { Segmented } from '@/components/ui/controls';
import { listContainer } from '@/lib/motion';
import { MANDATORY_HOURS } from '@/data/foundation';
import { gateStatus } from '@/engine/foundation';
import { CoursePlan } from '@/components/home/CoursePlan';
import { RoadmapBanner } from '@/components/roadmap/RoadmapBanner';
import { GateCard } from '@/components/roadmap/GateCard';
import { SubjectTiers } from '@/components/roadmap/SubjectTiers';
import { NextUpCard } from '@/components/roadmap/NextUpCard';
import { TrackBoard } from '@/components/roadmap/TrackBoard';
import { PhaseList } from '@/components/roadmap/PhaseList';

const TABS = [
  { id: 'fundamentals', label: 'Fundamentals' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'phases', label: 'Phases' },
] as const;
type Tab = (typeof TABS)[number]['id'];

const ADVANCED_INTRO =
  'Docker, Kubernetes, Jenkins and CI/CD, Linux, networking and cloud live in the DevOps and Systems tracks, and they build on the pipeline ownership you already have rather than starting from nothing. AI, DSA and Core CS carry the interview weight; Java and React stay capped at P2/P3 so they cannot crowd those out.';

const PHASES_INTRO =
  'The general roadmap after Amazon, in four parts. P1 is the Foundation Gate (Phase A); P2 to P4 are the advanced tracks (Phase B), ending with applications going out in waves.';

function TabIntro({ title, body }: { title: string; body: string }) {
  return (
    <div className="px-1">
      <p className="font-display text-[15px] font-bold leading-snug">{title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted">{body}</p>
    </div>
  );
}

/** The general roadmap: fundamentals behind the gate, advanced tracks, and the four phases. */
export function Roadmap({ navigate }: { navigate: (id: string) => void }) {
  const state = useAppState();
  const reduce = useReducedMotion();
  const gate = gateStatus(state);
  const [tab, setTab] = useState<Tab>(gate.unlocked ? 'advanced' : 'fundamentals');
  const subjectsRef = useRef<HTMLDivElement>(null);

  const options = TABS.map((t) => ({ id: t.id, label: t.label, hint: t.id === 'fundamentals' ? `${gate.pct}%` : undefined }));

  const openSubjects = () => {
    setTab('fundamentals');
    subjectsRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6">
      <RoadmapBanner navigate={navigate} />
      <Segmented value={tab} options={options} onChange={setTab} layoutId="roadmap-tabs" />

      <motion.div key={tab} variants={listContainer} initial="hidden" animate="show" className="space-y-6">
        {tab === 'fundamentals' && (
          <>
            <TabIntro
              title="Phase A · Fundamentals"
              body={`Apna College → Five Minute Engineering → PPA / LB / DSA / LSP (about ${MANDATORY_HOURS}h)`}
            />
            <GateCard />
            <CoursePlan onOpen={openSubjects} />
            <div ref={subjectsRef} className="scroll-mt-[70px]">
              <SubjectTiers />
            </div>
          </>
        )}
        {tab === 'advanced' && (
          <>
            <TabIntro title="Phase B · Advanced tracks" body={ADVANCED_INTRO} />
            <NextUpCard />
            <TrackBoard locked={!gate.unlocked} />
          </>
        )}
        {tab === 'phases' && (
          <>
            <TabIntro title="The four phases" body={PHASES_INTRO} />
            <PhaseList />
          </>
        )}
      </motion.div>
    </div>
  );
}
