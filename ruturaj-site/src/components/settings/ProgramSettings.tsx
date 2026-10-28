import { Flag, CheckCircle2, RotateCcw, CalendarCheck } from 'lucide-react';
import { Card, Chip, inputCls } from '@/components/ui/primitives';
import { Field } from '@/components/ui/controls';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { programInfo, startProgram, completeAmazonPhase, reactivateAmazonPhase, setDayOne } from '@/engine/program';
import { formatLong, formatShort, istDateISO } from '@/engine/dates';
import { ConfirmAction } from './ConfirmAction';
import { Readout } from './Readout';

/**
 * Name, the Day 1 readout and the two phase switches. Day 1 is whatever date
 * he pressed Start on; nothing here is a calendar constant. Both phase
 * actions keep every log, so the copy says so.
 */
export function ProgramSettings() {
  const state = useAppState();
  const update = useUpdateState();
  const info = programInfo(state);
  const program = state.program;
  // The calendar date, not the 04:00 mission date: after midnight he still means the new day.
  const today = istDateISO();

  return (
    <Card>
      <Field label="Your name" hint="Used in the app and at the top of each mail.">
        <input
          className={inputCls}
          value={state.settings.name}
          autoComplete="off"
          onChange={(e) =>
            update((draft) => {
              draft.settings.name = e.target.value;
            })
          }
        />
      </Field>

      {info.started && (
        <div className="mt-4">
          <Field label="Day 1" hint={`Today is Day ${info.day}. The day number advances by date on its own; nothing needs pressing each morning.`}>
            <input
              type="date"
              className={inputCls}
              value={program.startedOn ?? ''}
              max={today}
              onChange={(e) => {
                const v = e.target.value;
                if (v) update((draft) => setDayOne(draft, v));
              }}
            />
          </Field>
          {program.startedOn !== today && (
            <div className="mt-2">
              <ConfirmAction
                icon={<CalendarCheck size={15} />}
                label="Make today Day 1"
                confirmLabel="Yes, today is Day 1"
                tone="accent"
                explain={`Day 1 becomes ${formatLong(today)} and the Amazon window recounts from it. Every tick and log you already made stays.`}
                onConfirm={() => update((draft) => setDayOne(draft, today))}
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        {!info.started && <Readout label="Day 1" value="Not started" tone="muted" />}
        <Readout
          label="Current phase"
          value={
            <Chip tone={info.phase === 'amazon' ? 'amazon' : 'accent'}>
              {info.phase === 'amazon' ? 'Amazon intensive' : 'General roadmap'}
            </Chip>
          }
        />
        <Readout
          label="Amazon completed on"
          value={program.amazonCompletedOn ? formatShort(program.amazonCompletedOn) : 'Not yet'}
          tone={program.amazonCompletedOn ? 'default' : 'muted'}
        />
        <Readout
          label="General roadmap Day 1"
          value={
            program.generalStartedOn
              ? `${formatShort(program.generalStartedOn)} · Day ${info.general.day} of ${info.general.totalDays}`
              : 'Set when the Amazon phase is marked complete'
          }
          tone={program.generalStartedOn ? 'default' : 'muted'}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {!info.started && (
          <ConfirmAction
            variant="primary"
            tone="accent"
            icon={<Flag size={15} />}
            label="Start Day 1"
            confirmLabel="Yes, today is Day 1"
            explain={`Day 1 becomes today, ${formatLong(today)}. The Amazon window counts from it and the daily mails have a real day to report. Only a full reset undoes this.`}
            onConfirm={() => update((draft) => startProgram(draft, today))}
          />
        )}

        {info.started && info.phase === 'amazon' && (
          <ConfirmAction
            icon={<CheckCircle2 size={15} />}
            label="Mark Amazon phase complete"
            confirmLabel="Yes, complete the Amazon phase"
            tone="accent"
            explain="From today the general roadmap is the daily programme, with its own Day 1. Nothing is deleted: every Amazon log, tick and note stays, and you can reactivate the phase any time."
            onConfirm={() => update((draft) => completeAmazonPhase(draft))}
          />
        )}

        {info.started && info.phase === 'general' && (
          <ConfirmAction
            icon={<RotateCcw size={15} />}
            label="Reactivate Amazon"
            confirmLabel="Yes, reactivate Amazon"
            tone="amazon"
            explain="Amazon goes back to being the daily priority, for example when the interview invitation lands. Nothing is deleted: the roadmap keeps its Day 1 and every tick, and its day count carries on."
            onConfirm={() => update((draft) => reactivateAmazonPhase(draft))}
          />
        )}
      </div>
    </Card>
  );
}
