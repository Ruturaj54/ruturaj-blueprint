import { useAppState } from '@/hooks/useAppState';
import { AMAZON_BANK, type BankRow } from '@/data/amazon';
import { Card, SectionTitle } from '@/components/ui/primitives';
import { cn } from '@/lib/cn';
import { Proof } from './Proof';
import { AskedBadge, DayChip, Difficulty, FreqChip, LcLink, askedOf } from './badges';

/**
 * The asked bank: every problem candidates reported, grouped by pattern,
 * with its proof and the curriculum days it lives in. Ticks stay in the
 * plan; this is the reference view.
 */

const TOTAL = AMAZON_BANK.reduce((n, g) => n + g.rows.length, 0);

export function BankList({ onGoDay }: { onGoDay: (n: number) => void }) {
  const state = useAppState();
  return (
    <div className="space-y-6">
      <p className="text-[13px] leading-relaxed text-muted">
        {TOTAL} problems, or their closest LeetCode matches, that SDE-1 candidates reported being asked, grouped by pattern.
        Ticks live in the plan; a green dot means at least one of a row's curriculum keys is logged.
      </p>
      {AMAZON_BANK.map((g) => (
        <section key={g.g}>
          <SectionTitle>
            {g.g} <span className="text-faint">· {g.rows.length}</span>
          </SectionTitle>
          <Card className="divide-y divide-line p-0">
            {g.rows.map((r, i) => (
              <Row
                key={`${g.g}-${i}`}
                row={r}
                logged={r.keys.some((k) => Boolean(state.amazon.items[k]))}
                onGoDay={onGoDay}
              />
            ))}
          </Card>
        </section>
      ))}
    </div>
  );
}

function Row({ row, logged, onGoDay }: { row: BankRow; logged: boolean; onGoDay: (n: number) => void }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span
        role="img"
        aria-label={logged ? 'Logged in the plan' : 'Not logged yet'}
        className={cn('mt-[7px] size-[8px] shrink-0 rounded-full', logged ? 'bg-success' : 'bg-line2')}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[14px] leading-snug">
          {row.slug ? (
            <LcLink slug={row.slug} n={row.n} name={row.name ?? row.slug} />
          ) : (
            <span className="font-medium text-fg">{row.title}</span>
          )}
        </p>
        {row.sub && <p className="mt-0.5 text-[12px] text-muted">{row.sub}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          {row.d && <Difficulty d={row.d} />}
          <AskedBadge asked={askedOf(row.a)} />
          <FreqChip f3={row.f3} />
          <Proof src={row.src} />
        </div>
        {row.days.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {row.days.map((d) => (
              <DayChip key={d} day={d} onClick={() => onGoDay(d)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
