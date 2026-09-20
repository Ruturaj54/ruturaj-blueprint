import {
  Home,
  ListChecks,
  Route,
  Code2,
  BrainCircuit,
  Server,
  Briefcase,
  Building2,
  HeartPulse,
  Mail,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom bar rather than the overflow sheet. */
  primary?: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, primary: true },
  { id: 'today', label: 'Today', icon: ListChecks, primary: true },
  { id: 'dsa', label: 'DSA', icon: Code2, primary: true },
  { id: 'ai', label: 'AI', icon: BrainCircuit, primary: true },
  { id: 'roadmap', label: 'Roadmap', icon: Route },
  { id: 'sde', label: 'SDE', icon: Server },
  { id: 'job', label: 'Job', icon: Briefcase },
  { id: 'work', label: 'Work', icon: Building2 },
  { id: 'health', label: 'Health', icon: HeartPulse },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const PRIMARY_NAV = NAV_ITEMS.filter((n) => n.primary);
export const OVERFLOW_NAV = NAV_ITEMS.filter((n) => !n.primary);

export function navLabel(id: string): string {
  return NAV_ITEMS.find((n) => n.id === id)?.label ?? 'Home';
}
