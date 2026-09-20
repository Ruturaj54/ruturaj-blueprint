import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Briefcase, ChevronRight } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle, Button, Chip, EmptyState } from '@/components/ui/primitives';
import { listContainer } from '@/lib/motion';
import { cn } from '@/lib/cn';
import { todayISO } from '@/engine/dates';
import { TARGET_COMPANIES } from '@/data/companies';
import type { ApplicationStage } from '@/lib/schema';

const STAGES: Array<{ id: ApplicationStage; label: string }> = [
  { id: 'saved', label: 'Saved' },
  { id: 'applied', label: 'Applied' },
  { id: 'oa', label: 'OA' },
  { id: 'recruiter', label: 'Recruiter' },
  { id: 'interview', label: 'Interview' },
  { id: 'final', label: 'Final' },
  { id: 'offer', label: 'Offer' },
  { id: 'rejected', label: 'Rejected' },
];

const inputCls =
  'w-full rounded-[10px] border border-line bg-bg px-3 py-2.5 text-[14px] text-fg outline-none placeholder:text-faint focus:border-line2';

export function Job() {
  const state = useAppState();
  const update = useUpdateState();
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  const add = () => {
    if (!company.trim() || !role.trim()) return;
    update((draft) => {
      draft.applications.unshift({
        id: `app-${Date.now()}`,
        company: company.trim(),
        role: role.trim(),
        stage: 'saved',
        appliedOn: todayISO(),
      });
    });
    setCompany('');
    setRole('');
  };

  const counts = STAGES.map((s) => ({
    ...s,
    n: state.applications.filter((a) => a.stage === s.id).length,
  }));

  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-7">
      {/* ---- pipeline ---- */}
      <Card>
        <p className="text-[12px] uppercase tracking-[0.12em] text-muted">Pipeline</p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
          {counts.map((s) => (
            <div key={s.id}>
              <p
                className={cn(
                  'tnum font-display text-[22px] font-bold leading-none',
                  s.id === 'offer' && s.n > 0 && 'text-success',
                  s.id === 'rejected' && s.n > 0 && 'text-faint',
                )}
              >
                {s.n}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ---- add ---- */}
      <section>
        <SectionTitle>Track an application</SectionTitle>
        <Card>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company"
              className={inputCls}
            />
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Role"
              className={inputCls}
            />
          </div>
          <Button
            variant="primary"
            className="mt-2 w-full"
            onClick={add}
            disabled={!company.trim() || !role.trim()}
          >
            <Plus size={15} />
            Add
          </Button>
        </Card>
      </section>

      {/* ---- applications ---- */}
      <section>
        <SectionTitle>Applications</SectionTitle>
        {state.applications.length === 0 ? (
          <EmptyState
            icon={<Briefcase size={22} />}
            title="No applications yet"
            body="Month 4 is when these go out in waves. Until then, save roles you find so the job descriptions can shape what you prepare."
          />
        ) : (
          <div className="space-y-2">
            {state.applications.map((a) => (
              <Card key={a.id} className="p-0">
                <button
                  onClick={() => setOpen(open === a.id ? null : a.id)}
                  className="flex w-full items-center gap-3 p-4 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium">{a.company}</p>
                    <p className="text-[13px] text-muted">{a.role}</p>
                  </div>
                  <Chip
                    tone={
                      a.stage === 'offer' ? 'success' : a.stage === 'rejected' ? 'default' : 'accent'
                    }
                  >
                    {STAGES.find((s) => s.id === a.stage)?.label}
                  </Chip>
                  <ChevronRight
                    size={16}
                    className={cn('shrink-0 text-faint transition-transform', open === a.id && 'rotate-90')}
                  />
                </button>

                {open === a.id && (
                  <div className="space-y-3 border-t border-line p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {STAGES.map((s) => (
                        <button
                          key={s.id}
                          onClick={() =>
                            update((draft) => {
                              const app = draft.applications.find((x) => x.id === a.id);
                              if (app) app.stage = s.id;
                            })
                          }
                          className={cn(
                            'rounded-full border px-2.5 py-[5px] text-[11px] transition-colors',
                            a.stage === s.id
                              ? 'border-accent/40 bg-accent/10 text-accent'
                              : 'border-line text-muted hover:bg-raised',
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={a.notes ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        update((draft) => {
                          const app = draft.applications.find((x) => x.id === a.id);
                          if (app) app.notes = v;
                        });
                      }}
                      rows={2}
                      placeholder="Notes, recruiter name, preparation gaps"
                      className={cn(inputCls, 'resize-y')}
                    />

                    <button
                      onClick={() =>
                        update((draft) => {
                          draft.applications = draft.applications.filter((x) => x.id !== a.id);
                        })
                      }
                      className="inline-flex items-center gap-1.5 text-[12px] text-faint hover:text-danger"
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ---- target companies ---- */}
      <section>
        <SectionTitle>Target companies</SectionTitle>
        <div className="space-y-3">
          {TARGET_COMPANIES.map((c) => (
            <Card key={c.id}>
              <p className="text-[15px] font-medium">{c.name}</p>
              <p className="mt-1.5 text-[13px] text-muted">{c.emphasis}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.stages.map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
              </div>
              <p className="mt-3 border-t border-line pt-3 text-[12px] text-faint">{c.caveat}</p>
            </Card>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
