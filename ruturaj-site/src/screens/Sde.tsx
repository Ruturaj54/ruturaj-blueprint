import { TrackView } from './TrackView';

/** Core CS, system design, backend and the systems/telecom differentiators. */
export function Sde() {
  return (
    <TrackView
      tracks={['cs', 'backend', 'systems', 'devops', 'telecom', 'java', 'react']}
      headline="SDE fundamentals"
      blurb="OS, networking, DBMS and system design, plus production backend depth. Java and React stay capped at P2/P3 on purpose so they cannot crowd out DSA or AI time."
    />
  );
}
