import { useState } from 'react';
import { Sunrise, Sunset, BedDouble, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, Button, Chip } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { todayISO, isWeekend } from '@/engine/dates';
import { sessionFor, setExerciseOverride, logWorkout } from '@/engine/fitness';
import type { ExerciseSlot } from '@/engine/schedule';
import { exerciseWindow, SLOT_LABEL } from './exercise-window';
import { SlotToggle } from './SlotToggle';
import { WorkoutForm, type WorkoutInput } from './WorkoutForm';
import { SessionChecklist } from './SessionChecklist';

const SLOT_ICON = { morning: Sunrise, evening: Sunset, rest: BedDouble } as const;

/**
 * Today's session: name, minutes and slot, a three-way slot toggle for today
 * only, and "Mark done" with an inline minutes / km / parts form. `compact`
 * is the one-line My Day version; the Fitness tab shows the full checklist.
 */
export function ExerciseCard({ compact, onOpen }: { compact?: boolean; onOpen?: () => void }) {
  const state = useAppState();
  const update = useUpdateState();
  const today = todayISO();
  const { session, slot, logged, done } = sessionFor(state, today);
  const weekend = isWeekend(today);
  const slotWindow = exerciseWindow(state.settings, today, slot);
  const [changing, setChanging] = useState(false);
  const [logging, setLogging] = useState(false);
  const Icon = SLOT_ICON[slot];
  const activeSlot = slot === 'rest' ? null : slot;
  const slotText = slotWindow ? `${SLOT_LABEL[slot]} · ${slotWindow.start}–${slotWindow.end}` : 'Rest today';

  const chooseSlot = (next: ExerciseSlot) => {
    update((draft) => setExerciseOverride(draft, today, next));
    setChanging(false);
  };

  const save = (input: WorkoutInput) => {
    if (!activeSlot) return;
    update((draft) =>
      logWorkout(draft, {
        date: today,
        slot: activeSlot,
        kind: session.kind,
        minutes: input.minutes,
        km: input.km,
        parts: input.parts,
      }),
    );
    setLogging(false);
  };

  const undo = () => {
    const id = logged?.id;
    if (!id) return;
    update((draft) => {
      draft.runs = draft.runs.filter((r) => r.id !== id);
    });
  };

  const toggle = <SlotToggle value={slot} weekend={weekend} defaultSlot={state.settings.exerciseSlot} onChange={chooseSlot} />;

  const status = logged ? (
    <div className="flex flex-wrap items-center gap-2">
      <Chip tone="success">
        <CheckCircle2 size={12} />
        Done · {logged.minutes} min{logged.km ? ` · ${logged.km} km` : ''}
      </Chip>
      <button
        type="button"
        onClick={undo}
        className="inline-flex min-h-[44px] items-center px-2 text-[12px] text-faint transition-colors hover:text-danger"
      >
        Undo
      </button>
    </div>
  ) : logging ? (
    <WorkoutForm session={session} dense={compact} onSave={save} onCancel={() => setLogging(false)} />
  ) : activeSlot ? (
    <Button variant="primary" className={compact ? undefined : 'w-full'} onClick={() => setLogging(true)}>
      Mark done
    </Button>
  ) : (
    <p className="text-[12.5px] text-muted">
      Rest today. {compact ? 'Pick Morning or Evening under Change' : 'Pick Morning or Evening above'} if you still want to
      log a session.
    </p>
  );

  if (compact) {
    const title = (
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-medium text-fg">{session.name}</span>
        <span className="tnum block text-[12px] text-muted">
          {slotText} · {session.minutes} min · {done ? 'done' : 'not yet'}
        </span>
      </span>
    );
    return (
      <Card>
        <div className="flex items-center gap-3">
          <Icon size={18} className={cn('shrink-0', slot === 'rest' ? 'text-faint' : 'text-accent')} />
          {onOpen ? (
            <button type="button" onClick={onOpen} className="flex min-h-[44px] min-w-0 flex-1 items-center gap-1 text-left">
              {title}
              <ChevronRight size={16} className="shrink-0 text-faint" />
            </button>
          ) : (
            <div className="flex min-h-[44px] min-w-0 flex-1 items-center">{title}</div>
          )}
          <button
            type="button"
            onClick={() => setChanging((v) => !v)}
            className="min-h-[44px] shrink-0 px-2 text-[12px] font-medium text-accent"
          >
            {changing ? 'Close' : 'Change'}
          </button>
        </div>
        {changing && <div className="mt-3">{toggle}</div>}
        <div className="mt-3">{status}</div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Today&rsquo;s session</p>
          <p className="mt-1 font-display text-[20px] font-bold leading-tight text-fg">{session.name}</p>
          <p className="tnum mt-1.5 inline-flex items-center gap-1.5 text-[13px] text-muted">
            <Icon size={14} className={slot === 'rest' ? 'text-faint' : 'text-accent'} />
            {slotText} · {session.minutes} min
          </p>
        </div>
        {done && <CheckCircle2 size={22} className="shrink-0 text-success" />}
      </div>

      <div className="mt-4">{toggle}</div>

      {!logging && (
        <div className="mt-4 border-t border-line pt-4">
          <SessionChecklist session={session} />
          <p className="mt-3 text-[12.5px] leading-snug text-muted">{session.note}</p>
        </div>
      )}

      <div className="mt-4">{status}</div>
    </Card>
  );
}
