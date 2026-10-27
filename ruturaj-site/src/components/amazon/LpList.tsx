import { useEffect, useState } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { AMAZON_LP, type LpStory } from '@/data/amazon';
import type { AmazonItemLog } from '@/lib/schema';
import { Card, Chip, Button, textareaCls } from '@/components/ui/primitives';
import { TaskCheckbox } from '@/components/ui/controls';
import { Proof } from './Proof';
import { useAmazonActions } from './useAmazonActions';

/**
 * The 24 Leadership Principle questions candidates reported. A tick means
 * written in STAR form and said aloud. His own notes live on the log, so a
 * story must be ticked before notes can be kept.
 */
export function LpList() {
  const state = useAppState();
  const act = useAmazonActions();
  const done = AMAZON_LP.filter((s) => state.amazon.items[s.id]).length;

  return (
    <div className="space-y-3">
      <Card>
        <p className="tnum text-[14px] font-medium text-fg">
          {done} of {AMAZON_LP.length} stories ready
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">
          Questions candidates reported, each with a suggested story from your own work and the principles it shows. Tick a
          story once it is written in STAR form and said aloud, not when you have an idea for it. Notes save on the tick, so
          tick first.
        </p>
      </Card>
      {AMAZON_LP.map((s) => (
        <StoryCard
          key={s.id}
          story={s}
          log={state.amazon.items[s.id]}
          onTick={() => act.toggleCheck(s.id)}
          onNote={(note) => act.setNote(s.id, note)}
        />
      ))}
    </div>
  );
}

function StoryCard({
  story,
  log,
  onTick,
  onNote,
}: {
  story: LpStory;
  log: AmazonItemLog | undefined;
  onTick: () => void;
  onNote: (note: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="p-2" animate={false}>
      <TaskCheckbox tone="amazon" checked={Boolean(log)} onChange={onTick} label={story.q} sublabel={`Story: ${story.s}`} />
      <div className="flex flex-wrap items-center gap-1.5 px-3 pb-1">
        {story.p.map((p) => (
          <Chip key={p} tone="amazon">
            {p}
          </Chip>
        ))}
        {story.note && <Chip tone="warn">{story.note}</Chip>}
        <Proof src={story.src} />
      </div>
      <div className="px-3">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="inline-flex min-h-[44px] items-center text-[12.5px] font-medium text-accent hover:underline"
        >
          {open ? 'Hide notes' : log?.note ? 'Your STAR notes' : 'Add STAR notes'}
        </button>
        {open &&
          (log ? (
            <NoteEditor value={log.note ?? ''} onSave={onNote} />
          ) : (
            <p className="pb-2 text-[12px] text-muted">Notes save on the tick: tick the story first, then write.</p>
          ))}
      </div>
    </Card>
  );
}

function NoteEditor({ value, onSave }: { value: string; onSave: (note: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  const dirty = draft.trim() !== value.trim();
  return (
    <div className="pb-2">
      <textarea
        rows={5}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (dirty) onSave(draft);
        }}
        placeholder="Situation, task, action, result. Put the numbers in; the Bar Raiser will ask for them."
        className={textareaCls}
      />
      <div className="mt-2 flex items-center gap-3">
        <Button variant="outline" disabled={!dirty} onClick={() => onSave(draft)}>
          Save note
        </Button>
        <span className="text-[11.5px] text-faint">{dirty ? 'Unsaved' : 'Saved'}</span>
      </div>
    </div>
  );
}
