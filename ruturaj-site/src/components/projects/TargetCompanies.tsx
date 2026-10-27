import { Card, SectionTitle, Chip } from '@/components/ui/primitives';
import { TARGET_COMPANIES } from '@/data/companies';

/** The shape of each target loop, every entry carrying its own caveat. */
export function TargetCompanies() {
  return (
    <section>
      <SectionTitle>Target companies</SectionTitle>
      <p className="mb-3 px-1 text-[13px] leading-relaxed text-muted">
        Interview processes change by team, level and location and are not published contracts. Treat these as
        the shape to prepare for, and confirm specifics with the recruiter for the actual loop.
      </p>
      <div className="space-y-3">
        {TARGET_COMPANIES.map((c) => (
          <Card key={c.id}>
            <p className="text-[15px] font-semibold leading-snug">{c.name}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{c.emphasis}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.stages.map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>
            <p className="mt-3 border-t border-line pt-3 text-[12px] leading-relaxed text-faint">
              <span className="font-medium text-muted">Caveat: </span>
              {c.caveat}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
