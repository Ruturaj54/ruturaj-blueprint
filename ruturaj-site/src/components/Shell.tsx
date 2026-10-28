import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MoreHorizontal, X, Cloud, CloudOff, RefreshCw, Lock, ServerCog, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import { NAV_ITEMS, PRIMARY_NAV, OVERFLOW_NAV } from '@/nav';
import { useSyncStatus, useAppState, useUpdateState } from '@/hooks/useAppState';
import { currentResolvedTheme } from '@/hooks/useTheme';
import { programInfo } from '@/engine/program';

/**
 * App chrome: sidebar on desktop, bottom bar plus an overflow sheet on mobile.
 * The active indicator is one shared `layoutId` so it travels between
 * destinations instead of cross-fading.
 */

function SyncBadge() {
  const status = useSyncStatus();
  const map = {
    idle: { icon: Cloud, text: 'This device', tone: 'text-faint' },
    syncing: { icon: RefreshCw, text: 'Syncing', tone: 'text-info' },
    synced: { icon: Cloud, text: 'Synced', tone: 'text-success' },
    offline: { icon: CloudOff, text: 'Offline', tone: 'text-muted' },
    unauthorized: { icon: Lock, text: 'Key rejected', tone: 'text-danger' },
    misconfigured: { icon: ServerCog, text: 'Server key unset', tone: 'text-danger' },
  } as const;
  const { icon: Icon, text, tone } = map[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-[11px]', tone)} title={text}>
      <Icon size={13} className={status === 'syncing' ? 'animate-spin' : undefined} />
      <span className="hidden sm:inline">{text}</span>
    </span>
  );
}

/** Flips light and dark in one tap; "System" lives in Settings, Appearance. */
function ThemeButton() {
  const theme = useAppState().settings.theme;
  const update = useUpdateState();
  const dark = currentResolvedTheme(theme) === 'dark';
  return (
    <button
      type="button"
      onClick={() =>
        update((draft) => {
          draft.settings.theme = dark ? 'light' : 'dark';
        })
      }
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-fg"
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

function DayChip() {
  const state = useAppState();
  const info = programInfo(state);
  if (!info.started) return <span className="text-[11px] text-faint">Day 1 not started</span>;
  return (
    <span className="tnum inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface px-2.5 py-[3px] text-[11px] font-medium text-fg">
      Day {info.day}
      <span className={cn('text-[10px] uppercase tracking-wide', info.phase === 'amazon' ? 'text-amazon' : 'text-accent')}>
        {info.phase === 'amazon' ? 'Amazon' : 'Roadmap'}
      </span>
    </span>
  );
}

export function Shell({ route, navigate, children }: { route: string; navigate: (next: string) => void; children: ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const reduce = useReducedMotion();
  const overflowActive = OVERFLOW_NAV.some((n) => n.id === route);

  const go = (id: string) => {
    navigate(id);
    setSheetOpen(false);
  };

  return (
    <div className="min-h-dvh lg:flex">
      {/* ---- desktop sidebar ---- */}
      <aside className="sticky top-0 hidden h-dvh w-[236px] shrink-0 flex-col border-r border-line bg-surface px-3 py-5 lg:flex">
        <div className="px-3 pb-5">
          <p className="font-display text-[17px] font-extrabold leading-tight tracking-tight">Ruturaj Blueprint</p>
          <div className="mt-2">
            <DayChip />
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = item.id === route;
            const amazon = item.id === 'amazon';
            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={cn(
                  'relative flex min-h-[42px] items-center gap-3 rounded-[10px] px-3 text-[14px] transition-colors',
                  active ? 'font-semibold text-fg' : 'text-muted hover:text-fg',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={reduce ? { duration: 0 } : spring}
                    className={cn('absolute inset-0 rounded-[10px]', amazon ? 'bg-amazon-soft' : 'bg-accent-soft')}
                  />
                )}
                <item.icon size={17} className={cn('relative z-10 shrink-0', active && (amazon ? 'text-amazon' : 'text-accent'))} />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="flex items-center justify-between px-3 pt-4">
          <SyncBadge />
          <ThemeButton />
        </div>
      </aside>

      {/* ---- content ---- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[54px] items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur-xl lg:hidden">
          <p className="min-w-0 truncate font-display text-[15px] font-extrabold tracking-tight">Ruturaj Blueprint</p>
          <div className="flex shrink-0 items-center gap-1.5">
            <DayChip />
            <SyncBadge />
            <ThemeButton />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1080px] flex-1 px-4 pb-[100px] pt-5 lg:px-8 lg:pb-12">{children}</main>
      </div>

      {/* ---- mobile bottom bar ---- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-[560px] grid-cols-5 pb-safe">
          {PRIMARY_NAV.map((item) => {
            const active = item.id === route;
            const amazon = item.id === 'amazon';
            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={cn(
                  'relative flex min-h-[58px] flex-col items-center justify-center gap-1 text-[10.5px] transition-colors',
                  active ? (amazon ? 'font-semibold text-amazon' : 'font-semibold text-accent') : 'text-muted',
                )}
              >
                <item.icon size={20} />
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    transition={reduce ? { duration: 0 } : spring}
                    className={cn('absolute inset-x-5 top-0 h-[3px] rounded-full', amazon ? 'bg-amazon' : 'bg-accent')}
                  />
                )}
              </button>
            );
          })}
          <button
            onClick={() => setSheetOpen(true)}
            className={cn(
              'flex min-h-[58px] flex-col items-center justify-center gap-1 text-[10.5px] transition-colors',
              overflowActive ? 'font-semibold text-accent' : 'text-muted',
            )}
          >
            <MoreHorizontal size={20} />
            More
          </button>
        </div>
      </nav>

      {/* ---- overflow sheet ---- */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
              className="fixed inset-0 z-50 bg-fg/35 lg:hidden"
            />
            <motion.div
              initial={reduce ? { opacity: 0 } : { y: '100%' }}
              animate={reduce ? { opacity: 1 } : { y: 0 }}
              exit={reduce ? { opacity: 0 } : { y: '100%' }}
              transition={spring}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[20px] border-t border-line bg-surface p-4 shadow-card lg:hidden"
              style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-[12px] font-bold uppercase tracking-[0.12em] text-muted">More</p>
                <button onClick={() => setSheetOpen(false)} aria-label="Close" className="grid size-9 place-items-center rounded-full text-muted hover:bg-raised">
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {OVERFLOW_NAV.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => go(item.id)}
                    className={cn(
                      'flex min-h-[78px] flex-col items-center justify-center gap-2 rounded-[12px] border text-[12px] transition-colors',
                      item.id === route ? 'border-accent/40 bg-accent-soft text-accent' : 'border-line text-muted hover:bg-raised',
                    )}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
