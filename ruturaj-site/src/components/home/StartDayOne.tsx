import type { ReactNode } from 'react';
import { Play, ArrowRight, Activity, BookOpen, Clock, MonitorPlay } from 'lucide-react';
import { Card, Button } from '@/components/ui/primitives';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { todayISO, formatLong } from '@/engine/dates';
import { startProgram } from '@/engine/program';
import { todayWork } from '@/engine/today-items';
import { sessionFor, exerciseSlotFor } from '@/engine/fitness';
import { daySlots, dayTypeOf, formatHM } from '@/engine/schedule';

const PREVIEW_ITEMS = 5;

/**
 * The explicit Day 1 action. Shows what Day 1 actually holds (the prep set,
 * tonight's lecture, the run and the walk, the study blocks) so pressing Start
 * is an informed decision, then calls `startProgram` and seeds today's plan
 * snapshot.
 */
export function StartDayOne({ navigate }: { navigate: (id: string) => void }) {
  const state = useAppState();
  const update = useUpdateState();
  const today = todayISO();
  const work = todayWork(state, today);
  const plan = work.amazon;
  const session = sessionFor(state, today);
  const blocks = daySlots(state.settings, dayTypeOf(today), exerciseSlotFor(state, today)).filter(
    (s) => s.kind === 'study' && s.capacity > 0,
  );
  const preview = plan?.planned.slice(0, PREVIEW_ITEMS) ?? [];
  const more = (plan?.planned.length ?? 0) - preview.length;

  const start = () => {
    update((draft) => {
      startProgram(draft, today);
      const log = (draft.days[today] ??= { planned: [], completed: [] });
      if (log.planned.length === 0) log.planned = work.plannedIds;
    });
  };

  return (
    <Card tone="amazon" className="p-5">
      <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-amazon-ink">Start My Blueprint</p>
      <h1 className="mt-1 font-display text-[26px] font-extrabold leading-tight text-fg">Day 1 is {formatLong(today)}.</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">
        Today becomes Day 1: surprise prep in the evening block, one Apna College module after dinner, a run every
        morning and a {state.settings.walkTargetKm} km walk every night. Study for surprises, so the call never
        catches you cold. History is kept.
      </p>

      <div className="mt-4 space-y-3">
        <PreviewBlock icon={<BookOpen size={14} />} title={`Prep set · ${plan ? formatHM(plan.totalMinutes) : '—'}`}>
          {preview.length === 0 ? (
            <p className="text-[13px] text-muted">No items fit today&rsquo;s study budget. Check the study blocks in Settings.</p>
          ) : (
            <ul className="space-y-1.5">
              {preview.map((p) => (
                <li key={p.id} className="flex items-baseline gap-2 text-[13px]">
                  <span className="min-w-0 flex-1 text-fg">{p.revision ? `Re-solve cold: ${p.item.title}` : p.item.title}</span>
                  <span className="tnum shrink-0 font-mono text-[11px] text-muted">{p.minutes}m</span>
                </li>
              ))}
              {more > 0 && <li className="text-[12px] text-faint">+{more} more in the full set</li>}
            </ul>
          )}
        </PreviewBlock>

        {work.lecture.length > 0 && (
          <PreviewBlock icon={<MonitorPlay size={14} />} title="Tonight’s lecture · Apna College">
            {work.lecture.map((m) => (
              <p key={m.milestone.id} className="flex items-baseline gap-2 text-[13px]">
                <span className="min-w-0 flex-1 text-fg">{m.milestone.title}</span>
                <span className="tnum shrink-0 font-mono text-[11px] text-muted">{m.minutes}m</span>
              </p>
            ))}
          </PreviewBlock>
        )}

        <PreviewBlock icon={<Activity size={14} />} title="Move">
          <p className="text-[13px] text-fg">
            {session.slot === 'rest' ? 'Rest morning' : `Morning · ${session.session.name}`}
            <span className="tnum text-muted"> · {session.session.minutes}m</span>
          </p>
          <p className="mt-1 text-[13px] text-fg">
            Night · {state.settings.walkTargetKm} km walk in the society, calling home
          </p>
        </PreviewBlock>

        <PreviewBlock icon={<Clock size={14} />} title="Study blocks">
          <ul className="space-y-1">
            {blocks.map((b) => (
              <li key={b.id} className="flex items-baseline gap-2 text-[13px]">
                <span className="tnum shrink-0 font-mono text-[11.5px] text-muted">
                  {b.start}–{b.end}
                </span>
                <span className="min-w-0 flex-1 truncate text-fg">{b.label}</span>
                <span className="tnum shrink-0 text-[11px] text-faint">{formatHM(b.capacity)}</span>
              </li>
            ))}
          </ul>
        </PreviewBlock>
      </div>

      <Button variant="primary" size="lg" className="mt-5 w-full" onClick={start}>
        <Play size={17} />
        Start My Blueprint — Day 1
      </Button>
      <Button variant="ghost" className="mt-2 w-full" onClick={() => navigate('prep')}>
        See the full prep plan first
        <ArrowRight size={15} />
      </Button>
    </Card>
  );
}

function PreviewBlock({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div className="rounded-[12px] border border-line bg-surface px-3.5 py-3">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-muted">
        <span className="text-amazon">{icon}</span>
        {title}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
