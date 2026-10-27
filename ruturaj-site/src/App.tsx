import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, type ReactElement } from 'react';
import { useRoute } from '@/lib/router';
import { Shell } from '@/components/Shell';
import { PraiseModal } from '@/components/PraiseModal';
import { useDaySnapshot } from '@/hooks/useDaySnapshot';
import { pageVariants } from '@/lib/motion';
import { LEGACY_ROUTES } from '@/nav';
import { MyDay } from '@/screens/MyDay';
import { Amazon } from '@/screens/Amazon';
import { Roadmap } from '@/screens/Roadmap';
import { Projects } from '@/screens/Projects';
import { Fitness } from '@/screens/Fitness';
import { Progress } from '@/screens/Progress';
import { Settings } from '@/screens/Settings';

/** Route ids match the nav ids in src/nav.ts. An unknown hash falls back to My Day. */
function screenFor(route: string, navigate: (id: string) => void): ReactElement {
  const screens: Record<string, () => ReactElement> = {
    home: () => <MyDay navigate={navigate} />,
    amazon: () => <Amazon navigate={navigate} />,
    roadmap: () => <Roadmap navigate={navigate} />,
    projects: () => <Projects />,
    fitness: () => <Fitness />,
    progress: () => <Progress navigate={navigate} />,
    settings: () => <Settings />,
  };
  return (screens[route] ?? screens.home!)();
}

export function App() {
  const [rawRoute, navigate] = useRoute();
  const route = LEGACY_ROUTES[rawRoute] ?? rawRoute;
  useDaySnapshot();

  // Old bookmarks and mail links land on the new destination.
  useEffect(() => {
    if (LEGACY_ROUTES[rawRoute]) navigate(LEGACY_ROUTES[rawRoute] as string);
  }, [rawRoute, navigate]);

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
