import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Segmented } from '@/components/ui/controls';
import { listContainer } from '@/lib/motion';
import { PlanBrowser } from './PlanBrowser';
import { BankList } from './BankList';
import { FreqList } from './FreqList';
import { LpList } from './LpList';
import { ResumeList } from './ResumeList';
import { GenAiList } from './GenAiList';
import { RoundsCard } from './RoundsCard';
import { StrategyCard } from './StrategyCard';
import { DayOfList } from './DayOfList';
import { SourcesList } from './SourcesList';

/**
 * The nine reference tabs. Only the active tab is mounted, so the screen
 * stays light on a phone. Other tabs can jump to a day in the plan browser;
 * the focus carries a nonce so the same day can be asked for twice.
 */

export type AmazonTab = 'plan' | 'asked' | 'freq' | 'stories' | 'resume' | 'genai' | 'rounds' | 'dayof' | 'sources';

export interface DayFocus {
  day: number;
  nonce: number;
}

const TABS: ReadonlyArray<{ id: AmazonTab; label: string }> = [
  { id: 'plan', label: 'Plan' },
  { id: 'asked', label: 'Asked' },
  { id: 'freq', label: 'Frequency' },
  { id: 'stories', label: 'Stories' },
  { id: 'resume', label: 'Resume' },
  { id: 'genai', label: 'GenAI' },
  { id: 'rounds', label: 'Rounds' },
  { id: 'dayof', label: 'Day-of' },
  { id: 'sources', label: 'Sources' },
];

export function AmazonTabs() {
  const [tab, setTab] = useState<AmazonTab>('plan');
  const [focus, setFocus] = useState<DayFocus | null>(null);

  const goDay = useCallback((day: number) => {
    setTab('plan');
    setFocus((f) => ({ day, nonce: (f?.nonce ?? 0) + 1 }));
  }, []);

  return (
    <section>
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
        <div className="flex">
          <Segmented
            className="min-w-[760px] flex-1 lg:min-w-0"
            tone="amazon"
            layoutId="amazon-tabs"
            value={tab}
            options={TABS}
            onChange={setTab}
          />
          <span aria-hidden className="w-4 shrink-0 lg:hidden" />
        </div>
      </div>
      <motion.div key={tab} variants={listContainer} initial="hidden" animate="show" className="mt-4">
        <TabBody tab={tab} focus={focus} goDay={goDay} goTab={setTab} />
      </motion.div>
    </section>
  );
}

function TabBody({
  tab,
  focus,
  goDay,
  goTab,
}: {
  tab: AmazonTab;
  focus: DayFocus | null;
  goDay: (n: number) => void;
  goTab: (t: AmazonTab) => void;
}) {
  switch (tab) {
    case 'plan':
      return <PlanBrowser focus={focus} onGoDay={goDay} onGoTab={goTab} />;
    case 'asked':
      return <BankList onGoDay={goDay} />;
    case 'freq':
      return <FreqList onGoDay={goDay} />;
    case 'stories':
      return <LpList />;
    case 'resume':
      return <ResumeList />;
    case 'genai':
      return <GenAiList />;
    case 'rounds':
      return (
        <div className="space-y-5">
          <RoundsCard />
          <StrategyCard />
        </div>
      );
    case 'dayof':
      return <DayOfList />;
    case 'sources':
      return <SourcesList />;
    default:
      return null;
  }
}
