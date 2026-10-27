import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, ProgressBar, Chip } from '@/components/ui/primitives';
import { TaskCheckbox } from '@/components/ui/controls';
import { cn } from '@/lib/cn';
import { FOUNDATION_SUBJECTS, coachFor } from '@/data/foundation';
import { spring } from '@/lib/motion';
import { allSubjectProgress } from '@/engine/foundation';
import type { FoundationStatus } from '@/engine/types';

const STATUS_META: Record<FoundationStatus, { label: string; cls: string }> = {
  not_started: { label: 'Not started', cls: 'text-faint border-line bg-raised' },
  in_progress: { label: 'In progress', cls: 'text-accent border-accent/30 bg-accent-soft' },
  completed: { label: 'Completed', cls: 'text-info border-info/30 bg-info-soft' },
  verified: { label: 'Verified', cls: 'text-success border-success/30 bg-success-soft' },
};

/** One foundation subject: progress, the coaching card, and its milestones. */
export function SubjectCard({ subjectId }: { subjectId: string }) {
  const state = useAppState();
  const update = useUpdateState();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  const subject = FOUNDATION_SUBJECTS.find((s) => s.id === subjectId);
  const p = allSubjectProgress(state).find((x) => x.subject.id === subjectId);
  if (!subject || !p) return null;
  const meta = STATUS_META[p.status];
  const coach = coachFor(subject.id);
  const hours = Math.round(subject.milestones.reduce((n, m) => n + m.estMinutes, 0) / 60);

  const toggle = (id: string, next: boolean) => {
    update((draft) => {
      if (next) draft.foundation[id] = true;
      else delete draft.foundation[id];
    });
  };

  return (
    <Card className="p-0">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileTap={reduce ? undefined : { scale: 0.99 }}
        transition={spring}
        aria-expanded={open}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-medium leading-snug">{subject.name}</p>
              <span className={cn('rounded-full border px-2 py-[2px] text-[10px] uppercase tracking-wide', meta.cls)}>{meta.label}</span>
            </div>
            <p className="mt-0.5 text-[11px] text-faint">
              {subject.source} · about {hours}h
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="tnum font-mono text-[12px] text-muted">
              {p.done}/{p.total}
            </span>
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={reduce ? { duration: 0 } : spring} className="text-faint">
              <ChevronDown size={16} />
            </motion.span>
          </div>
        </div>
        <ProgressBar value={p.pct} tone={p.status === 'verified' ? 'success' : 'accent'} className="mt-3" />
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
            <div className="border-t border-line px-2 pb-2">
              <p className="px-2 py-3 text-[13px] leading-relaxed text-muted">{subject.blurb}</p>
              {coach && (
                <div className="mx-2 mb-2 rounded-[12px] border border-accent/20 bg-accent-soft p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">Ruturaj, do this</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-fg">{coach.doThis}</p>
                  <p className="mt-2 text-[12px] leading-relaxed text-muted">
                    <span className="text-faint">Evidence: </span>
                    {coach.why}
                  </p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                    <span className="text-faint">Go harder: </span>
                    {coach.harder}
                  </p>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                    <span className="text-faint">Proof: </span>
                    {coach.proof}
                  </p>
                </div>
              )}
              {subject.milestones.map((m) => (
                <TaskCheckbox
                  key={m.id}
                  checked={Boolean(state.foundation[m.id])}
                  onChange={(v) => toggle(m.id, v)}
                  label={m.title}
                  sublabel={
                    <span className="flex flex-wrap gap-1.5">
                      <Chip>{m.estMinutes} min</Chip>
                      <Chip>{m.proof}</Chip>
                      {m.mandatory ? <Chip tone="accent">Gates the unlock</Chip> : <Chip>Optional</Chip>}
                    </span>
                  }
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
