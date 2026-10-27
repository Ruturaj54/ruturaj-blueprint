import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppState } from '@/hooks/useAppState';
import { Segmented } from '@/components/ui/controls';
import { listContainer } from '@/lib/motion';
import { PROJECTS } from '@/data/tasks';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { WorkLog } from '@/components/projects/WorkLog';
import { Applications } from '@/components/projects/Applications';

const TABS = [
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'work', label: 'Work log' },
  { id: 'applications', label: 'Applications' },
] as const;
type Tab = (typeof TABS)[number]['id'];

/** Portfolio projects, the work achievement log, and the application pipeline. */
export function Projects() {
  const state = useAppState();
  const [tab, setTab] = useState<Tab>('portfolio');
  const planned = PROJECTS.filter((p) => p.status === 'planned').length;
  const shipped = PROJECTS.length - planned;

  const hints: Record<Tab, string | undefined> = {
    portfolio: String(PROJECTS.length),
    work: state.work.length > 0 ? String(state.work.length) : undefined,
    applications: state.applications.length > 0 ? String(state.applications.length) : undefined,
  };
  const options = TABS.map((t) => ({ id: t.id, label: t.label, hint: hints[t.id] }));

  return (
    <div className="space-y-6">
      <Segmented value={tab} options={options} onChange={setTab} layoutId="projects-tabs" />

      <motion.div key={tab} variants={listContainer} initial="hidden" animate="show" className="space-y-6">
        {tab === 'portfolio' && (
          <>
            <p className="px-1 text-[13px] leading-relaxed text-muted">
              Few, finished, explainable. {planned} to build and {shipped} already shipped and waiting for a
              write-up. Tick milestones here; the roadmap tasks each one depends on live under Roadmap, Advanced.
            </p>
            <div className="space-y-3">
              {PROJECTS.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </>
        )}
        {tab === 'work' && <WorkLog />}
        {tab === 'applications' && <Applications />}
      </motion.div>
    </div>
  );
}
