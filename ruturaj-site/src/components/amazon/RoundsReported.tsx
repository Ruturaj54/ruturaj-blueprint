import { Card, SectionTitle } from '@/components/ui/primitives';
import { Proof } from './Proof';
import { REPORTED, REPORTED_ROUNDS, INTERVIEWERS_CHECKED, TIMING, PRACTICE_RULES, type Reported } from './reported-data';

/** What 2025–26 SDE-1 candidates reported, verbatim from the tracker, with proof chips. */

function Bullets({ title, items }: { title: string; items: readonly Reported[] }) {
  return (
    <div>
      <p className="text-[14px] font-medium text-fg">{title}</p>
      <ul className="mt-1.5 space-y-2">
        {items.map((b) => (
          <li key={b.text} className="text-[13px] leading-relaxed text-fg">
            {b.text} <Proof src={b.src} className="ml-1 align-middle" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RoundsReported() {
  return (
    <section>
      <SectionTitle>What 2025–26 SDE-1 candidates reported</SectionTitle>
      <Card className="space-y-4">
        <div>
          <p className="font-display text-[16px] font-bold leading-tight">{REPORTED.title}</p>
          <p className="mt-0.5 text-[13px] text-muted">{REPORTED.sub}</p>
          <p className="mt-1 text-[12.5px] text-muted">{REPORTED.note}</p>
        </div>

        <ol className="space-y-2">
          {REPORTED_ROUNDS.map((r) => (
            <li key={r.n} className="rounded-[12px] border border-line bg-raised p-3">
              <p className="text-[13px] font-semibold text-fg">
                <span className="tnum mr-1.5 font-mono text-[11px] text-amazon-ink">Round {r.n}</span>
                {r.name}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-fg">{r.text}</p>
              <div className="mt-1.5">
                <Proof src={r.src} />
              </div>
            </li>
          ))}
        </ol>

        <Bullets title="What interviewers checked" items={INTERVIEWERS_CHECKED} />
        <Bullets title="Timing" items={TIMING} />

        <div>
          <p className="text-[14px] font-medium text-fg">
            Rules for every problem you practise <span className="text-[11px] font-normal text-faint">· general advice</span>
          </p>
          <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-[13px] leading-relaxed text-fg">
            {PRACTICE_RULES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        </div>

        <p className="text-[12px] text-faint">
          Candidate-reported. This is what people remembered; treat it as the shape of the loop, not a script.
        </p>
      </Card>
    </section>
  );
}
