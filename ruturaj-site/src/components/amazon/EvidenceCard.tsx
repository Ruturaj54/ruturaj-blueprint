import { Card, Chip, ProgressBar } from '@/components/ui/primitives';
import { Stat } from '@/components/ui/controls';
import type { AmazonSummary, Counter } from '@/engine/amazon-stats';

/**
 * Evidence, never a single readiness percentage. Each number is something
 * he logged: problems by outcome, asked problems solved cold, stories said
 * aloud, mocks survived. The weak-topic rule is stated next to the result.
 */
export function EvidenceCard({ summary, compact = false }: { summary: AmazonSummary; compact?: boolean }) {
  const s = summary;
  const unlogged = s.problems.total - s.problems.logged;
  return (
    <Card>
      <p className="font-display text-[16px] font-bold leading-tight">Evidence</p>
      <p className="mt-0.5 text-[12px] text-muted">
        Not a readiness score. Only outcomes you logged count, and a tick is not mastery.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4">
        <Stat value={s.problems.independent} label={`solved myself of ${s.problems.total}`} tone="amazon" />
        <Stat value={`${s.asked.independent}/${s.asked.total}`} label="asked problems, solved myself" tone="amazon" />
        <Stat value={s.revisions.passed} label="revisions passed cold" tone="success" />
        <Stat value={s.streak} unit={s.streak === 1 ? 'day' : 'days'} label="current streak" tone={s.streak > 0 ? 'success' : 'default'} />
      </div>

      <p className="tnum mt-4 text-[12.5px] leading-relaxed text-muted">
        Unique problems: solved myself {s.problems.independent} · needed a hint {s.problems.hint} · read the solution{' '}
        {s.problems.reviewed} · not yet logged {unlogged} · {s.problems.total} in the curriculum
      </p>

      {compact ? (
        <p className="tnum mt-2 text-[12.5px] text-muted">
          LP stories {s.lp.done}/{s.lp.total} · Resume {s.resume.done}/{s.resume.total} · GenAI {s.genai.done}/{s.genai.total} ·
          Mocks {s.mocks.done}/{s.mocks.total} · Day-of {s.dayof.done}/{s.dayof.total}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <CounterRow label="LP stories written and said aloud" c={s.lp} />
          <CounterRow label="Resume deep dives ready" c={s.resume} />
          <CounterRow label="GenAI answers ready" c={s.genai} />
          <CounterRow label="Mocks done" c={s.mocks} />
          <CounterRow label="Interview-day checklist" c={s.dayof} />
          <p className="tnum text-[12.5px] text-muted">
            Re-solves: {s.revisions.due} due now · {s.revisions.scheduled} scheduled · {s.revisions.passed} passed cold
          </p>
        </div>
      )}

      <div className="mt-4 border-t border-line pt-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">Weak topics</p>
        {s.weakTopics.length === 0 ? (
          <p className="mt-1 text-[12.5px] text-muted">None flagged yet.</p>
        ) : (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {s.weakTopics.map((t) => (
              <Chip key={t} tone="warn">
                {t}
              </Chip>
            ))}
          </div>
        )}
        <p className="mt-1.5 text-[12px] text-faint">Why: two or more problems in that day's topic needed a hint or the solution.</p>
      </div>
    </Card>
  );
}

function CounterRow({ label, c }: { label: string; c: Counter }) {
  const pct = c.total ? Math.round((c.done / c.total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-fg">{label}</span>
        <span className="tnum shrink-0 font-mono text-[12px] text-muted">
          {c.done}/{c.total}
        </span>
      </div>
      <ProgressBar value={pct} tone={pct === 100 ? 'success' : 'amazon'} className="mt-1.5" />
    </div>
  );
}
