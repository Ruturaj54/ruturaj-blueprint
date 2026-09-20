import { CalendarRange, TriangleAlert } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { Card, SectionTitle, Chip } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { buildWeeklyReview, weekScores, weeklyVerdict } from '@/engine/weekly';
import { formatShort } from '@/engine/dates';

/** §15 — the Sunday review, always available rather than only on Sundays. */
export function WeeklyReviewCard() {
  const state = useAppState();
  const r = buildWeeklyReview(state);
  const scores = weekScores(state);
  const verdict = weeklyVerdict(r);

  return (
    <section>
      <SectionTitle
        action={
          <span className="tnum text-[11px] text-faint">
            {formatShort(r.weekStart)} – {formatShort(r.weekEnd)}
          </span>
        }
      >
        <span className="inline-flex items-center gap-1.5">
          <CalendarRange size={13} />
          Weekly review
        </span>
      </SectionTitle>

      <Card>
        {/* day strip */}
        <div className="flex gap-1.5">
          {scores.map(({ date, score }) => (
            <div key={date} className="flex-1">
              <div
                className={cn(
                  'h-[30px] rounded-[6px] border',
                  score === undefined
                    ? 'border-line bg-white/[0.02]'
                    : score >= 70
                      ? 'border-success/40 bg-success/25'
                      : score >= 40
                        ? 'border-accent/40 bg-accent/20'
                        : 'border-danger/40 bg-danger/20',
                )}
              />
              <p className="tnum mt-1 text-center text-[10px] text-faint">
                {score === undefined ? '—' : score}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 border-t border-line pt-4 text-[13px] leading-relaxed">{verdict}</p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Block title="Career">
            <Row label="DSA problems" value={r.career.dsaSolved} />
            <Row label="Clean solve rate" value={`${r.career.dsaAccuracy}%`} />
            <Row label="Tasks completed" value={r.career.tasksCompleted} />
            <Row label="Foundation milestones" value={r.career.foundationCompleted} />
            {r.career.weakestPattern && (
              <Row label="Weakest pattern" value={r.career.weakestPattern} />
            )}
          </Block>

          <Block title="Discipline">
            <Row label="Planned" value={r.discipline.plannedItems} />
            <Row label="Completed" value={r.discipline.completedItems} />
            <Row label="Completion" value={`${r.discipline.completionPct}%`} />
            <Row label="Focus minutes" value={r.discipline.focusMinutes} />
            <Row label="Days logged" value={`${r.discipline.daysLogged}/7`} />
          </Block>

          <Block title="Current job">
            {r.job.achievements.length === 0 ? (
              <p className="text-[13px] text-muted">Nothing logged this week.</p>
            ) : (
              <>
                {r.job.achievements.slice(0, 3).map((a, i) => (
                  <p key={i} className="mb-1.5 text-[13px] leading-snug">
                    {a}
                  </p>
                ))}
                {r.job.metricNeeded > 0 && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full border border-danger/30 bg-danger/10 px-2 py-[3px] text-[11px] text-danger">
                    <TriangleAlert size={11} />
                    {r.job.metricNeeded} need a metric
                  </span>
                )}
              </>
            )}
          </Block>

          <Block title="Health">
            <Row label="Runs" value={r.health.runs} />
            <Row label="Distance" value={`${r.health.km} km`} />
            <Row label="Average sleep" value={r.health.avgSleep ? `${r.health.avgSleep} h` : '—'} />
            <Row
              label="Supplement adherence"
              value={r.health.supplementAdherence === null ? '—' : `${r.health.supplementAdherence}%`}
            />
          </Block>
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <div className="flex items-center gap-2">
            <p className="text-[11px] uppercase tracking-[0.12em] text-faint">Next week</p>
            <Chip tone="accent">Top 5 only</Chip>
          </div>
          {r.nextWeek.length === 0 ? (
            <p className="mt-2 text-[13px] text-muted">Nothing queued.</p>
          ) : (
            <ol className="mt-2.5 space-y-1.5">
              {r.nextWeek.map((t, i) => (
                <li key={t} className="flex gap-2.5 text-[13px]">
                  <span className="tnum font-mono text-[12px] text-faint">{i + 1}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
          )}
          {r.discipline.behindSchedule && (
            <p className="mt-3 text-[12px] text-danger">
              You are behind against the last seven days, so optional work is already being shed
              from your daily missions automatically.
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-[0.12em] text-faint">{title}</p>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-[3px] text-[13px]">
      <span className="text-muted">{label}</span>
      <span className="tnum font-mono text-[12px]">{value}</span>
    </div>
  );
}
