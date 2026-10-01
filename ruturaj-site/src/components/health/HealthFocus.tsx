import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Target, Check, X, BookOpenText } from 'lucide-react';
import { Card, SectionTitle } from '@/components/ui/primitives';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import { HEALTH_FOCUS } from '@/data/health';

/**
 * Which health areas apply to him. Stored in the private synced store — not in
 * the code, which is public — and used by the timetable notes, Today's daily
 * care and the mail. Each card keeps three kinds of statement apart: what he
 * tracks, what the general evidence says, and the everyday habits that follow.
 */
export function HealthFocus() {
  const state = useAppState();
  const update = useUpdateState();
  const reduce = useReducedMotion();
  const focus = new Set(state.health.focus);

  const toggle = (id: string) =>
    update((draft) => {
      const set = new Set(draft.health.focus);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      draft.health.focus = HEALTH_FOCUS.map((f) => f.id).filter((x) => set.has(x));
    });

  const active = HEALTH_FOCUS.filter((f) => focus.has(f.id));

  return (
    <section>
      <SectionTitle>
        <span className="inline-flex items-center gap-1.5">
          <Target size={13} />
          Your health focus
        </span>
      </SectionTitle>
      <Card>
        <p className="text-[13px] text-muted">
          Pick what you are working on. It stays in your private synced store, and the daily mail
          starts tracking it from the next morning.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {HEALTH_FOCUS.map((f) => {
            const on = focus.has(f.id);
            return (
              <motion.button
                key={f.id}
                type="button"
                onClick={() => toggle(f.id)}
                whileTap={reduce ? undefined : { scale: 0.95 }}
                transition={spring}
                aria-pressed={on}
                className={cn(
                  'inline-flex min-h-[38px] items-center gap-1.5 rounded-full border px-3.5 text-[13px] transition-colors',
                  on ? 'border-success/40 bg-success/10 text-success' : 'border-line2 text-muted hover:bg-raised',
                )}
              >
                {on && <Check size={13} strokeWidth={3} />}
                {f.label}
              </motion.button>
            );
          })}
        </div>
      </Card>

      <AnimatePresence initial={false}>
        {active.map((f) => (
          <motion.div
            key={f.id}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={reduce ? { duration: 0 } : spring}
            className="mt-3"
          >
            <Card animate={false}>
              <p className="text-[15px] font-medium">{f.label}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-info">You track</p>
              <p className="mt-1 text-[13px] text-muted">{f.track}</p>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-faint">
                <BookOpenText size={12} />
                General evidence — not advice about you
              </p>
              <p className="mt-1 text-[13px] text-muted">{f.evidence}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <List title="Do" tone="success" items={f.do} />
                <List title="Avoid" tone="danger" items={f.avoid} />
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  );
}

function List({ title, tone, items }: { title: string; tone: 'success' | 'danger'; items: string[] }) {
  const Icon = tone === 'success' ? Check : X;
  return (
    <div className={cn('rounded-[12px] border p-3', tone === 'success' ? 'border-success/20 bg-success/[0.04]' : 'border-danger/20 bg-danger/[0.04]')}>
      <p className={cn('text-[11px] uppercase tracking-[0.12em]', tone === 'success' ? 'text-success' : 'text-danger')}>{title}</p>
      <ul className="mt-1.5 space-y-1.5">
        {items.map((x) => (
          <li key={x} className="flex gap-2 text-[13px] leading-snug text-fg/90">
            <Icon size={13} className={cn('mt-[3px] shrink-0', tone === 'success' ? 'text-success' : 'text-danger')} />
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}
