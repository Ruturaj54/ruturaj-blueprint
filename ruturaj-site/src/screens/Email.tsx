import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Clock, CheckCircle2, TriangleAlert } from 'lucide-react';
import { useAppState } from '@/hooks/useAppState';
import { Card, SectionTitle, Button, Chip } from '@/components/ui/primitives';
import { listContainer } from '@/lib/motion';
import * as storage from '@/lib/storage';

/**
 * The actual send times. Fixed in the function code (Netlify cron is static),
 * so they are shown as facts here rather than as settings that would not
 * change anything.
 */
const MORNING_SEND = '07:00';
const END_OF_DAY_SEND = '02:30';

/** §40 — email configuration and a real send test. */
export function Email() {
  const state = useAppState();
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  const send = async (type: 'morning' | 'evening') => {
    const key = storage.getPassphrase();
    if (!key) {
      setResult({ ok: false, text: 'Set the sync passphrase in Settings first — the endpoint is key-gated.' });
      return;
    }
    setBusy(type);
    setResult(null);
    try {
      // Push first so the mail reflects what is on screen, not the last sync.
      storage.flush();
      const res = await fetch(`/.netlify/functions/send-email?type=${type}`, {
        method: 'POST',
        headers: { 'x-blueprint-key': key },
      });
      const data = await res.json().catch(() => ({}));
      setResult(
        res.ok
          ? { ok: true, text: `Sent. Subject: ${data.subject ?? type}` }
          : { ok: false, text: data.error ?? `Failed with ${res.status}` },
      );
    } catch {
      setResult({ ok: false, text: 'Could not reach the function. This only works on the deployed site.' });
    }
    setBusy(null);
  };

  return (
    <motion.div variants={listContainer} initial="hidden" animate="show" className="space-y-7">
      <Card>
        <div className="flex items-center gap-2 text-muted">
          <Mail size={15} />
          <p className="text-[12px] uppercase tracking-[0.12em]">Daily mail</p>
        </div>
        <p className="mt-2 text-[13px] text-muted">
          Both mails are built server-side from your synced progress, which is why they can say what
          you actually did rather than sending a generic reminder. If sync is off, they fall back to
          the last state the server saw.
        </p>
        <div className="mt-3">
          <Chip tone={state.settings.emailEnabled ? 'success' : 'default'}>
            {state.settings.emailEnabled ? 'Enabled' : 'Disabled in Settings'}
          </Chip>
        </div>
      </Card>

      <section>
        <SectionTitle>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} />
            Schedule
          </span>
        </SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <p className="text-[14px] font-medium">Morning mission</p>
            <p className="tnum mt-1 font-mono text-[22px] text-accent">{MORNING_SEND}</p>
            <p className="mt-2 text-[13px] text-muted">
              Today&rsquo;s three missions with anything unfinished from yesterday first, your
              timetable, the DSA target aimed at your weakest pattern, and one challenge.
            </p>
          </Card>
          <Card>
            <p className="text-[14px] font-medium">End-of-day recap</p>
            <p className="tnum mt-1 font-mono text-[22px] text-accent">{END_OF_DAY_SEND}</p>
            <p className="mt-2 text-[13px] text-muted">
              Sent after your night block, so it sees the whole day: what you closed, what you did
              well, and what carries to tomorrow. Skipped if you already sent the recap yourself.
            </p>
          </Card>
        </div>
        <p className="mt-2 px-1 text-[12px] text-faint">
          Both times are IST and fixed in the mail functions. Your day runs until 04:00, so anything
          logged during the night block counts toward the day you planned it on.
        </p>
      </section>

      <section>
        <SectionTitle>Send a test</SectionTitle>
        <Card>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" onClick={() => void send('morning')} disabled={busy !== null}>
              <Send size={15} />
              {busy === 'morning' ? 'Sending…' : 'Send morning mail'}
            </Button>
            <Button className="flex-1" onClick={() => void send('evening')} disabled={busy !== null}>
              <Send size={15} />
              {busy === 'evening' ? 'Sending…' : 'Send evening mail'}
            </Button>
          </div>
          {result && (
            <p
              className={`mt-3 inline-flex items-start gap-1.5 text-[13px] ${
                result.ok ? 'text-success' : 'text-danger'
              }`}
            >
              {result.ok ? (
                <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
              ) : (
                <TriangleAlert size={14} className="mt-0.5 shrink-0" />
              )}
              {result.text}
            </p>
          )}
          <p className="mt-3 border-t border-line pt-3 text-[12px] text-faint">
            Sends to MY_EMAIL from the Netlify environment. This only works on the deployed site —
            the dev server has no functions.
          </p>
        </Card>
      </section>
    </motion.div>
  );
}
