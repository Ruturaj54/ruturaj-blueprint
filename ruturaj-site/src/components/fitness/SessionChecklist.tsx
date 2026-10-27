import type { Session } from '@/data/fitness';
import { TaskCheckbox } from '@/components/ui/controls';

/**
 * The parts of a session: label, minutes and what to actually do. Static by
 * default; with `checked` and `onToggle` each row becomes a checkbox for the
 * "mark done" form. `dense` hides the detail line for the compact card.
 */
export function SessionChecklist({
  session,
  checked,
  onToggle,
  dense,
}: {
  session: Session;
  checked?: ReadonlySet<string>;
  onToggle?: (id: string, next: boolean) => void;
  dense?: boolean;
}) {
  if (checked && onToggle) {
    return (
      <div>
        {session.parts.map((p) => (
          <TaskCheckbox
            key={p.id}
            checked={checked.has(p.id)}
            onChange={(next) => onToggle(p.id, next)}
            label={
              <span className="flex items-baseline justify-between gap-3">
                <span>{p.label}</span>
                <span className="tnum shrink-0 font-mono text-[12px] text-muted">{p.minutes} min</span>
              </span>
            }
            sublabel={dense ? undefined : p.detail}
          />
        ))}
      </div>
    );
  }

  return (
    <ol className="divide-y divide-line">
      {session.parts.map((p, i) => (
        <li key={p.id} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
          <span className="tnum mt-[2px] grid size-[22px] shrink-0 place-items-center rounded-full bg-raised font-mono text-[11px] text-muted">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[14px] font-medium text-fg">{p.label}</p>
              <span className="tnum shrink-0 font-mono text-[12px] text-muted">{p.minutes} min</span>
            </div>
            {!dense && <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{p.detail}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
