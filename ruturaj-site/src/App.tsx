import { AnimatePresence, motion } from 'framer-motion';
import type { ReactElement } from 'react';
import { useRoute } from '@/lib/router';
import { Shell } from '@/components/Shell';
import { PraiseModal } from '@/components/PraiseModal';
import { useDaySnapshot } from '@/hooks/useDaySnapshot';
import { pageVariants } from '@/lib/motion';
import { Home } from '@/screens/Home';
import { Roadmap } from '@/screens/Roadmap';
import { Today } from '@/screens/Today';
import { Dsa } from '@/screens/Dsa';
import { AiEngineer } from '@/screens/AiEngineer';
import { Sde } from '@/screens/Sde';
import { Job } from '@/screens/Job';
import { Work } from '@/screens/Work';
import { Health } from '@/screens/Health';
import { Email } from '@/screens/Email';
import { Analytics } from '@/screens/Analytics';
import { Settings } from '@/screens/Settings';

/** Route ids match the nav ids in src/nav.ts. An unknown hash falls back Home. */
function screenFor(route: string, navigate: (id: string) => void): ReactElement {
  const screens: Record<string, () => ReactElement> = {
    home: () => <Home navigate={navigate} />,
    today: () => <Today />,
    dsa: () => <Dsa />,
    ai: () => <AiEngineer />,
    roadmap: () => <Roadmap />,
    sde: () => <Sde />,
    job: () => <Job />,
    work: () => <Work />,
    health: () => <Health />,
    email: () => <Email />,
    analytics: () => <Analytics />,
    settings: () => <Settings />,
  };
  return (screens[route] ?? screens.home!)();
}

export function App() {
  const [route, navigate] = useRoute();
  useDaySnapshot();

  return (
    <Shell route={route} navigate={navigate}>
      <PraiseModal />
      <AnimatePresence mode="wait">
        <motion.div key={route} variants={pageVariants} initial="hidden" animate="show" exit="exit">
          {screenFor(route, navigate)}
        </motion.div>
      </AnimatePresence>
    </Shell>
  );
}
