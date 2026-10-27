import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '@/hooks/useAppState';
import { buildAmazonDay } from '@/engine/amazon-plan';
import { amazonSummary } from '@/engine/amazon-stats';
import { Card, SectionTitle } from '@/components/ui/primitives';
import { listContainer } from '@/lib/motion';
import { AmazonHeader } from '@/components/amazon/AmazonHeader';
import { AmazonStatusCard } from '@/components/amazon/AmazonStatusCard';
import { WindowCard } from '@/components/amazon/WindowCard';
import { AmazonSet } from '@/components/amazon/AmazonSet';
import { EvidenceCard } from '@/components/amazon/EvidenceCard';
import { AmazonTabs } from '@/components/amazon/AmazonTabs';

/**
 * The Amazon SDE-1 module: status, window, today's set, evidence, then the
 * reference tabs. Everything is composed from components/amazon so this
 * file stays a layout.
 */
export function Amazon({ navigate }: { navigate: (id: string) => void }) {
  const state = useAppState();
  const plan = useMemo(() => buildAmazonDay(state), [state]);
  const summary = useMemo(() => amazonSummary(state), [state]);

  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-7">
      <AmazonHeader />

      <section>
        <SectionTitle>Where it stands</SectionTitle>
        <AmazonStatusCard />
      </section>

      <section>
        <SectionTitle>The window</SectionTitle>
        <WindowCard plan={plan} />
      </section>

      <section>
        <SectionTitle>Today</SectionTitle>
        <Card>
          <AmazonSet plan={plan} navigate={navigate} />
        </Card>
      </section>

      <section>
        <SectionTitle>Evidence</SectionTitle>
        <EvidenceCard summary={summary} />
      </section>

      <div>
        <SectionTitle>Reference</SectionTitle>
        <AmazonTabs />
      </div>
    </motion.div>
  );
}
