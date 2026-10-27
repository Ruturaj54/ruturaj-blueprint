import { Plus, Minus, Info } from 'lucide-react';
import { Card, Button, inputCls, textareaCls } from '@/components/ui/primitives';
import { Segmented, Field, Banner } from '@/components/ui/controls';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { programInfo, setAmazonWindow, extendAmazonWindow } from '@/engine/program';
import { formatShort } from '@/engine/dates';
import type { AmazonStage } from '@/lib/schema';
import { Readout } from './Readout';

type WindowChoice = '7' | '14' | '21' | '28';

const WINDOWS: ReadonlyArray<{ id: WindowChoice; label: string }> = [
  { id: '7', label: '7 days' },
  { id: '14', label: '14 days' },
  { id: '21', label: '21 days' },
  { id: '28', label: '28 days' },
];

const STAGES: ReadonlyArray<{ id: AmazonStage; label: string }> = [
  { id: 'awaiting_invite', label: 'Awaiting invitation' },
  { id: 'interview_scheduled', label: 'Interview scheduled' },
  { id: 'interview_done', label: 'Interview done' },
];

/** Window length, extensions, and the recruiter-facing facts: stage, dates, note. */
export function AmazonSettings() {
  const state = useAppState();
  const update = useUpdateState();
  const info = programInfo(state);
  const program = state.program;
  const amazon = state.amazon;

  const windowReadout = !info.started
    ? `${info.amazon.windowDays} days, counted from Day 1`
    : info.amazon.overrun
      ? `Ended ${formatShort(info.amazon.endsOn)}, still the active phase`
      : `Ends ${formatShort(info.amazon.endsOn)} · ${info.amazon.daysLeft} days left`;

  return (
    <Card>
      <p className="mb-1.5 text-[12px] font-medium text-muted">Intensive window</p>
      <Segmented
        value={String(program.amazonWindowDays) as WindowChoice}
        options={WINDOWS}
        onChange={(v) => update((draft) => setAmazonWindow(draft, Number(v)))}
        layoutId="settings-amazon-window"
        tone="amazon"
      />
      <p className="mt-1.5 text-[11.5px] text-faint">
        Choosing a length clears any extensions. The planner spreads the curriculum across it; a
        shorter window sheds P3 work first.
      </p>

      <div className="mt-3">
        <Readout
          label="Extensions"
          value={program.amazonExtendedDays > 0 ? `+${program.amazonExtendedDays} days` : 'None'}
          tone={program.amazonExtendedDays > 0 ? 'amazon' : 'muted'}
        />
        <Readout label="Window" value={windowReadout} tone={info.amazon.overrun ? 'warn' : 'default'} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button onClick={() => update((draft) => extendAmazonWindow(draft, 7))}>
          <Plus size={15} />
          Extend by 7 days
        </Button>
        {program.amazonExtendedDays > 0 && (
          <Button variant="ghost" onClick={() => update((draft) => extendAmazonWindow(draft, -7))}>
            <Minus size={15} />
            Remove 7 days
          </Button>
        )}
      </div>

      <div className="mt-5 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
        <Field label="Stage">
          <select
            className={inputCls}
            value={amazon.stage}
            onChange={(e) =>
              update((draft) => {
                draft.amazon.stage = e.target.value as AmazonStage;
              })
            }
          >
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Interview date" hint="Leave empty until the recruiter sends one.">
          <input
            type="date"
            className={inputCls}
            value={amazon.interviewDate ?? ''}
            onChange={(e) =>
              update((draft) => {
                if (e.target.value) draft.amazon.interviewDate = e.target.value;
                else delete draft.amazon.interviewDate;
              })
            }
          />
        </Field>
        <Field label="Online assessment date" hint="The day you actually sat it.">
          <input
            type="date"
            className={inputCls}
            value={amazon.oaDate}
            onChange={(e) =>
              update((draft) => {
                if (e.target.value) draft.amazon.oaDate = e.target.value;
              })
            }
          />
        </Field>
        <Field label="Note" hint="Recruiter name, format, anything they told you.">
          <textarea
            className={textareaCls}
            rows={2}
            value={amazon.interviewNote ?? ''}
            onChange={(e) =>
              update((draft) => {
                if (e.target.value) draft.amazon.interviewNote = e.target.value;
                else delete draft.amazon.interviewNote;
              })
            }
          />
        </Field>
      </div>

      <div className="mt-4">
        <Banner tone="default" icon={<Info size={14} className="text-muted" />}>
          Amazon publishes no timeline after the assessment; the date here is only what the recruiter
          actually sent.
        </Banner>
      </div>
    </Card>
  );
}
