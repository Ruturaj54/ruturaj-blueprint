import { CalendarClock, Target, TriangleAlert } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import type { AmazonStage } from '@/lib/schema';
import { todayISO, daysBetween, formatLong } from '@/engine/dates';
import { Card, inputCls } from '@/components/ui/primitives';
import { Banner, Field, Segmented } from '@/components/ui/controls';
import { amazonStatusLine } from './status-line';

/**
 * The honest state machine. Three facts, kept apart: the assessment he sat,
 * the outcome Amazon has confirmed (none), and the invitation he is waiting
 * for. Nothing here guesses.
 */

const STAGES: ReadonlyArray<{ id: AmazonStage; label: string }> = [
  { id: 'awaiting_invite', label: 'Not received' },
  { id: 'interview_scheduled', label: 'Scheduled' },
  { id: 'interview_done', label: 'Completed' },
];

const TIMELINE_NOTE =
  "Amazon's SDE assessment page says you get an email per section telling you whether you move forward, and that Amazon reaches out directly for an interview. It gives no number of days: 'one or two weeks' is your own planning assumption, and the tracker's reports ranged from about 2 weeks to 3 months.";

export function AmazonStatusCard({ compact = false }: { compact?: boolean }) {
  const state = useAppState();
  const update = useUpdateState();
  const a = state.amazon;
  const today = todayISO();
  const days = a.interviewDate ? daysBetween(today, a.interviewDate) : null;
  const near = days !== null && days >= 0 && days <= 10 && a.stage !== 'interview_done';
  const passed = days !== null && days < 0 && a.stage === 'interview_scheduled';

  const interviewLine =
    days !== null && a.interviewDate
      ? `Interview ${formatLong(a.interviewDate)}, ${days === 0 ? 'today' : days === 1 ? 'tomorrow' : `${days} days away`}. The planner has switched to interview mode: Phase 3, the asked problems and mocks, comes first.`
      : null;

  if (compact) {
    return (
      <Card>
        <div className="flex items-start gap-3">
          <Target size={18} className="mt-0.5 shrink-0 text-amazon" />
          <div className="min-w-0">
            <p className="text-[14px] font-medium leading-snug text-fg">Amazon SDE-1</p>
            <p className="mt-0.5 text-[13px] leading-snug text-muted">{amazonStatusLine(state)}</p>
            {near && interviewLine && <p className="mt-1.5 text-[12.5px] text-amazon-ink">{interviewLine}</p>}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <p className="font-display text-[16px] font-bold leading-tight">Where the process stands</p>
      <p className="mt-0.5 text-[12px] text-muted">Three facts, kept apart. Edit them here or in Settings.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Assessment completed" hint="The date you sat the online assessment.">
          <input
            type="date"
            value={a.oaDate}
            onChange={(e) => {
              const v = e.target.value;
              if (v) update((d) => void (d.amazon.oaDate = v));
            }}
            className={inputCls}
          />
        </Field>
        <div>
          <p className="mb-1.5 text-[12px] font-medium text-muted">Outcome</p>
          <p className="flex min-h-[42px] items-center text-[14px] text-fg">Not confirmed by Amazon.</p>
          <p className="mt-1 text-[11.5px] text-faint">Stays this way until a mail from Amazon says otherwise.</p>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-[12px] font-medium text-muted">Invitation</p>
        <Segmented
          value={a.stage}
          options={STAGES}
          layoutId="amazon-stage"
          tone="amazon"
          onChange={(next) =>
            update((d) => {
              d.amazon.stage = next;
              if (next === 'awaiting_invite') delete d.amazon.interviewDate;
            })
          }
        />
        <p className="mt-1 text-[11.5px] text-faint">Choosing Not received clears the interview date.</p>
      </div>

      {a.stage !== 'awaiting_invite' && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Interview date" hint="Within 10 days of it, the planner puts Phase 3 first.">
            <input
              type="date"
              value={a.interviewDate ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                update((d) => {
                  if (v) d.amazon.interviewDate = v;
                  else delete d.amazon.interviewDate;
                });
              }}
              className={inputCls}
            />
          </Field>
          <Field label="Note (optional)">
            <input
              type="text"
              value={a.interviewNote ?? ''}
              placeholder="Round, format, recruiter's name"
              onChange={(e) => {
                const v = e.target.value;
                update((d) => {
                  if (v) d.amazon.interviewNote = v;
                  else delete d.amazon.interviewNote;
                });
              }}
              className={inputCls}
            />
          </Field>
        </div>
      )}

      <p className="mt-4 text-[12.5px] leading-relaxed text-muted">{TIMELINE_NOTE}</p>

      {near && interviewLine && (
        <div className="mt-3">
          <Banner tone="amazon" icon={<CalendarClock size={16} />}>
            {interviewLine}
          </Banner>
        </div>
      )}
      {passed && (
        <div className="mt-3">
          <Banner tone="warn" icon={<TriangleAlert size={16} />}>
            The interview date has passed. Mark it completed, or set the new date.
          </Banner>
        </div>
      )}
    </Card>
  );
}
