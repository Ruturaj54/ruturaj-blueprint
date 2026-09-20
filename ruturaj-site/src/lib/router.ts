import { useSyncExternalStore, useCallback } from 'react';

/**
 * Hash routing in ~30 lines instead of a router dependency. The app is a fixed
 * set of top-level screens with no nested routes or params, so anything larger
 * would be unused weight.
 */

function subscribe(cb: () => void): () => void {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

function currentHash(): string {
  return window.location.hash.replace(/^#\/?/, '') || 'home';
}

export function useRoute(): [string, (next: string) => void] {
  const route = useSyncExternalStore(subscribe, currentHash, () => 'home');
  const navigate = useCallback((next: string) => {
    window.location.hash = `/${next}`;
    // Screens are full-height; landing mid-scroll on a new one feels broken.
    window.scrollTo({ top: 0 });
  }, []);
  return [route, navigate];
}
