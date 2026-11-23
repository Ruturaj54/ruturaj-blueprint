import { Utensils } from 'lucide-react';
import { Card, Chip } from '@/components/ui/primitives';
import { dinnerFor, PROTEIN_NOTE } from '@/data/meals';

/**
 * Tonight's protein dinner, vegetarian with eggs, from the weekly rotation.
 * The figure is a rough estimate for the portion written, and says so.
 */
export function DinnerCard({ date, at }: { date: string; at: string | null }) {
  const dinner = dinnerFor(date);
  return (
    <Card>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-warn">
          <Utensils size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted">
            Tonight&rsquo;s dinner{at ? <span className="tnum"> · {at}</span> : null}
          </p>
          <p className="mt-1 text-[15px] font-medium leading-snug text-fg">{dinner.name}</p>
          <p className="mt-1 text-[12.5px] leading-snug text-muted">{dinner.plate}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip tone="success">About {dinner.proteinG} g protein</Chip>
            <Chip>Veg + eggs</Chip>
          </div>
          <p className="mt-2 text-[11.5px] leading-relaxed text-faint">{PROTEIN_NOTE}</p>
        </div>
      </div>
    </Card>
  );
}
