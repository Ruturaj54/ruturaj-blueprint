import { ArrowRight } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { Card, Button } from '@/components/ui/primitives';
import { programInfo } from '@/engine/program';
import { dayContext } from '@/engine/mission';
import { formatShort, TARGET_DATE } from '@/engine/dates';

/**
 * Phase-aware header. While the Amazon intensive is the daily programme the
 * roadmap is a preview; once that phase is marked complete it takes over and
 * the banner reads its day and phase from programInfo and dayContext.
 */
export function RoadmapBanner({ navigate }: { navigate: (id: string) => void }) {
  const state = useAppState();
  const info = programInfo(state);

  if (info.phase === 'amazon') {
    return (
      <Card tone="amazon">
        <p className="font-display text-[15px] font-bold leading-snug">Activates after the Amazon intensive.</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          Everything here stays visible as what comes next; you can tick modules you finish, but the
          daily plan stays Amazon until you mark that phase complete in the Amazon tab.
        </p>
        {info.amazon.overrun && (
          <p className="mt-2 text-[12.5px] leading-relaxed text-amazon-ink">
            The Amazon window ended on {formatShort(info.amazon.endsOn)}. Extend it or mark it complete
            in the Amazon tab.
          </p>
        )}
        <Button variant="amazon" className="mt-3 w-full sm:w-auto" onClick={() => navigate('amazon')}>
          Open Amazon
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
