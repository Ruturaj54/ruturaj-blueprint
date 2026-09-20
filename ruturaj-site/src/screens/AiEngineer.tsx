import { TrackView } from './TrackView';

/** §32 — AI Engineer mode. The target specialisation gets its own surface. */
export function AiEngineer() {
  return (
    <TrackView
      tracks={['ai', 'project']}
      headline="AI Engineer mode"
      blurb="The highest-priority track. Sequenced to build on your existing RAG exposure rather than restart it — retrieval quality, evaluation and serving, which is where AI Engineer interviews actually land."
      showProjects
    />
  );
}
