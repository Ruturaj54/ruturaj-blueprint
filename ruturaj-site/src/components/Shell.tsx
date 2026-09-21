import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MoreHorizontal, X, Cloud, CloudOff, RefreshCw, Lock, ServerCog } from 'lucide-react';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import { NAV_ITEMS, PRIMARY_NAV, OVERFLOW_NAV } from '@/nav';
import { useSyncStatus } from '@/hooks/useAppState';

/**
 * App chrome: sidebar on desktop, bottom bar plus an overflow sheet on mobile.
 * The active indicator is a single shared `layoutId` pill so it travels between
 * destinations instead of cross-fading.
 */

function SyncBadge() {
  const status = useSyncStatus();
  const map = {
    idle: { icon: Cloud, text: 'Local only', tone: 'text-faint' },
    syncing: { icon: RefreshCw, text: 'Syncing', tone: 'text-info' },
    synced: { icon: Cloud, text: 'Synced', tone: 'text-success' },
    offline: { icon: CloudOff, text: 'Offline', tone: 'text-muted' },
    unauthorized: { icon: Lock, text: 'Key rejected', tone: 'text-danger' },
    misconfigured: { icon: ServerCog, text: 'Server key unset', tone: 'text-danger' },
  } as const;
  const { icon: Icon, text, tone } = map[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11px]', tone)}>
      <Icon size={13} className={status === 'syncing' ? 'animate-spin' : undefined} />
      {text}
    </span>
  );
}

export function Shell({
  route,
  navigate,
  children,
}: {
  route: string;
  navigate: (next: string) => void;
  children: ReactNode;
}) {
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
      <aside className="sticky top-0 hidden h-dvh w-[232px] shrink-0 flex-col border-r border-line bg-surface px-3 py-5 lg:flex">
        <div className="px-3 pb-5">
          <p className="font-display text-[17px] font-bold leading-tight tracking-tight">
            Ruturaj Blueprint
          </p>
          <p className="mt-1 text-[11px] text-muted">161-day mission</p>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = item.id === route;
            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={cn(
                  'relative flex min-h-[40px] items-center gap-3 rounded-[10px] px-3 text-[14px] transition-colors',
                  active ? 'text-fg' : 'text-muted hover:text-fg',
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    transition={reduce ? { duration: 0 } : spring}
                    className="absolute inset-0 rounded-[10px] bg-white/[0.06]"
                  />
                )}
                <item.icon size={17} className="relative z-10 shrink-0" />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="px-3 pt-4">
          <SyncBadge />
        </div>
      </aside>

      {/* ---- content ---- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[52px] items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur-xl lg:hidden">
          <p className="font-display text-[15px] font-bold tracking-tight">
            Ruturaj Blueprint
          </p>
          <SyncBadge />
        </header>

        <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 pb-[96px] pt-5 lg:px-8 lg:pb-12">
          {children}
        </main>
      </div>

      {/* ---- mobile bottom bar ---- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur-xl lg:hidden">
        <div
          className="mx-auto grid max-w-[520px] grid-cols-5"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {PRIMARY_NAV.map((item) => {
            const active = item.id === route;
            return (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={cn(
                  'relative flex min-h-[56px] flex-col items-center justify-center gap-1 text-[10px] transition-colors',
                  active ? 'text-accent' : 'text-muted',
                )}
              >
                <item.icon size={19} />
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    transition={reduce ? { duration: 0 } : spring}
                    className="absolute inset-x-4 top-0 h-[2px] rounded-full bg-accent"
                  />
                )}
              </button>
            );
          })}
          <button
            onClick={() => setSheetOpen(true)}
            className={cn(
              'flex min-h-[56px] flex-col items-center justify-center gap-1 text-[10px] transition-colors',
              overflowActive ? 'text-accent' : 'text-muted',
            )}
          >
            <MoreHorizontal size={19} />
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
              className="fixed inset-0 z-50 bg-black/60 lg:hidden"
            />
            <motion.div
              initial={reduce ? { opacity: 0 } : { y: '100%' }}
              animate={reduce ? { opacity: 1 } : { y: 0 }}
              exit={reduce ? { opacity: 0 } : { y: '100%' }}
              transition={spring}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[20px] border-t border-line bg-surface p-4 lg:hidden"
              style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-[13px] uppercase tracking-[0.14em] text-muted">
                  All sections
                </p>
                <button
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close"
                  className="grid size-9 place-items-center rounded-full text-muted hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {OVERFLOW_NAV.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => go(item.id)}
                    className={cn(
                      'flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-[12px] border text-[12px] transition-colors',
                      item.id === route
                        ? 'border-accent/40 bg-accent/10 text-accent'
                        : 'border-line text-muted hover:bg-white/[0.04]',
                    )}
                  >
                    <item.icon size={19} />
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
