import { Target } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { Card } from '@/components/ui/primitives';
import { amazonStatusLine, windowLine } from './status-line';

/** The orange identity band: the one place the Amazon colour leads. */
export function AmazonHeader() {
  const state = useAppState();
  return (
    <Card tone="amazon">
      <div className="flex items-start gap-3">
        <span className="grid size-[44px] shrink-0 place-items-center rounded-[12px] bg-amazon text-white">
          <Target size={22} />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-[22px] font-extrabold leading-tight tracking-tight text-amazon-ink">Amazon SDE-1</h1>
          <p className="mt-1 text-[13px] leading-snug text-amazon-ink/80">{amazonStatusLine(state)}</p>
          <p className="tnum mt-1.5 text-[13px] font-semibold text-amazon-ink">{windowLine(state)}</p>
        </div>
      </div>
    </Card>
  );
}
