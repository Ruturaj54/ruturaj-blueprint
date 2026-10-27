import { useMemo } from 'react';
import { useUpdateState } from '@/hooks/useAppState';
import {
  logAmazonItem,
  unlogAmazonItem,
  unlogAmazonRevisit,
  toggleAmazonCheck,
  toggleAmazonExtra,
  toggleSolidTopic,
  type LogInput,
} from '@/engine/amazon';

/**
 * Every write the Amazon module makes, in one place. Components call these
 * instead of reaching for useUpdateState themselves, so the engine mutators
 * stay the only code that shapes draft.amazon.
 */
export function useAmazonActions() {
  const update = useUpdateState();
  return useMemo(
    () => ({
      log: (key: string, input: LogInput = {}) => update((d) => logAmazonItem(d, key, input)),
      unlog: (key: string) => update((d) => unlogAmazonItem(d, key)),
      /** Reverts a mis-tapped revisit. The original solve stays on record. */
      unlogRevisit: (key: string, date: string) => update((d) => unlogAmazonRevisit(d, key, date)),
      toggleCheck: (id: string) => update((d) => toggleAmazonCheck(d, id)),
      toggleExtra: (xkey: string) => update((d) => toggleAmazonExtra(d, xkey)),
      toggleSolid: (id: string) => update((d) => toggleSolidTopic(d, id)),
      /** STAR notes live on the log, so a story has to be ticked first. */
      setNote: (id: string, note: string) =>
        update((d) => {
          const log = d.amazon.items[id];
          if (!log) return;
          const trimmed = note.trim();
          if (trimmed) log.note = trimmed;
          else delete log.note;
        }),
    }),
    [update],
  );
}

export type AmazonActions = ReturnType<typeof useAmazonActions>;
