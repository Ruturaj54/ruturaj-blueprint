import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Moon, Send, Check } from 'lucide-react';
import { Card, SectionTitle, Button } from '@/components/ui/primitives';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import { todayISO } from '@/engine/dates';
import { buildPraise } from '@/engine/praise';
import { dayScore, dayExtras, plannedHits } from '@/engine/planner';
import * as storage from '@/lib/storage';
import { PraiseCard } from '@/components/PraiseCard';

/**
 * The night check-in. He reports the day, the app compares it against
 * yesterday, and the praise appears immediately rather than waiting for a mail.
 */
export function CloseDay() {
  const state = useAppState();
  const update = useUpdateState();
  const reduce = useReducedMotion();
  const today = todayISO();
  const log = state.days[today];
  const closed = Boolean(log?.closedAt);

  const [mailState, setMailState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const praise = buildPraise(state, today);

  const close = () => {
    // Score the plan, not the running total. `completed` accumulates every tick
    // all day while `planned` is a snapshot, so the naive ratio produced 800%.
    const score = dayScore(state, today) ?? 0;
    update((draft) => {
      const d = (draft.days[today] ??= { planned: [], completed: [] });
      d.closedAt = new Date().toISOString();
      d.score = score;
    });
  };

  const reopen = () => {
    update((draft) => {
      const d = draft.days[today];
      if (d) delete d.closedAt;
    });
    setMailState('idle');
  };

  const sendRecap = async () => {
    const key = storage.getPassphrase();
    if (!key) {
      setMailState('failed');
      return;
    }
    setMailState('sending');
    storage.flush();
    try {
      // Give the push a moment to land so the mail reflects tonight, not the
      // last sync.
      await new Promise((r) => setTimeout(r, 900));
      const res = await fetch('/.netlify/functions/send-email?type=evening', {
        method: 'POST',
        headers: { 'x-blueprint-key': key },
      });
      setMailState(res.ok ? 'sent' : 'failed');
    } catch {
      setMailState('failed');
    }
  };

  return (
    <section>
      <SectionTitle>
        <span className="inline-flex items-center gap-1.5">
          <Moon size={13} />
          Close the day
        </span>
      </SectionTitle>

      {!closed ? (
        <Card>
          <p className="text-[13px] text-muted">
            Before you sleep: tick what you actually did above, log your runs and DSA, then close
            the day. The app compares tonight against yesterday and tells you what changed.
          </p>
          <div className="mt-3 flex flex-wrap gap-4">
            <Mini label="Planned" value={`${plannedHits(state, today)}/${log?.planned.length ?? 0}`} />
            <Mini label="Extra" value={dayExtras(state, today)} />
            <Mini label="DSA" value={state.dsa.filter((a) => a.date === today).length} />
            <Mini label="Runs" value={state.runs.filter((r) => r.date === today).length} />
            <Mini
              label="Focus"
              value={`${state.deepWork.filter((d) => d.date === today).reduce((n, d) => n + d.actualMinutes, 0)}m`}
            />
          </div>
          <Button variant="primary" size="lg" className="mt-4 w-full" onClick={close}>
            <Check size={17} />
            Close today
          </Button>
        </Card>
      ) : (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={spring}
        >
          <PraiseCard praise={praise} />

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1"
              onClick={() => void sendRecap()}
              disabled={mailState === 'sending' || mailState === 'sent'}
            >
              <Send size={15} />
              {mailState === 'sending'
                ? 'Sending…'
                : mailState === 'sent'
                  ? 'Recap sent'
                  : 'Email me the recap'}
            </Button>
            <Button variant="ghost" onClick={reopen}>
              Reopen day
            </Button>
          </div>

          {mailState === 'failed' && (
            <p className="mt-2 text-[12px] text-danger">
              Could not send. Check Settings &rarr; Sync, and note this only works on the deployed
              site.
            </p>
          )}
        </motion.div>
      )}
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className={cn('tnum font-display text-[22px] font-bold leading-none')}>{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
    </div>
  );
}
