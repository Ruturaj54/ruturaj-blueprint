import type { ApplicationStage } from '@/lib/schema';

/** Pipeline stages in the order a loop actually runs. */
export const APPLICATION_STAGES: ReadonlyArray<{ id: ApplicationStage; label: string }> = [
  { id: 'saved', label: 'Saved' },
  { id: 'applied', label: 'Applied' },
  { id: 'oa', label: 'OA' },
  { id: 'recruiter', label: 'Recruiter' },
  { id: 'interview', label: 'Interview' },
  { id: 'final', label: 'Final' },
  { id: 'offer', label: 'Offer' },
  { id: 'rejected', label: 'Rejected' },
];

export function stageLabel(id: ApplicationStage): string {
  return APPLICATION_STAGES.find((s) => s.id === id)?.label ?? id;
}
