import { Card, PriorityPill, SectionTitle } from '@/components/ui/primitives';
import type { Priority } from '@/engine/types';

/**
 * How this app plans the window: our own inference, stated as rules so he
 * can see why an item is where it is. Mirrors engine/amazon.ts and
 * engine/amazon-plan.ts; change those first, then this.
 */

const TIER_RULES: ReadonlyArray<{ tier: Priority; rule: string }> = [
  {
    tier: 'P0',
    rule: 'Problems asked in a 2025–26 report; the LP, mock, resume, GenAI, LLD, review, ladder, problem and rest tasks; everything on Day 28.',
  },
  {
    tier: 'P1',
    rule: 'Problems with a frequency score of 60 or more (40 or more for Phase 2 core problems), plus the Learn and Notes tasks.',
  },
  {
    tier: 'P2',
    rule: 'Problems asked in a 2022 report, the remaining core problems, and night-block extras scoring 50 or more.',
  },
  {
    tier: 'P3',
    rule: 'The rest. Premium problems drop one tier unless they were asked. The basics of a topic you mark solid also drop here.',
  },
];

const PLANNING: ReadonlyArray<{ title: string; text: string }> = [
  {
    title: 'The window',
    text: 'Day 1 is the day you pressed Start. The intensive is 14 days by default, resizable to 7, 21 or 28, and extends by 7 at a time. Each day is planned to 85% of the study time your timetable allows, so there is air in it.',
  },
  {
    title: 'What fits',
    text: 'The planner adds up the study hours left in the window and keeps the tiers that fit, P0 always. It fills each day in curriculum order at or above that floor; due re-solves come first, at most three a day.',
  },
  {
    title: 'Re-solves',
    text: 'Read the solution: back in 2 days. Needed a hint: back in 3 days. Solved an asked problem yourself: back in 7 days, twice, so it stays warm.',
  },
  {
    title: 'Interview mode',
    text: 'With an interview date within 10 days, Phase 3 (the asked problems and mocks) comes first and the window ends the day before. That is the tracker’s own advice.',
  },
  {
    title: 'Mocks',
    text: 'The tracker puts mocks on Days 4, 11, 17, 18, 24 and 25, its weekend days. The planner keeps curriculum order, so they land on whatever date you reach those days.',
  },
  {
    title: 'Evidence',
    text: 'Progress is counted as outcomes you logged, never as a readiness percentage. A tick without an outcome is not mastery.',
  },
];

export function StrategyCard() {
  return (
    <section>
      <SectionTitle>
        How this app plans it <span className="normal-case tracking-normal text-faint">· our own inference</span>
      </SectionTitle>
      <Card className="space-y-4">
        <div>
          <p className="text-[14px] font-medium text-fg">Tiers</p>
          <ul className="mt-1.5 space-y-1.5">
            {TIER_RULES.map((t) => (
              <li key={t.tier} className="flex items-start gap-2 text-[13px] leading-relaxed text-fg">
                <span className="mt-[3px] shrink-0">
                  <PriorityPill priority={t.tier} />
                </span>
                <span>{t.rule}</span>
              </li>
            ))}
          </ul>
        </div>
        {PLANNING.map((p) => (
          <div key={p.title}>
            <p className="text-[14px] font-medium text-fg">{p.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-fg">{p.text}</p>
          </div>
        ))}
        <div className="rounded-[12px] border border-amazon/30 bg-amazon-soft p-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-amazon-ink">For every problem</p>
          <p className="mt-1 text-[14px] font-medium text-amazon-ink">clarify → brute force → optimal → code → dry run → complexity</p>
        </div>
      </Card>
    </section>
  );
}
