import { AnimatePresence, motion } from 'framer-motion';
import { useRoute } from '@/lib/router';
import { Shell } from '@/components/Shell';
import { pageVariants } from '@/lib/motion';
import { Home } from '@/screens/Home';
import { Roadmap } from '@/screens/Roadmap';
import { Today } from '@/screens/Today';
import { Dsa } from '@/screens/Dsa';
import { Settings } from '@/screens/Settings';
import { Placeholder } from '@/screens/Placeholder';

const PENDING: Record<string, string> = {
  ai: 'AI Engineer mode — today’s AI task and the project track.',
  sde: 'Core CS, system design and backend depth.',
  job: 'Applications, interviews and target companies.',
  work: 'Parallel Wireless achievements and weekly review.',
  health: 'Runs, sleep, supplements and lab values.',
  email: 'Email history, templates and configuration.',
  analytics: 'Trends across execution, DSA and readiness.',
};

export function App() {
  const [route, navigate] = useRoute();

  return (
    <Shell route={route} navigate={navigate}>
      <AnimatePresence mode="wait">
        <motion.div
          key={route}
          variants={pageVariants}
          initial="hidden"
          animate="show"
          exit="exit"
        >
          {route === 'home' ? (
            <Home navigate={navigate} />
          ) : route === 'roadmap' ? (
            <Roadmap />
          ) : route === 'today' ? (
            <Today />
          ) : route === 'dsa' ? (
            <Dsa />
          ) : route === 'settings' ? (
            <Settings />
          ) : (
            <Placeholder
              title={route.charAt(0).toUpperCase() + route.slice(1)}
              blurb={PENDING[route] ?? 'Not built yet.'}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </Shell>
  );
}
