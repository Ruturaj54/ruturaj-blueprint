import { ExternalLink } from 'lucide-react';
import { Card, Chip, SectionTitle } from '@/components/ui/primitives';
import {
  OFFICIAL,
  OFFICIAL_TOPICS,
  OFFICIAL_TOPICS_NOTE,
  RECRUITER_TIPS,
  LEADERSHIP_PRINCIPLES,
  LOOP_NOTE,
  OA_NOTE,
  OA_NO_DAYS,
  type OfficialLink,
} from './official-data';
import { RoundsReported } from './RoundsReported';

/**
 * The Rounds tab's first two blocks: what Amazon itself publishes, then what
 * candidates reported. Each block is labelled so the two are never mixed.
 */

function Source({ link }: { link: OfficialLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="mt-1 inline-flex min-h-[44px] items-center gap-1 text-[12.5px] font-medium text-accent hover:underline"
    >
      {link.label} <ExternalLink size={12} />
    </a>
  );
}

export function RoundsCard() {
  return (
    <div className="space-y-5">
      <section>
        <SectionTitle>Official Amazon guidance</SectionTitle>
        <Card className="space-y-4">
          <div>
            <p className="text-[14px] font-medium text-fg">Topics Amazon lists for software development interviews</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {OFFICIAL_TOPICS.map((t) => (
                <Chip key={t}>{t}</Chip>
              ))}
            </div>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{OFFICIAL_TOPICS_NOTE}</p>
            <Source link={OFFICIAL.topics} />
          </div>

          <div>
            <p className="text-[14px] font-medium text-fg">Six tips from Amazon recruiters</p>
            <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-[13px] leading-relaxed text-fg">
              {RECRUITER_TIPS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ol>
            <Source link={OFFICIAL.tips} />
          </div>

          <div>
            <p className="text-[14px] font-medium text-fg">The 16 Leadership Principles</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {LEADERSHIP_PRINCIPLES.map((p) => (
                <Chip key={p} tone="amazon">
                  {p}
                </Chip>
              ))}
            </div>
            <Source link={OFFICIAL.principles} />
          </div>

          <div>
            <p className="text-[14px] font-medium text-fg">The interview loop</p>
            <p className="mt-1 text-[13px] leading-relaxed text-fg">{LOOP_NOTE}</p>
            <Source link={OFFICIAL.loop} />
          </div>

          <div>
            <p className="text-[14px] font-medium text-fg">After the online assessment</p>
            <p className="mt-1 text-[13px] leading-relaxed text-fg">{OA_NOTE}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{OA_NO_DAYS}</p>
            <Source link={OFFICIAL.oa} />
          </div>
        </Card>
      </section>

      <RoundsReported />
    </div>
  );
}
