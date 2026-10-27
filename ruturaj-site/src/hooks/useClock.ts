import { useEffect, useState } from 'react';
import { istClock } from '@/engine/dates';

/** The IST wall clock as "HH:MM", refreshed every minute. */
export function useClock(intervalMs = 60_000): string {
  const [now, setNow] = useState(() => istClock());
  useEffect(() => {
    const t = setInterval(() => setNow(istClock()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
