import { SectionTitle } from '@/components/ui/primitives';
import { useAppState } from '@/hooks/useAppState';
import { TIER_LABEL, MANDATORY_HOURS } from '@/data/foundation';
import { allSubjectProgress } from '@/engine/foundation';
import { SubjectCard } from './SubjectCard';

/** Foundation subjects in his order: Course 1, Course 2, then practice. */
export function SubjectTiers() {
  const state = useAppState();
  const progress = allSubjectProgress(state);

  return (
    <section>
      <SectionTitle action={<span className="tnum text-[11px] text-faint">about {MANDATORY_HOURS}h mandatory</span>}>
        Foundation subjects
      </SectionTitle>
      {([1, 2, 3] as const).map((tier) => {
        const inTier = progress.filter((p) => p.subject.tier === tier);
        if (inTier.length === 0) return null;
        const minutes = inTier.reduce(
          (n, p) => n + p.subject.milestones.filter((m) => m.mandatory).reduce((x, m) => x + m.estMinutes, 0),
          0,
        );
        const done = inTier.reduce((n, p) => n + p.mandatoryDone, 0);
        const total = inTier.reduce((n, p) => n + p.mandatoryTotal, 0);
        return (
          <div key={tier} className="mb-5 last:mb-0">
            <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
              <p className="min-w-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">{TIER_LABEL[tier]}</p>
              <span className="tnum shrink-0 text-[11px] text-faint">
                {done}/{total} · about {Math.round(minutes / 60)}h
              </span>
            </div>
            <div className="space-y-3">
              {inTier.map((p) => (
                <SubjectCard key={p.subject.id} subjectId={p.subject.id} />
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
