import { Flag, CheckCircle2, RotateCcw } from 'lucide-react';
import { Card, Chip, inputCls } from '@/components/ui/primitives';
import { Field } from '@/components/ui/controls';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { programInfo, startProgram, completeAmazonPhase, reactivateAmazonPhase } from '@/engine/program';
import { formatLong, formatShort, todayISO } from '@/engine/dates';
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

      <div className="mt-4">
        <Readout
          label="Day 1"
          value={info.started ? `${formatLong(info.startedOn)} · Day ${info.day}` : 'Not started'}
          tone={info.started ? 'default' : 'muted'}
        />
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
            explain={`Day 1 becomes today, ${formatLong(todayISO())}. The Amazon window counts from it and the daily mails have a real day to report. Only a full reset undoes this.`}
            onConfirm={() => update((draft) => startProgram(draft))}
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
