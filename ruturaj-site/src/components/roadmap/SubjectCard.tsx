import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, ProgressBar, Chip, TaskCheckbox } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { FOUNDATION_SUBJECTS } from '@/data/foundation';
import { allSubjectProgress } from '@/engine/foundation';
import type { FoundationStatus } from '@/engine/types';

const STATUS_META: Record<FoundationStatus, { label: string; cls: string }> = {
  not_started: { label: 'Not started', cls: 'text-faint border-white/10 bg-white/[0.03]' },
  in_progress: { label: 'In progress', cls: 'text-accent border-accent/30 bg-accent/10' },
  completed: { label: 'Completed', cls: 'text-info border-info/30 bg-info/10' },
  verified: { label: 'Verified', cls: 'text-success border-success/30 bg-success/10' },
};

export function SubjectCard({ subjectId }: { subjectId: string }) {
  const state = useAppState();
  const update = useUpdateState();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  const subject = FOUNDATION_SUBJECTS.find((s) => s.id === subjectId);
  if (!subject) return null;
  const p = allSubjectProgress(state).find((x) => x.subject.id === subjectId)!;
  const meta = STATUS_META[p.status];

  const toggle = (id: string, next: boolean) => {
    update((draft) => {
      if (next) draft.foundation[id] = true;
      else delete draft.foundation[id];
    });
  };

  return (
    <Card className="p-0">
      <button onClick={() => setOpen((v) => !v)} className="w-full p-4 text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-medium">{subject.name}</p>
              <span
                className={cn(
                  'rounded-full border px-2 py-[2px] text-[10px] uppercase tracking-wide',
                  meta.cls,
                )}
              >
                {meta.label}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-faint">
              {subject.source} &middot;{' '}
              {Math.round(subject.milestones.reduce((n, m) => n + m.estMinutes, 0) / 60)}h
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="tnum font-mono text-[12px] text-muted">
              {p.done}/{p.total}
            </span>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={reduce ? { duration: 0 } : undefined}
              className="text-faint"
            >
              <ChevronDown size={16} />
            </motion.span>
          </div>
        </div>
        <ProgressBar
          value={p.pct}
          tone={p.status === 'verified' ? 'success' : 'accent'}
          className="mt-3"
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-line px-2 pb-2">
              <p className="px-2 py-3 text-[13px] text-muted">{subject.blurb}</p>
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
                      {m.mandatory ? (
                        <Chip tone="accent">Gates the unlock</Chip>
                      ) : (
                        <Chip>Optional</Chip>
                      )}
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
