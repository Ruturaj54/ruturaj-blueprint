import { Salad } from 'lucide-react';
import { Card, SectionTitle } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { todayISO, addDays, weekStartISO, weekdayOf } from '@/engine/dates';
import { dinnerFor, PROTEIN_DINNERS, PROTEIN_NOTE } from '@/data/meals';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** The week's protein dinners (vegetarian with eggs), tonight marked, plus the spare. */
export function DinnerRotation() {
  const today = todayISO();
  const start = weekStartISO(today);
  const week = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const used = new Set(week.map((d) => dinnerFor(d).id));
  const spare = PROTEIN_DINNERS.filter((d) => !used.has(d.id));

  return (
    <section>
      <SectionTitle>
        <span className="inline-flex items-center gap-1.5">
          <Salad size={13} />
          Protein dinners
        </span>
      </SectionTitle>
      <Card>
        <ol className="divide-y divide-line">
          {week.map((date) => {
            const d = dinnerFor(date);
            const tonight = date === today;
            return (
              <li key={date} className={cn('flex items-baseline gap-3 py-2.5', tonight && '-mx-2 rounded-[10px] bg-accent-soft px-2')}>
                <span className={cn('tnum w-[34px] shrink-0 font-mono text-[12px]', tonight ? 'text-accent' : 'text-faint')}>
                  {DOW[weekdayOf(date)]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] text-fg">{d.name}</span>
                  <span className="block text-[12px] leading-snug text-muted">{d.plate}</span>
                </span>
                <span className="tnum shrink-0 font-mono text-[12px] text-success">~{d.proteinG} g</span>
              </li>
            );
          })}
        </ol>
        {spare.length > 0 && (
          <p className="mt-3 border-t border-line pt-3 text-[12.5px] text-muted">
            Swap in any night: {spare.map((d) => `${d.name} (~${d.proteinG} g)`).join(' · ')}.
          </p>
        )}
        <p className="mt-2 text-[11.5px] leading-relaxed text-faint">{PROTEIN_NOTE}</p>
      </Card>
    </section>
  );
}
