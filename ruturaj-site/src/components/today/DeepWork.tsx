import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, Pause, Square, Timer } from 'lucide-react';
import { Card, Button } from '@/components/ui/primitives';
import { useUpdateState, useAppState } from '@/hooks/useAppState';
import { todayISO } from '@/engine/dates';
import { cn } from '@/lib/cn';
import type { DeepWorkOutcome } from '@/engine/types';

/**
 * §33 — Deep Work mode.
 *
 * While running, the screen shows the task, the timer and nothing else. The
 * honesty prompt at the end is the point: a session that ran for 50 minutes
 * but produced nothing is recorded as distracted, and the accountability
 * system reads that rather than the raw minute count.
 */

const OUTCOMES: Array<{ id: DeepWorkOutcome; label: string; tone: string }> = [
  { id: 'completed', label: 'Completed', tone: 'border-success/40 text-success hover:bg-success/10' },
  { id: 'partial', label: 'Partially done', tone: 'border-accent/40 text-accent hover:bg-accent/10' },
  { id: 'blocked', label: 'Blocked', tone: 'border-info/40 text-info hover:bg-info/10' },
  { id: 'distracted', label: 'Distracted', tone: 'border-danger/40 text-danger hover:bg-danger/10' },
];

function fmt(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function DeepWork({ defaultLabel }: { defaultLabel: string }) {
  const state = useAppState();
  const update = useUpdateState();
  const reduce = useReducedMotion();

  const planned = state.settings.deepWorkMinutes;
  const [label, setLabel] = useState(defaultLabel);
  const [remaining, setRemaining] = useState(planned * 60);
  const [running, setRunning] = useState(false);
  const [asking, setAsking] = useState(false);
  const startedRef = useRef<number | null>(null);

  // Keep the label in step with whatever the planner surfaces, until the timer
  // is actually running — overwriting mid-session would lose what was typed.
  useEffect(() => {
    if (!running && !asking) setLabel(defaultLabel);
  }, [defaultLabel, running, asking]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          setRunning(false);
          setAsking(true);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const start = () => {
    startedRef.current = Date.now();
    setRunning(true);
  };

  const stop = () => {
    setRunning(false);
    setAsking(true);
  };

  const record = (outcome: DeepWorkOutcome) => {
    const actualMinutes = Math.max(1, Math.round((planned * 60 - remaining) / 60));
    update((draft) => {
      draft.deepWork.push({
        id: `dw-${Date.now()}`,
        date: todayISO(),
        label: label || 'Deep work',
        plannedMinutes: planned,
        actualMinutes,
        outcome,
      });
    });
    setAsking(false);
    setRemaining(planned * 60);
    startedRef.current = null;
  };

  const elapsed = planned * 60 - remaining;
  const pct = (elapsed / (planned * 60)) * 100;
  const active = running || asking;

  return (
    <Card className={cn(active && 'border-accent/35')}>
      <div className="flex items-center gap-2 text-muted">
        <Timer size={15} />
        <p className="text-[12px] uppercase tracking-[0.12em]">
          Deep work · {planned} minutes
        </p>
      </div>

      <AnimatePresence mode="wait">
        {asking ? (
          <motion.div
            key="ask"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4"
          >
            <p className="text-[15px] font-medium">Did you actually complete the task?</p>
            <p className="mt-1 text-[13px] text-muted">
              {Math.round(elapsed / 60)} minutes on &ldquo;{label}&rdquo;. Answer honestly — this
              feeds the accountability score, not a vanity streak.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {OUTCOMES.map((o) => (
                <button
                  key={o.id}
                  onClick={() => record(o.id)}
                  className={cn(
                    'min-h-[44px] rounded-[10px] border text-[13px] transition-colors',
                    o.tone,
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="timer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3"
          >
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={running}
              placeholder="What are you working on?"
              className="h-[42px] w-full rounded-[10px] border border-line bg-bg px-3 text-[14px] text-fg outline-none placeholder:text-faint focus:border-line2 disabled:opacity-70"
            />

            <p
              className={cn(
                'tnum mt-4 text-center font-mono font-bold leading-none transition-colors',
                running ? 'text-accent' : 'text-fg',
              )}
              style={{ fontSize: 'clamp(44px, 12vw, 64px)' }}
            >
              {fmt(remaining)}
            </p>

            <div className="mt-3 h-[4px] w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className="h-full rounded-full bg-accent"
                animate={{ width: `${pct}%` }}
                transition={reduce ? { duration: 0 } : { duration: 0.3 }}
              />
            </div>

            <div className="mt-4 flex gap-2">
              {!running ? (
                <Button variant="primary" className="flex-1" onClick={start}>
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
                <Button variant="ghost" onClick={stop}>
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
