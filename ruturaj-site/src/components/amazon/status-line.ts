import type { AppState } from '@/lib/schema';
import { parseDay } from '@/engine/dates';
import { programInfo } from '@/engine/program';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** "19 Oct 2026": the status line needs the year, which formatShort drops. */
export function formatDMY(iso: string): string {
  if (!ISO.test(iso)) return iso;
  return parseDay(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * The three facts in one line, kept apart: what he did, what Amazon has
 * confirmed (nothing), and what he is waiting for. Never a guess.
 */
export function amazonStatusLine(state: AppState): string {
  const a = state.amazon;
  const oa = a.oaDate ? `Online assessment done ${formatDMY(a.oaDate)}` : 'Online assessment date not set';
  const when = a.interviewDate ? formatDMY(a.interviewDate) : 'date not set';
  if (a.stage === 'interview_scheduled') return `${oa} · outcome not confirmed · interview scheduled ${when}`;
  if (a.stage === 'interview_done') return `${oa} · interview completed ${when} · outcome not confirmed`;
  return `${oa} · outcome not confirmed · no interview invitation yet`;
}

/** "Day 4 of 14 · 10 days left", or the honest alternative. */
export function windowLine(state: AppState): string {
  const info = programInfo(state);
  if (!info.started) return 'Day 1 not started yet';
  if (info.phase === 'general') {
    const on = state.program.amazonCompletedOn;
    return `Amazon phase marked complete${on ? ` on ${formatDMY(on)}` : ''} · the roadmap is today's programme`;
  }
  const w = info.amazon;
  if (w.overrun) return 'Window over: extend or mark complete';
  const left = w.daysLeft <= 1 ? 'last day' : `${w.daysLeft} days left`;
  return `Day ${w.day} of ${w.windowDays} · ${left}`;
}
