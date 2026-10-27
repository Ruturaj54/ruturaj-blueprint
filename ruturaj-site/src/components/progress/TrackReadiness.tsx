import { useAppState } from '@/hooks/useAppState';
import { Card, SectionTitle, ProgressBar, Chip } from '@/components/ui/primitives';
import { allTrackReadiness } from '@/engine/readiness';
import { programInfo } from '@/engine/program';
import { TRACK_META } from '@/data/tasks';

/**
 * The general tracks, each split four ways (learn, practice, shipped,
 * interview) so reading can never pose as building. These belong to the
 * general roadmap phase, not to the Amazon intensive.
 */
export function TrackReadiness() {
  const state = useAppState();
  const tracks = allTrackReadiness(state).filter((t) => t.total > 0);
  const info = programInfo(state);

  return (
    <section>
      <SectionTitle
        action={
          <Chip tone={info.general.started ? 'accent' : 'default'}>
            {info.general.started ? `Roadmap day ${info.general.day}` : 'Roadmap not started'}
          </Chip>
        }
      >
        Track readiness
      </SectionTitle>
      <Card>
        <p className="text-[12.5px] text-muted">
          These tracks belong to the general roadmap, which starts the day the Amazon phase is marked complete. They
          are not a read on the Amazon interview.
        </p>

        <div className="mt-4 space-y-4">
          {tracks.map((t) => (
            <div key={t.track}>
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="text-fg">{TRACK_META[t.track].name}</span>
                <span className="tnum font-mono text-[12px] text-muted">
                  {t.done}/{t.total} · {t.overall}%
                </span>
              </div>
              <ProgressBar value={t.overall} className="mt-1.5" />
              <div className="tnum mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10.5px] text-faint">
                <span>learn {t.progress.learning}%</span>
                <span>practice {t.progress.practice}%</span>
                <span>shipped {t.progress.demonstration}%</span>
                <span>interview {t.progress.interview}%</span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-4 border-t border-line pt-3 text-[12px] text-faint">
          A high &ldquo;learn&rdquo; number with a low &ldquo;shipped&rdquo; number means the reading is ahead of the
          building. That gap is what an interview finds.
        </p>
      </Card>
    </section>
  );
}
