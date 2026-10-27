import type { AppState } from '@/lib/schema';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { TaskCheckbox } from '@/components/ui/controls';
import { todayISO } from '@/engine/dates';
import { milestoneId, type PortfolioProject } from '@/data/tasks/projects';

/** Milestones ticked so far, read from state.tasks under their milestoneId. */
export function milestoneProgress(state: AppState, project: PortfolioProject): { done: number; total: number } {
  const done = project.milestones.filter((_, i) => state.tasks[milestoneId(project.id, i)]?.status === 'done').length;
  return { done, total: project.milestones.length };
}

/**
 * The milestone checklist. Each tick is a TaskState under proj-<id>-m<n>,
 * so it survives like any other task and counts in the weekly review.
 */
export function ProjectMilestones({ project }: { project: PortfolioProject }) {
  const state = useAppState();
  const update = useUpdateState();

  const toggle = (id: string, next: boolean) => {
    update((draft) => {
      draft.tasks[id] = { ...draft.tasks[id], status: next ? 'done' : 'todo', completedOn: next ? todayISO() : undefined };
    });
  };

  return (
    <div className="-mx-2">
      {project.milestones.map((title, i) => {
        const id = milestoneId(project.id, i);
        return (
          <TaskCheckbox
            key={id}
            checked={state.tasks[id]?.status === 'done'}
            onChange={(v) => toggle(id, v)}
            label={title}
            sublabel={<span className="font-mono text-[10px] text-faint">{id}</span>}
          />
        );
      })}
    </div>
  );
}
