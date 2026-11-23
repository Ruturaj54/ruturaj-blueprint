import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, type ReactElement } from 'react';
import { useRoute } from '@/lib/router';
import { Shell } from '@/components/Shell';
import { PraiseModal } from '@/components/PraiseModal';
import { useDaySnapshot } from '@/hooks/useDaySnapshot';
import { useInitialSync } from '@/hooks/useAppState';
import { useTheme } from '@/hooks/useTheme';
import { RefreshCw } from 'lucide-react';
import { pageSlide, pageFade } from '@/lib/motion';
import { LEGACY_ROUTES, NAV_ITEMS } from '@/nav';
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
    prep: () => <Amazon navigate={navigate} />,
    roadmap: () => <Roadmap navigate={navigate} />,
    projects: () => <Projects />,
    fitness: () => <Fitness />,
    progress: () => <Progress navigate={navigate} />,
    settings: () => <Settings />,
  };
  return (screens[route] ?? screens.home!)();
}

const ORDER = NAV_ITEMS.map((n) => n.id);

/** -1, 0 or 1: which way the new tab sits from the old one in the nav. */
function directionBetween(from: string, to: string): number {
  const a = ORDER.indexOf(from);
  const b = ORDER.indexOf(to);
  if (a === -1 || b === -1 || a === b) return 0;
  return b > a ? 1 : -1;
}

/** While the first pull runs on a phone: the shape of My Day, breathing, instead of a bare spinner. */
function SyncSkeleton() {
  const reduce = useReducedMotion();
  return (
    <div className="space-y-4" aria-busy="true">
      <p className="inline-flex items-center gap-2 text-[13px] text-muted">
        <RefreshCw size={14} className="animate-spin" />
        Syncing your progress from the server
      </p>
      {[148, 104, 196, 120].map((height, i) => (
        <motion.div
          key={height}
          className="rounded-[16px] border border-line bg-surface shadow-card"
          style={{ height }}
          animate={reduce ? undefined : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

export function App() {
  const [rawRoute, navigate] = useRoute();
  const route = LEGACY_ROUTES[rawRoute] ?? rawRoute;
  const ready = useInitialSync();
  const reduce = useReducedMotion();
  const previous = useRef(route);
  const direction = directionBetween(previous.current, route);
  useEffect(() => {
    previous.current = route;
  }, [route]);
  useTheme();
  useDaySnapshot();

  // Old bookmarks and mail links land on the new destination.
  useEffect(() => {
    if (LEGACY_ROUTES[rawRoute]) navigate(LEGACY_ROUTES[rawRoute] as string);
  }, [rawRoute, navigate]);

  return (
    <Shell route={route} navigate={navigate}>
      <PraiseModal />
      {ready ? (
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={route}
            custom={direction}
            variants={reduce ? pageFade : pageSlide}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            {screenFor(route, navigate)}
          </motion.div>
        </AnimatePresence>
      ) : (
        <SyncSkeleton />
      )}
    </Shell>
  );
}
