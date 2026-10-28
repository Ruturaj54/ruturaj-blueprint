import { useSyncExternalStore, useCallback, useEffect, useState } from 'react';
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

/**
 * False while the first pull from the server is in flight on a device that
 * has a passphrase; true otherwise. Rendering before it settles flashed an
 * empty "Start Day 1" on a phone whose real progress was on the server.
 */
export function useInitialSync(): boolean {
  const [ready, setReady] = useState(() => !storage.getPassphrase());
  useEffect(() => {
    if (ready) return undefined;
    let on = true;
    const timeout = setTimeout(() => on && setReady(true), 8000);
    void storage.whenSynced().finally(() => on && setReady(true));
    return () => {
      on = false;
      clearTimeout(timeout);
    };
  }, [ready]);
  return ready;
}

export function useSyncStatus(): storage.SyncStatus {
  return useSyncExternalStore(
    storage.subscribeStatus,
    () => storage.getSyncStatus(),
    () => 'idle' as const,
  );
}
