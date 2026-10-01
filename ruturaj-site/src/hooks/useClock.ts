import { useEffect, useState } from 'react';

const hhmm = (d: Date): string =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

/** The wall clock as "HH:MM", refreshed every minute — enough for "now" in a timetable. */
export function useClock(intervalMs = 60_000): string {
  const [now, setNow] = useState(() => hhmm(new Date()));
  useEffect(() => {
    const t = setInterval(() => setNow(hhmm(new Date())), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
