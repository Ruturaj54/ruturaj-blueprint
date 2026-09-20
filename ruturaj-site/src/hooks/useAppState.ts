import { useSyncExternalStore, useCallback } from 'react';
import * as storage from '@/lib/storage';
import type { AppState } from '@/lib/schema';

/**
 * Binds the storage module to React. Components never import `storage`
 * directly for reads — they take state from here so every subscriber
 * re-renders together on a write.
 */
export function useAppState(): AppState {
  return useSyncExternalStore(storage.subscribe, storage.getState, storage.getState);
}

export function useUpdateState() {
  return useCallback((mutate: (draft: AppState) => void) => {
    storage.update(mutate);
  }, []);
}

export function useSyncStatus(): storage.SyncStatus {
  return useSyncExternalStore(
    storage.subscribeStatus,
    () => storage.getSyncStatus(),
    () => 'idle' as const,
  );
}
