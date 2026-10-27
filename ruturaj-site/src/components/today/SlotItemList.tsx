import { CornerDownRight } from 'lucide-react';
import { Chip } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { formatHM, type SlotItem } from '@/engine/schedule';

const DOT: Record<SlotItem['kind'], string> = {
  amazon: 'bg-accent',
  revision: 'bg-warn',
  course: 'bg-accent',
  build: 'bg-accent',
  dsa: 'bg-info',
};

/** The work placed inside one study block, with its done state from the day log. */
export function SlotItemList({
  slotId,
  items,
  completed,
}: {
  slotId: string;
  items: SlotItem[];
  completed: ReadonlySet<string>;
}) {
  if (items.length === 0) {
    return <p className="mt-2 text-[12px] text-faint">Nothing scheduled here yet.</p>;
  }
  return (
    <ul className="mt-2.5 space-y-2">
      {items.map((item) => {
        const done = completed.has(item.id);
        return (
          <li key={`${slotId}-${item.id}`} className="flex items-start gap-2">
            <span className={cn('mt-[7px] size-[6px] shrink-0 rounded-full', done ? 'bg-success' : DOT[item.kind])} />
            <div className="min-w-0 flex-1">
              <p className={cn('text-[13px] leading-snug', done ? 'text-faint line-through' : 'text-fg')}>{item.title}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Chip>
                  {item.partial && item.totalMinutes
                    ? `${formatHM(item.minutes)} of ${formatHM(item.totalMinutes)}`
                    : formatHM(item.minutes)}
                </Chip>
                <Chip tone={item.kind === 'dsa' ? 'info' : item.kind === 'revision' ? 'warn' : 'default'}>{item.context}</Chip>
                {item.carried && (
                  <Chip tone="accent">
                    <CornerDownRight size={11} />
                    Carried over
                  </Chip>
                )}
                {done && <Chip tone="success">Done</Chip>}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
