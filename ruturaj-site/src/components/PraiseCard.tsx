import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, TrendingUp, Flame, Trophy, Minus } from 'lucide-react';
import { Card } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { spring } from '@/lib/motion';
import type { DayPraise, WinKind } from '@/engine/praise';

const WIN_META: Record<WinKind, { icon: typeof Sparkles; tone: string }> = {
  breakthrough: { icon: Sparkles, tone: 'text-accent' },
  improvement: { icon: TrendingUp, tone: 'text-success' },
  consistency: { icon: Flame, tone: 'text-accent' },
  best: { icon: Trophy, tone: 'text-success' },
};

/**
 * The recognition surface. Deliberately restrained: design.md allows one
 * tasteful burst, never full-screen confetti, and an empty-handed day gets an
 * honest card rather than a hollow celebration.
 */
export function PraiseCard({ praise, compact }: { praise: DayPraise; compact?: boolean }) {
  const reduce = useReducedMotion();
  const good = praise.hasWins;

  return (
    <Card className={cn('relative overflow-hidden', good && 'border-success/30')} animate={false}>
      {good && !reduce && (
        // The single burst — a soft bloom behind the headline, not confetti.
        <motion.div
          aria-hidden
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 0.5, 0.22], scale: 1 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          className="pointer-events-none absolute -right-10 -top-14 size-[190px] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(52,211,153,0.30) 0%, rgba(52,211,153,0) 70%)',
          }}
        />
      )}

      <div className="relative">
        <div className="flex items-center gap-2">
          <span className={good ? 'text-success' : 'text-faint'}>
            {good ? <Sparkles size={16} /> : <Minus size={16} />}
          </span>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
            {good ? 'Day closed' : 'Day closed — no win to report'}
          </p>
        </div>

        <h3 className="mt-2 font-display text-[22px] font-bold leading-tight">
          {praise.headline}
        </h3>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">{praise.body}</p>

        {praise.score !== undefined && (
          <div className="mt-3.5 flex items-center gap-4">
            <Delta label="Today" value={`${praise.score}%`} highlight />
            {praise.yesterdayScore !== undefined && (
              <Delta label="Yesterday" value={`${praise.yesterdayScore}%`} />
            )}
          </div>
        )}

        {praise.wins.length > 0 && !compact && (
          <div className="mt-4 space-y-2 border-t border-line pt-3.5">
            {praise.wins.map((w, i) => {
              const { icon: Icon, tone } = WIN_META[w.kind];
              return (
                <motion.div
                  key={w.label}
                  initial={reduce ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...spring, delay: reduce ? 0 : 0.08 * i }}
                  className="flex items-start gap-2.5"
                >
                  <span className={cn('mt-[2px] shrink-0', tone)}>
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium leading-snug">{w.label}</p>
                    <p className="mt-0.5 text-[12px] leading-snug text-muted">{w.detail}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

function Delta({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p
        className={cn(
          'tnum font-display text-[24px] font-bold leading-none',
          highlight ? 'text-success' : 'text-faint',
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
    </div>
  );
}
