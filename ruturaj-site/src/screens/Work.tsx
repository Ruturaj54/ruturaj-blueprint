import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Copy, Trash2, TriangleAlert, Building2, CalendarCheck } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle, Button, Chip, EmptyState } from '@/components/ui/primitives';
import { listContainer } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { todayISO, formatShort, weekStartISO } from '@/engine/dates';
import { buildStatement, WORK_TAGS } from '@/engine/achievements';

const inputCls =
  'w-full rounded-[10px] border border-line bg-bg px-3 py-2.5 text-[14px] text-fg outline-none placeholder:text-faint focus:border-line2';

export function Work() {
  const state = useAppState();
  const update = useUpdateState();
  const [raw, setRaw] = useState('');
  const [metric, setMetric] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const thisWeek = weekStartISO(todayISO());
  const weekItems = state.work.filter((w) => weekStartISO(w.date) === thisWeek);
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

  const copy = (text: string, id: string) => {
    void navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-7">
      <Card>
        <div className="flex items-center gap-2 text-muted">
          <Building2 size={15} />
          <p className="text-[12px] uppercase tracking-[0.12em]">Parallel Wireless</p>
        </div>
        <p className="mt-2 text-[13px] text-muted">
          Strong performance here is not a distraction from the switch — it is the material your
          resume and your references are made of. Capture the work while you still remember the
          detail.
        </p>
        <div className="mt-4 flex gap-6">
          <div>
            <p className="tnum font-display text-[26px] font-bold leading-none">
              {state.work.length}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">Total logged</p>
          </div>
          <div>
            <p className="tnum font-display text-[26px] font-bold leading-none text-accent">
              {weekItems.length}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">This week</p>
          </div>
          <div>
            <p className="tnum font-display text-[26px] font-bold leading-none text-danger">
              {state.work.filter((w) => w.metricNeeded).length}
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">Need a metric</p>
          </div>
        </div>
      </Card>

      {/* ---- composer ---- */}
      <section>
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5">
            <CalendarCheck size={13} />
            What did you accomplish?
          </span>
        </SectionTitle>
        <Card>
          <textarea
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={3}
            placeholder="Plainly, in your own words. e.g. fixed the Jenkins job that kept failing on parallel stages"
            className={cn(inputCls, 'resize-y leading-relaxed')}
          />

          <input
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            placeholder="Measured impact, if you have one (e.g. build time 40 min to 12 min)"
            className={cn(inputCls, 'mt-2')}
          />

          <div className="mt-3 flex flex-wrap gap-1.5">
            {WORK_TAGS.map((t) => (
              <button
                key={t}
                onClick={() =>
                  setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
                }
                className={cn(
                  'rounded-full border px-2.5 py-[5px] text-[11px] transition-colors',
                  tags.includes(t)
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-line text-muted hover:bg-raised',
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {preview && (
            <div className="mt-4 rounded-[10px] border border-line bg-bg p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-faint">
                Resume-grade version
              </p>
              <p className="mt-1.5 text-[14px] leading-relaxed">{preview.statement}</p>
              {preview.metricNeeded && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-danger">
                  <TriangleAlert size={12} />
                  Metric needed — find the real number before this goes on a resume.
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

      {/* ---- log ---- */}
      <section>
        <SectionTitle>Achievement log</SectionTitle>
        {state.work.length === 0 ? (
          <EmptyState
            icon={<Building2 size={22} />}
            title="Nothing logged yet"
            body="Add one line every Friday. In four months that is a resume section you did not have to reconstruct from memory."
          />
        ) : (
          <div className="space-y-3">
            {state.work.map((w) => (
              <Card key={w.id}>
                <p className="text-[14px] leading-relaxed">{w.statement ?? w.raw}</p>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="tnum text-[11px] text-faint">{formatShort(w.date)}</span>
                  {w.tags.map((t) => (
                    <Chip key={t}>{t}</Chip>
                  ))}
                  {w.metricNeeded && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-danger/30 bg-danger/10 px-2 py-[3px] text-[11px] text-danger">
                      <TriangleAlert size={11} />
                      Metric needed
                    </span>
                  )}
                  <span className="ml-auto flex gap-1">
                    <button
                      onClick={() => copy(w.statement ?? w.raw, w.id)}
                      aria-label="Copy statement"
                      className="p-1 text-faint transition-colors hover:text-fg"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      onClick={() =>
                        update((draft) => {
                          draft.work = draft.work.filter((x) => x.id !== w.id);
                        })
                      }
                      aria-label="Delete"
                      className="p-1 text-faint transition-colors hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </span>
                </div>
                {copied === w.id && (
                  <p className="mt-1.5 text-[11px] text-success">Copied to clipboard.</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
