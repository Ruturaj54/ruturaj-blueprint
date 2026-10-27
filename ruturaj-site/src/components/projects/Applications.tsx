import { useState } from 'react';
import { Plus, Briefcase } from 'lucide-react';
import { useAppState, useUpdateState } from '@/hooks/useAppState';
import { Card, SectionTitle, Button, EmptyState, inputCls } from '@/components/ui/primitives';
import { Field, Stat } from '@/components/ui/controls';
import { APPLICATION_STAGES } from './stages';
import { ApplicationRow } from './ApplicationRow';
import { TargetCompanies } from './TargetCompanies';

/** Pipeline counts, the add form, every tracked application, then the targets. */
export function Applications() {
  const state = useAppState();
  const update = useUpdateState();
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const canAdd = company.trim() !== '' && role.trim() !== '';

  const add = () => {
    if (!canAdd) return;
    update((draft) => {
      draft.applications.unshift({ id: `app-${Date.now()}`, company: company.trim(), role: role.trim(), stage: 'saved' });
    });
    setCompany('');
    setRole('');
  };

  return (
    <>
      <Card>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Pipeline</p>
        <div className="mt-3 grid grid-cols-4 gap-x-3 gap-y-4">
          {APPLICATION_STAGES.map((s) => {
            const n = state.applications.filter((a) => a.stage === s.id).length;
            return <Stat key={s.id} value={n} label={s.label} tone={s.id === 'offer' && n > 0 ? 'success' : 'default'} />;
          })}
        </div>
      </Card>

      <section>
        <SectionTitle>Track an application</SectionTitle>
        <Card>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Company">
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className={inputCls} />
            </Field>
            <Field label="Role">
              <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Role" className={inputCls} />
            </Field>
          </div>
          <Button variant="primary" className="mt-3 w-full" onClick={add} disabled={!canAdd}>
            <Plus size={15} />
            Add
          </Button>
        </Card>
      </section>

      <section>
        <SectionTitle>Applications</SectionTitle>
        {state.applications.length === 0 ? (
          <EmptyState
            icon={<Briefcase size={22} />}
            title="No applications yet"
            body="P4, Interview Execution, is when these go out in waves. Until then, save roles you find so the job descriptions can shape what you prepare."
          />
        ) : (
          <div className="space-y-2">
            {state.applications.map((a) => (
              <ApplicationRow key={a.id} app={a} />
            ))}
          </div>
        )}
      </section>

      <TargetCompanies />
    </>
  );
}
