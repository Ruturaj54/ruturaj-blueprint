import { Lightbulb } from 'lucide-react';
import { Card, Chip } from '@/components/ui/primitives';
import { coachFor, TIER_SHORT } from '@/data/foundation';
import type { DailyPlan } from '@/engine/planner';

/**
 * "Ruturaj, do this today — it will help you." The coaching card for the lead
 * mission, with the evidence stated apart from the recommendation.
 */
export function CoachCard({ plan }: { plan: DailyPlan }) {
  const lead = plan.missions.find((m) => m.kind === 'foundation');
  if (!lead || lead.kind !== 'foundation') return null;
  const coach = coachFor(lead.subject.id);
  if (!coach) return null;

  return (
    <Card className="border-accent/25 bg-accent/[0.04]">
      <div className="flex items-center gap-2">
        <Lightbulb size={14} className="text-accent" />
        <p className="text-[11px] uppercase tracking-[0.14em] text-accent">Ruturaj, do this today</p>
      </div>
      <p className="mt-2 text-[13px] text-muted">
        {lead.milestone.title} <span className="text-faint">· {lead.subject.name}</span>
      </p>
      <div className="mt-1.5">
        <Chip tone="accent">{TIER_SHORT[lead.subject.tier]}</Chip>
      </div>
      <p className="mt-3 text-[15px] font-medium leading-relaxed">{coach.doThis}</p>
      <dl className="mt-3 space-y-2.5 text-[13px]">
        <Row term="Why it helps" body={coach.why} />
        <Row term="Go harder" body={coach.harder} />
        <Row term="Proof by tonight" body={coach.proof} />
      </dl>
    </Card>
  );
}

function Row({ term, body }: { term: string; body: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.12em] text-faint">{term}</dt>
      <dd className="mt-0.5 leading-relaxed text-muted">{body}</dd>
    </div>
  );
}
