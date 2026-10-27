import { Sunrise, Target, Route, FolderGit2, Activity, BarChart3, Settings, type LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom bar rather than the overflow sheet. */
  primary?: boolean;
}

/** Seven destinations. Amazon sits second while it is the active priority. */
export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'My Day', icon: Sunrise, primary: true },
  { id: 'amazon', label: 'Amazon', icon: Target, primary: true },
  { id: 'roadmap', label: 'Roadmap', icon: Route, primary: true },
  { id: 'fitness', label: 'Fitness', icon: Activity, primary: true },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'progress', label: 'Progress', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const PRIMARY_NAV = NAV_ITEMS.filter((n) => n.primary);
export const OVERFLOW_NAV = NAV_ITEMS.filter((n) => !n.primary);

/** Old hashes from the previous navigation keep working. */
export const LEGACY_ROUTES: Record<string, string> = {
  today: 'home',
  dsa: 'progress',
  ai: 'roadmap',
  sde: 'roadmap',
  job: 'projects',
  work: 'projects',
  health: 'fitness',
  email: 'settings',
  analytics: 'progress',
};

export function navLabel(id: string): string {
  return NAV_ITEMS.find((n) => n.id === id)?.label ?? 'My Day';
}
