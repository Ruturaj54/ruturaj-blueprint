import { useEffect, useState } from 'react';
import { CalendarArrowUp } from 'lucide-react';
import { Card, SectionTitle, inputCls } from '@/components/ui/primitives';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { addDays, formatWeekday } from '@/engine/dates';
import { todayWork } from '@/engine/today-items';
import { formatHM } from '@/engine/schedule';

const PREVIEW = 4;

/**
 * The 23:15 block: what tomorrow already holds (the planner builds it; the
 * run and the walk are fixed) and one line in his own words. Tomorrow's
 * morning mail quotes that line back to him.
 */
export function TomorrowCard({ date }: { date: string }) {
  const state = useAppState();
  const update = useUpdateState();
  const tomorrow = addDays(date, 1);
  const work = todayWork(state, tomorrow);
  const saved = state.days[date]?.tomorrow ?? '';
  const [text, setText] = useState(saved);
  useEffect(() => setText(saved), [saved]);

  const save = () => {
    const next = text.trim();
    if (next === saved) return;
    update((draft) => {
      const log = (draft.days[date] ??= { planned: [], completed: [] });
      if (next) log.tomorrow = next.slice(0, 200);
      else delete log.tomorrow;
    });
  };

  const items = work.items.slice(0, PREVIEW);
  const more = work.items.length - items.length;

  return (
    <section>
      <SectionTitle action={<span className="tnum text-[11px] text-faint">{formatHM(work.minutes)} planned</span>}>
        <span className="inline-flex items-center gap-1.5">
          <CalendarArrowUp size={13} />
          Plan {formatWeekday(tomorrow)}
        </span>
      </SectionTitle>
      <Card>
        {items.length === 0 ? (
          <p className="text-[13px] text-muted">Nothing is queued for tomorrow yet. Write the first thing you will do.</p>
        ) : (
          <ul className="space-y-1.5">
            {items.map((i) => (
              <li key={i.id} className="flex items-baseline gap-2 text-[13px]">
                <span className="min-w-0 flex-1 text-fg">{i.title}</span>
                <span className="tnum shrink-0 font-mono text-[11px] text-muted">{formatHM(i.minutes)}</span>
              </li>
            ))}
            {more > 0 && <li className="text-[12px] text-faint">+{more} more</li>}
            <li className="pt-1 text-[11.5px] text-faint">Built from what is still open; it moves on as you tick tonight&rsquo;s items.</li>
          </ul>
        )}
        <label className="mt-4 block border-t border-line pt-4">
          <span className="mb-1.5 block text-[12px] font-medium text-muted">Tomorrow in one line</span>
          <input
            value={text}
            maxLength={200}
            onChange={(e) => setText(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
            placeholder="e.g. Two pointers before 18:30, finish Python Part 2, walk the full 5 km"
            className={inputCls}
          />
          <span className="mt-1 block text-[11.5px] text-faint">Saved when you leave the field. The morning mail reads it back to you.</span>
        </label>
      </Card>
    </section>
  );
}
