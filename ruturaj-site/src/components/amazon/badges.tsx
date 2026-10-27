import { motion, useReducedMotion } from 'framer-motion';
import { Chip, PriorityPill } from '@/components/ui/primitives';
import { lcUrl, richText, type LcDifficulty } from '@/data/amazon';
import type { AmazonOutcome } from '@/lib/schema';
import type { Priority } from '@/engine/types';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';

/**
 * Small shared pieces for every Amazon list: difficulty, LeetCode link,
 * tier pill, asked badge, frequency chip, outcome chip, bold-aware text.
 */

/** Invisible 8px halo so a small chip still has a 44px tap target. */
export const HIT = "relative before:absolute before:-inset-2 before:content-['']";

export const DIFFICULTY_LABEL: Record<LcDifficulty, string> = { E: 'Easy', M: 'Medium', H: 'Hard' };
const DIFFICULTY_CLASS: Record<LcDifficulty, string> = { E: 'text-success', M: 'text-warn', H: 'text-danger' };

export const OUTCOME_LABEL: Record<AmazonOutcome, string> = {
  independent: 'Solved it myself',
  hint: 'Needed a hint',
  reviewed: 'Read the solution',
};

export const askedOf = (a: number | undefined): 0 | 1 | 2 => (a === 1 ? 1 : a === 2 ? 2 : 0);

export function Difficulty({ d }: { d: LcDifficulty }) {
  return <span className={cn('text-[11px] font-medium', DIFFICULTY_CLASS[d])}>{DIFFICULTY_LABEL[d]}</span>;
}

export function LcLink({ slug, n, name, className }: { slug: string; n?: number; name: string; className?: string }) {
  return (
    <a
      href={lcUrl(slug)}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'font-medium text-fg underline decoration-line2 underline-offset-[3px] hover:text-accent hover:decoration-accent',
        className,
      )}
    >
      {n !== undefined && <span className="tnum mr-1 font-mono text-[12px] text-faint">#{n}</span>}
      {name}
    </a>
  );
}

export function Minutes({ minutes }: { minutes: number }) {
  return <span className="tnum font-mono text-[11px] text-faint">{minutes}m</span>;
}

export function TierPill({ tier }: { tier: Priority }) {
  return <PriorityPill priority={tier} />;
}

export function AskedBadge({ asked }: { asked: 0 | 1 | 2 }) {
  if (asked === 1) return <Chip tone="amazon">Asked</Chip>;
  if (asked === 2) return <Chip>Asked ’22</Chip>;
  return null;
}

export function FreqChip({ f3 }: { f3?: number | null }) {
  if (f3 === undefined || f3 === null) return null;
  return (
    <span title="Amazon tag frequency on LeetCode over the last 3 months (liquidslr dataset, 20 Oct 2026)">
      <Chip className="tnum font-mono">Freq {Math.round(f3)}</Chip>
    </span>
  );
}

export function OutcomeChip({ outcome }: { outcome?: AmazonOutcome }) {
  if (!outcome) return <Chip tone="success">Done</Chip>;
  const tone = outcome === 'independent' ? 'success' : outcome === 'hint' ? 'warn' : 'info';
  return <Chip tone={tone}>{OUTCOME_LABEL[outcome]}</Chip>;
}

/** Renders the tracker's light HTML (bold only) without innerHTML. */
export function Rich({ html, className }: { html: string; className?: string }) {
  return (
    <span className={className}>
      {richText(html).map((seg, i) =>
        seg.bold ? (
          <strong key={i} className="font-semibold">
            {seg.text}
          </strong>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </span>
  );
}

/** "Day 15" chip that jumps to that day in the plan browser. */
export function DayChip({ day, onClick }: { day: number; onClick: () => void }) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={reduce ? undefined : { scale: 0.94 }}
      transition={spring}
      className={cn(
        HIT,
        'tnum inline-flex items-center rounded-full border border-accent/30 bg-accent-soft px-2.5 py-[3px] font-mono text-[11px] leading-none text-accent hover:border-accent/60',
      )}
    >
      Day {day}
    </motion.button>
  );
}

/** A chip that acts, for tab jumps and small toggles. */
export function ActionChip({ label, onClick, on }: { label: string; onClick: () => void; on?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      whileTap={reduce ? undefined : { scale: 0.94 }}
      transition={spring}
      className={cn(
        HIT,
        'inline-flex items-center rounded-full border px-2.5 py-[3px] text-[11px] leading-none',
        on ? 'border-success/40 bg-success-soft text-success' : 'border-line bg-raised text-muted hover:text-fg',
      )}
    >
      {label}
    </motion.button>
  );
}
