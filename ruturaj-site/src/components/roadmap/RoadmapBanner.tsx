import { ArrowRight } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { Card, Button } from '@/components/ui/primitives';
import { programInfo } from '@/engine/program';
import { dayContext } from '@/engine/mission';
import { formatShort, TARGET_DATE } from '@/engine/dates';

/**
 * Phase-aware header. While surprise prep is the daily programme the roadmap
 * is a preview (Apna College still moves, one module a night in the lecture
 * block); once prep is marked complete it takes over and the banner reads its
 * day and phase from programInfo and dayContext.
 */
export function RoadmapBanner({ navigate }: { navigate: (id: string) => void }) {
  const state = useAppState();
  const info = programInfo(state);

  if (info.phase === 'amazon') {
    return (
      <Card tone="amazon">
        <p className="font-display text-[15px] font-bold leading-snug">Takes over after surprise prep.</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          Apna College is already moving: one module a night in the lecture block, ticked here too. The rest
          of the roadmap becomes the daily plan when you mark surprise prep complete.
        </p>
        {info.amazon.overrun && (
          <p className="mt-2 text-[12.5px] leading-relaxed text-amazon-ink">
            The prep window ended on {formatShort(info.amazon.endsOn)}. Extend it or mark it complete in
            Surprise Prep.
          </p>
        )}
        <Button variant="amazon" className="mt-3 w-full sm:w-auto" onClick={() => navigate('prep')}>
          Open Surprise Prep
          <ArrowRight size={15} />
        </Button>
      </Card>
    );
  }

  const ctx = dayContext(info.general.day);
  const target = `${formatShort(TARGET_DATE)} ${TARGET_DATE.slice(0, 4)}`;
  return (
    <Card tone="accent">
      <p className="tnum font-display text-[17px] font-bold leading-snug">
        Roadmap · Day {ctx.day} of {info.general.totalDays} · {ctx.phase.label} {ctx.phase.title}
      </p>
      <p className="tnum mt-1.5 text-[13px] leading-relaxed text-muted">
        Day {ctx.dayInPhase} of {ctx.phase.label} · {ctx.daysLeft} days to {target}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-faint">{ctx.phase.focus}</p>
    </Card>
  );
}
