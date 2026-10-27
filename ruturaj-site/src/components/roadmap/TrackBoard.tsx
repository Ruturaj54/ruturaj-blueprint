import { useState } from 'react';
import { Lock, Search } from 'lucide-react';
import { SectionTitle, inputCls } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { ALL_TASKS } from '@/data/tasks';
import { READINESS_TRACKS } from '@/engine/readiness';
import type { TrackId } from '@/engine/types';
import { TrackCard } from './TrackCard';

/**
 * All advanced-phase tracks with search and a per-track progress read.
 * Stays visible while the gate is shut, so what is coming is never a
 * mystery, but ticking is disabled so the foundation cannot be skipped.
 */
export function TrackBoard({ locked }: { locked: boolean }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const matches = (track: TrackId) =>
    ALL_TASKS.filter(
      (t) =>
        t.track === track &&
        (q === '' ||
          t.title.toLowerCase().includes(q) ||
          t.rationale?.toLowerCase().includes(q) ||
          t.source?.toLowerCase().includes(q)),
    );

  return (
    <section>
      <SectionTitle
        action={
          locked ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-faint">
              <Lock size={12} />
              Locked until the gate clears
            </span>
          ) : undefined
        }
      >
        Career tracks
      </SectionTitle>

      <div className="relative mb-3">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks, sources, rationale"
          aria-label="Search tasks"
          className={cn(inputCls, 'min-h-[44px] pl-9')}
        />
      </div>

      <div className="space-y-3">
        {READINESS_TRACKS.map((track) => {
          const tasks = matches(track);
          if (q !== '' && tasks.length === 0) return null;
          return <TrackCard key={track} track={track} tasks={tasks} locked={locked} forceOpen={q !== ''} />;
        })}
      </div>
    </section>
  );
}
