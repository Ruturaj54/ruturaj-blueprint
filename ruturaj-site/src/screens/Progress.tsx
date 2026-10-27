import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { SectionTitle } from '@/components/ui/primitives';
import { Segmented } from '@/components/ui/controls';
import { listContainer } from '@/lib/motion';
import { amazonSummary } from '@/engine/amazon-stats';
import { EvidenceCard } from '@/components/amazon/EvidenceCard';
import { ExecutionStrip } from '@/components/progress/ExecutionStrip';
import { ConsistencyStats } from '@/components/progress/ConsistencyStats';
import { PhaseBars } from '@/components/progress/PhaseBars';
import { DsaPatterns } from '@/components/progress/DsaPatterns';
import { RecentProblems } from '@/components/progress/RecentProblems';
import { WeeklyReviewCard } from '@/components/progress/WeeklyReviewCard';
import { TrackReadiness } from '@/components/progress/TrackReadiness';

type Tab = 'overview' | 'amazon' | 'dsa' | 'week';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'amazon', label: 'Amazon' },
  { id: 'dsa', label: 'DSA' },
  { id: 'week', label: 'Week' },
] as const satisfies ReadonlyArray<{ id: Tab; label: string }>;

/**
 * Progress is evidence, not a score: what got done against what was planned,
 * what the Amazon curriculum records, where DSA is weak, and the week review.
 */
export function Progress({ navigate }: { navigate: (id: string) => void }) {
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <div className="space-y-5">
      <Segmented
        value={tab}
        options={TABS}
        onChange={setTab}
        layoutId="progress-tabs"
        tone={tab === 'amazon' ? 'amazon' : 'default'}
      />
      <motion.div key={tab} variants={listContainer} initial="hidden" animate="show" className="space-y-7">
        {tab === 'overview' && (
          <>
            <ExecutionStrip />
            <ConsistencyStats onOpenWeek={() => setTab('week')} navigate={navigate} />
          </>
        )}
        {tab === 'amazon' && <AmazonTab navigate={navigate} />}
        {tab === 'dsa' && (
          <>
            <DsaPatterns />
            <RecentProblems />
          </>
        )}
        {tab === 'week' && (
          <>
            <WeeklyReviewCard />
            <TrackReadiness />
          </>
        )}
      </motion.div>
    </div>
  );
}

/** Evidence counters first, then the curriculum record. Never a single readiness number. */
function AmazonTab({ navigate }: { navigate: (id: string) => void }) {
  const state = useAppState();
  const summary = amazonSummary(state);
  return (
    <>
      <section>
        <SectionTitle
          action={
            <button
              type="button"
              onClick={() => navigate('amazon')}
              className="inline-flex min-h-[32px] items-center gap-1 text-[12px] font-medium text-amazon"
            >
              Open Amazon
              <ArrowUpRight size={13} />
            </button>
          }
        >
          Evidence
        </SectionTitle>
        <EvidenceCard summary={summary} />
      </section>
      <PhaseBars summary={summary} />
    </>
  );
}
