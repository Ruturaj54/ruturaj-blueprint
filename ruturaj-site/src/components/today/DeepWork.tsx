import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, Pause, Square, Timer } from 'lucide-react';
import { Card, Button, inputCls } from '@/components/ui/primitives';
import { useUpdateState, useAppState } from '@/hooks/useAppState';
import { todayISO } from '@/engine/dates';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import type { DeepWorkOutcome } from '@/engine/types';

const OUTCOMES: Array<{ id: DeepWorkOutcome; label: string; tone: string }> = [
  { id: 'completed', label: 'Completed', tone: 'border-success/40 bg-success-soft text-success' },
  { id: 'partial', label: 'Partly done', tone: 'border-accent/40 bg-accent-soft text-accent' },
  { id: 'blocked', label: 'Blocked', tone: 'border-info/40 bg-info-soft text-info' },
  { id: 'distracted', label: 'Distracted', tone: 'border-danger/40 bg-danger-soft text-danger' },
];

const fmt = (totalSeconds: number): string =>
  `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;

/**
 * The focus timer. While it runs the card shows the task and the clock, and
 * the honesty prompt at the end is the point: fifty minutes that produced
 * nothing are recorded as distracted, and the scoring reads that.
 */
export function DeepWork({ defaultLabel }: { defaultLabel: string }) {
  const state = useAppState();
  const update = useUpdateState();
  const reduce = useReducedMotion();
  const today = todayISO();

  const planned = state.settings.deepWorkMinutes;
  const [label, setLabel] = useState(defaultLabel);
  const [remaining, setRemaining] = useState(planned * 60);
  const [running, setRunning] = useState(false);
  const [asking, setAsking] = useState(false);

  const sessions = state.deepWork.filter((d) => d.date === today);
  const focused = sessions.reduce((n, d) => n + d.actualMinutes, 0);

  // Follow the planner's first open item until a session is actually underway.
  useEffect(() => {
    if (!running && !asking) setLabel(defaultLabel);
  }, [defaultLabel, running, asking]);

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && remaining === 0) {
      setRunning(false);
      setAsking(true);
    }
  }, [running, remaining]);

  const elapsed = planned * 60 - remaining;
  const pct = (elapsed / (planned * 60)) * 100;
  const active = running || asking;

  const record = (outcome: DeepWorkOutcome) => {
    const actualMinutes = Math.max(1, Math.round(elapsed / 60));
    update((draft) => {
      draft.deepWork.push({
        id: `dw-${Date.now()}`,
        date: today,
        label: label.trim() || 'Deep work',
        plannedMinutes: planned,
        actualMinutes,
        outcome,
      });
    });
    setAsking(false);
    setRemaining(planned * 60);
  };

  return (
    <Card className={cn(active && 'border-accent/35')}>
      <div className="flex items-center gap-2 text-muted">
        <Timer size={15} />
        <p className="text-[12px] uppercase tracking-[0.12em]">Deep work · {planned} minutes</p>
        {sessions.length > 0 && (
          <span className="tnum ml-auto text-[11px] text-faint">
            {sessions.length} today · {focused}m
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {asking ? (
          <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4">
            <p className="text-[15px] font-medium text-fg">How did that go?</p>
            <p className="mt-1 text-[13px] text-muted">
              {Math.round(elapsed / 60)} minutes on &ldquo;{label}&rdquo;. Answer honestly; the score reads this, not the
              minute count.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {OUTCOMES.map((o) => (
                <motion.button
                  key={o.id}
                  type="button"
                  onClick={() => record(o.id)}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  transition={spring}
                  className={cn('min-h-[44px] rounded-[10px] border text-[13px] font-medium transition-colors', o.tone)}
                >
                  {o.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="timer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-3">
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={running}
              placeholder="What are you working on?"
              className={cn(inputCls, 'disabled:bg-raised disabled:text-muted')}
            />

            <p
              className={cn('tnum mt-4 text-center font-mono font-bold leading-none transition-colors', running ? 'text-accent' : 'text-fg')}
              style={{ fontSize: 'clamp(44px, 12vw, 64px)' }}
            >
              {fmt(remaining)}
            </p>

            <div className="mt-3 h-[4px] w-full overflow-hidden rounded-full bg-line">
              <motion.div
                className="h-full rounded-full bg-accent"
                animate={{ width: `${pct}%` }}
                transition={reduce ? { duration: 0 } : { duration: 0.3 }}
              />
            </div>

            <div className="mt-4 flex gap-2">
              {!running ? (
                <Button variant="primary" className="flex-1" onClick={() => setRunning(true)}>
                  <Play size={16} />
                  {elapsed > 0 ? 'Resume' : 'Start'}
                </Button>
              ) : (
                <Button className="flex-1" onClick={() => setRunning(false)}>
                  <Pause size={16} />
                  Pause
                </Button>
              )}
              {elapsed > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setRunning(false);
                    setAsking(true);
                  }}
                >
                  <Square size={15} />
                  End
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
