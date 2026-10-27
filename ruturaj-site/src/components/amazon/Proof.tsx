import { AMAZON_SOURCES } from '@/data/amazon';
import { cn } from '@/lib/cn';
import { HIT } from './badges';

const chip = 'inline-flex items-center rounded-full border border-line bg-raised px-2 py-[3px] text-[11px] leading-none text-muted';

/**
 * Proof chips: the short label of each interview report, linking to it, with
 * the full description as the title. Sources without a URL (the Reddit post
 * he shared) render as plain chips.
 */
export function Proof({ src, className }: { src: readonly string[]; className?: string }) {
  if (src.length === 0) return null;
  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1', className)}>
      {src.map((id) => {
        const s = AMAZON_SOURCES[id];
        const label = s?.short ?? id;
        const title = s?.label ?? id;
        return s?.url ? (
          <a
            key={id}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            title={title}
            className={cn(chip, HIT, 'hover:border-accent/40 hover:text-accent')}
          >
            {label}
          </a>
        ) : (
          <span key={id} title={title} className={chip}>
            {label}
          </span>
        );
      })}
    </span>
  );
}
