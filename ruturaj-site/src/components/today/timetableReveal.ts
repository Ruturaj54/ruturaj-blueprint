import { useEffect } from 'react';

/**
 * Lets any card on My Day open the timetable without threading props through
 * the fixed `DayTimetable({ items, date })` contract: a window event expands
 * the disclosure, then the section scrolls into view under the sticky header.
 */

export const TIMETABLE_ANCHOR_ID = 'today-timetable';
const REVEAL_EVENT = 'blueprint:reveal-timetable';

export function revealTimetable(): void {
  window.dispatchEvent(new Event(REVEAL_EVENT));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Give the disclosure a frame to expand before measuring where to scroll.
  window.setTimeout(() => {
    document
      .getElementById(TIMETABLE_ANCHOR_ID)
      ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, 60);
}

export function useTimetableReveal(onReveal: () => void): void {
  useEffect(() => {
    window.addEventListener(REVEAL_EVENT, onReveal);
    return () => window.removeEventListener(REVEAL_EVENT, onReveal);
  }, [onReveal]);
}
