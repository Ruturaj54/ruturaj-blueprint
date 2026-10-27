import { ExternalLink } from 'lucide-react';
import { AMAZON_SOURCES } from '@/data/amazon';
import { Card, SectionTitle } from '@/components/ui/primitives';

/**
 * Every report and dataset behind the module, so each proof chip has a
 * home, plus the resources he collected himself.
 */

const YOUR_RESOURCES: ReadonlyArray<{ label: string; url: string }> = [
  {
    label: 'amazon.jobs: software development topics',
    url: 'https://www.amazon.jobs/content/en/how-we-hire/interview-prep/software-development-topics',
  },
  { label: 'amazon.jobs: Leadership Principles', url: 'https://www.amazon.jobs/content/en/our-workplace/leadership-principles' },
  {
    label: 'Kumar K: online assessment notes (Google Doc)',
    url: 'https://docs.google.com/document/u/0/d/1GGc3IdFNgvbhR-gzwiTgRpPZTwZxwNLmYZHar5OzXdk/mobilebasic?pli=1',
  },
  { label: 'videsiqna.in', url: 'https://videsiqna.in/' },
  { label: 'NeetCode roadmap', url: 'https://neetcode.io/roadmap' },
];

const NOTE =
  "Built from 18 interview reports describing 17 loops (15 distinct SDE-1 loops from 2025–26, where the Reddit post and LC 8542365 tell the same loop, plus 2 from 2022) and LeetCode's company frequency data via the liquidslr dataset updated 20 Oct 2026. Candidate reports are what people remember; treat them as the shape of the loop, not a script.";

const linkCls = 'block min-h-[44px] px-4 py-3 transition-colors hover:bg-raised';

export function SourcesList() {
  const entries = Object.entries(AMAZON_SOURCES);
  return (
    <div className="space-y-5">
      <section>
        <SectionTitle>
          Interview reports and data <span className="text-faint">· {entries.length}</span>
        </SectionTitle>
        <Card className="divide-y divide-line p-0">
          {entries.map(([id, s]) => {
            const body = (
              <>
                <span className="block text-[13.5px] leading-snug text-fg">{s.label}</span>
                <span className="mt-0.5 block text-[11.5px] text-faint">
                  {s.short}
                  {s.url ? '' : ' · shared by you'}
                </span>
              </>
            );
            return s.url ? (
              <a key={id} href={s.url} target="_blank" rel="noreferrer" className={linkCls}>
                {body}
              </a>
            ) : (
              <div key={id} className="min-h-[44px] px-4 py-3">
                {body}
              </div>
            );
          })}
        </Card>
      </section>

      <section>
        <SectionTitle>Your resources</SectionTitle>
        <Card className="divide-y divide-line p-0">
          {YOUR_RESOURCES.map((r) => (
            <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className={`${linkCls} flex items-center justify-between gap-3`}>
              <span className="text-[13.5px] text-fg">{r.label}</span>
              <ExternalLink size={14} className="shrink-0 text-faint" />
            </a>
          ))}
        </Card>
      </section>

      <p className="text-[12.5px] leading-relaxed text-muted">{NOTE}</p>
    </div>
  );
}
