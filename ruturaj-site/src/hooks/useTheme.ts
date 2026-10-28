import { useEffect, useState } from 'react';
import { useAppState } from './useAppState';
import type { Theme } from '@/lib/schema';

const BG = { light: '#F6F4EF', dark: '#0F1217' } as const;
const QUERY = '(prefers-color-scheme: dark)';

export type ResolvedTheme = 'light' | 'dark';

export function resolveTheme(theme: Theme, prefersDark: boolean): ResolvedTheme {
  return theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
}

/** The theme as it would resolve right now, without subscribing to changes. */
export function currentResolvedTheme(theme: Theme): ResolvedTheme {
  return resolveTheme(theme, typeof window !== 'undefined' && window.matchMedia(QUERY).matches);
}

/**
 * Applies the chosen theme to the document: `data-theme="dark"` on <html>
 * switches every colour token, `color-scheme` fixes native controls, and the
 * browser chrome colour follows. "System" tracks the OS setting live.
 */
export function useTheme(): ResolvedTheme {
  const theme = useAppState().settings.theme;
  const [resolved, setResolved] = useState<ResolvedTheme>(() => currentResolvedTheme(theme));

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    const apply = () => {
      const next = resolveTheme(theme, mq.matches);
      setResolved(next);
      const root = document.documentElement;
      if (next === 'dark') root.dataset.theme = 'dark';
      else delete root.dataset.theme;
      root.style.colorScheme = next;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BG[next]);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);

  return resolved;
}
