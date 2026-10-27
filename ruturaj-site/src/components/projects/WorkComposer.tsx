import { useState } from 'react';
import { Plus, TriangleAlert } from 'lucide-react';
import { useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle, Button, inputCls, textareaCls } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { todayISO } from '@/engine/dates';
import { buildStatement, WORK_TAGS } from '@/engine/achievements';

/**
 * Turns a plain sentence about work into a resume-grade statement. It never
 * invents a number: without a measured impact the entry is flagged
 * "Metric needed" and stays flagged until the real figure is found.
 */
export function WorkComposer() {
  const update = useUpdateState();
  const [raw, setRaw] = useState('');
  const [metric, setMetric] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const preview = raw.trim() ? buildStatement(raw, metric, tags) : null;

  const add = () => {
    if (!raw.trim()) return;
    const built = buildStatement(raw, metric, tags);
    update((draft) => {
      draft.work.unshift({
        id: `work-${Date.now()}`,
        date: todayISO(),
        raw: raw.trim(),
        statement: built.statement,
        metricNeeded: built.metricNeeded,
        tags,
      });
    });
    setRaw('');
    setMetric('');
    setTags([]);
  };

  const toggleTag = (t: string) => setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  return (
    <section>
      <SectionTitle>What did you accomplish?</SectionTitle>
      <Card>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={3}
          placeholder="Plainly, in your own words. e.g. fixed the Jenkins job that kept failing on parallel stages"
          className={textareaCls}
        />
        <input
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
          placeholder="Measured impact, if you have one (e.g. build time 40 min to 12 min)"
          className={cn(inputCls, 'mt-2')}
        />

        <div className="mt-3 flex flex-wrap gap-1.5">
          {WORK_TAGS.map((t) => {
            const on = tags.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => toggleTag(t)}
                className={cn(
                  'min-h-[44px] rounded-full border px-3.5 text-[12px] transition-colors',
                  on ? 'border-accent/40 bg-accent-soft text-accent' : 'border-line bg-surface text-muted hover:bg-raised',
                )}
              >
                {t}
              </button>
            );
          })}
        </div>

        {preview && (
          <div className="mt-4 rounded-[12px] border border-line bg-raised p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">Resume-grade version</p>
            <p className="mt-1.5 text-[14px] leading-relaxed">{preview.statement}</p>
            {preview.metricNeeded && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-warn">
                <TriangleAlert size={12} />
                Metric needed: find the real number before this goes on a resume.
              </p>
            )}
          </div>
        )}

        <Button variant="primary" className="mt-3 w-full" onClick={add} disabled={!raw.trim()}>
          <Plus size={15} />
          Log achievement
        </Button>
      </Card>
    </section>
  );
}
