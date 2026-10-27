import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Trash2 } from 'lucide-react';
import { useUpdateState } from '@/hooks/useAppState';
import { Card, Chip, textareaCls } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import { todayISO, formatShort } from '@/engine/dates';
import type { Application, ApplicationStage } from '@/lib/schema';
import { APPLICATION_STAGES, stageLabel } from './stages';

/** One application: stage chips, notes and remove, behind a fold. */
export function ApplicationRow({ app }: { app: Application }) {
  const update = useUpdateState();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  const edit = (fn: (a: Application) => void) =>
    update((draft) => {
      const found = draft.applications.find((x) => x.id === app.id);
      if (found) fn(found);
    });

  const setStage = (stage: ApplicationStage) =>
    edit((a) => {
      a.stage = stage;
      if (stage === 'applied' && !a.appliedOn) a.appliedOn = todayISO();
    });

  const remove = () =>
    update((draft) => {
      draft.applications = draft.applications.filter((x) => x.id !== app.id);
    });

  const tone = app.stage === 'offer' ? 'success' : app.stage === 'rejected' ? 'default' : 'accent';

  return (
    <Card className="p-0">
      <motion.button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        whileTap={reduce ? undefined : { scale: 0.99 }}
        transition={spring}
        className="flex min-h-[60px] w-full items-center gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-snug">{app.company}</p>
          <p className="text-[13px] text-muted">
            {app.role}
            {app.appliedOn && <span className="tnum text-faint"> · applied {formatShort(app.appliedOn)}</span>}
          </p>
        </div>
        <Chip tone={tone}>{stageLabel(app.stage)}</Chip>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={reduce ? { duration: 0 } : spring} className="shrink-0 text-faint">
          <ChevronDown size={16} />
        </motion.span>
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
            <div className="space-y-3 border-t border-line p-4">
              <div className="flex flex-wrap gap-1.5">
                {APPLICATION_STAGES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={app.stage === s.id}
                    onClick={() => setStage(s.id)}
                    className={cn(
                      'min-h-[44px] rounded-full border px-3.5 text-[12px] transition-colors',
                      app.stage === s.id ? 'border-accent/40 bg-accent-soft text-accent' : 'border-line bg-surface text-muted hover:bg-raised',
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <textarea
                value={app.notes ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  edit((a) => {
                    a.notes = v;
                  });
                }}
                rows={2}
                placeholder="Notes, recruiter name, preparation gaps"
                className={textareaCls}
              />
              <button
                type="button"
                onClick={remove}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] px-2 text-[12px] text-faint transition-colors hover:text-danger"
              >
                <Trash2 size={13} />
                Remove
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
