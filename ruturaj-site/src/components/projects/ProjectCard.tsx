import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { Card, Chip, ProgressBar } from '@/components/ui/primitives';
import { spring } from '@/lib/motion';
import type { PortfolioProject } from '@/data/tasks/projects';
import { Disclosure } from './Disclosure';
import { ProjectMilestones, milestoneProgress } from './ProjectMilestones';

/** Body copy with every "Metric needed" picked out, so a missing number is never hidden. */
function SectionText({ text }: { text: string }) {
  const parts = text.split(/(Metric needed)/);
  return (
    <p className="text-[13px] leading-relaxed text-muted">
      {parts.map((part, i) =>
        part === 'Metric needed' ? (
          <span key={i} className="font-medium text-warn">
            Metric needed
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </p>
  );
}

/**
 * One portfolio project: name, status, stack and milestone progress on the
 * face; problem, why, architecture, milestones, testing, deployment, success
 * criterion and the interview explanation behind folds.
 */
export function ProjectCard({ project }: { project: PortfolioProject }) {
  const state = useAppState();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const { done, total } = milestoneProgress(state, project);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const linkedDone = project.taskIds.filter((id) => state.tasks[id]?.status === 'done').length;
  const shipped = project.status === 'shipped';

  return (
    <Card className="p-0">
      <motion.button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        whileTap={reduce ? undefined : { scale: 0.99 }}
        transition={spring}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-semibold leading-snug">{project.name}</p>
              <Chip tone={shipped ? 'success' : 'info'}>{shipped ? 'Shipped · polish and write up' : 'To build'}</Chip>
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">{project.tagline}</p>
          </div>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={reduce ? { duration: 0 } : spring} className="mt-1 shrink-0 text-faint">
            <ChevronDown size={16} />
          </motion.span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <Chip key={s}>{s}</Chip>
          ))}
        </div>
        <ProgressBar value={pct} tone={total > 0 && done === total ? 'success' : 'accent'} className="mt-3" />
        <p className="tnum mt-1.5 text-[12px] text-muted">
          {done} of {total} milestones
          {project.taskIds.length > 0 && (
            <span className="text-faint">
              {' '}· {linkedDone} of {project.taskIds.length} linked roadmap tasks done
            </span>
          )}
        </p>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : spring}
            className="overflow-hidden"
          >
            <div className="border-t border-line px-4 pb-2 pt-3">
              <div className="mb-2 rounded-[12px] border border-accent/20 bg-accent-soft p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">What they should remember</p>
                <p className="mt-1 text-[13px] leading-relaxed text-fg">{project.headline}</p>
              </div>
              <Disclosure title="Problem">
                <SectionText text={project.problem} />
              </Disclosure>
              <Disclosure title="Why this one">
                <SectionText text={project.why} />
              </Disclosure>
              <Disclosure title="Architecture">
                <SectionText text={project.architecture} />
              </Disclosure>
              <Disclosure title="Milestones" hint={`${done}/${total}`} defaultOpen>
                <ProjectMilestones project={project} />
              </Disclosure>
              <Disclosure title="Testing">
                <SectionText text={project.testing} />
              </Disclosure>
              <Disclosure title="Deployment">
                <SectionText text={project.deployment} />
              </Disclosure>
              <Disclosure title="Success criterion">
                <SectionText text={project.success} />
              </Disclosure>
              <Disclosure title="What to explain">
                <SectionText text={project.explain} />
              </Disclosure>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
