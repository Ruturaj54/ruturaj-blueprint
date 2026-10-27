import { useCallback, useState } from 'react';
import { Eye, Send, CheckCircle2, TriangleAlert } from 'lucide-react';
import { Card, Button } from '@/components/ui/primitives';
import { previewMail, sendTestMail, type MailType, type MailPreviewResult } from '@/lib/mail-api';
import { cn } from '@/lib/cn';
import { ConfirmAction } from './ConfirmAction';
import { MailPreview } from './MailPreview';

const TEST_EXPLAIN = 'This sends a real mail now and is logged as a test; the scheduled mails still go out.';

/** Preview either mail in a modal, or send one for real as a logged test. */
export function MailActions({ onSent }: { onSent?: () => void }) {
  const [busy, setBusy] = useState<MailType | null>(null);
  const [preview, setPreview] = useState<MailPreviewResult | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const closePreview = useCallback(() => setPreview(null), []);

  const openPreview = async (type: MailType) => {
    setBusy(type);
    setNote(null);
    const r = await previewMail(type);
    setBusy(null);
    if (r.ok) setPreview(r);
    else setNote({ ok: false, text: r.error });
  };

  const sendTest = async (type: MailType) => {
    setNote(null);
    const r = await sendTestMail(type);
    if (r.ok) {
      setNote({ ok: true, text: `Sent the ${type} mail. Subject: ${r.subject || '(none)'}` });
      onSent?.();
    } else {
      setNote({ ok: false, text: r.error });
    }
  };

  return (
    <Card>
      <p className="text-[14px] font-semibold text-fg">Preview and test</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
        Both mails are built on the server from the synced state, so a preview shows what the next
        send would actually say.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button onClick={() => void openPreview('morning')} disabled={busy !== null}>
          <Eye size={15} />
          {busy === 'morning' ? 'Building' : 'Preview morning'}
        </Button>
        <Button onClick={() => void openPreview('evening')} disabled={busy !== null}>
          <Eye size={15} />
          {busy === 'evening' ? 'Building' : 'Preview evening'}
        </Button>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <ConfirmAction
          icon={<Send size={15} />}
          label="Send me a test: morning"
          confirmLabel="Send the morning mail now"
          busyLabel="Sending"
          explain={TEST_EXPLAIN}
          onConfirm={() => sendTest('morning')}
        />
        <ConfirmAction
          icon={<Send size={15} />}
          label="Send me a test: evening"
          confirmLabel="Send the evening mail now"
          busyLabel="Sending"
          explain={TEST_EXPLAIN}
          onConfirm={() => sendTest('evening')}
        />
      </div>

      {note && (
        <p className={cn('mt-3 flex items-start gap-1.5 text-[13px]', note.ok ? 'text-success' : 'text-danger')}>
          {note.ok ? (
            <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
          ) : (
            <TriangleAlert size={14} className="mt-0.5 shrink-0" />
          )}
          <span>{note.text}</span>
        </p>
      )}

      <MailPreview preview={preview} onClose={closePreview} />
    </Card>
  );
}
