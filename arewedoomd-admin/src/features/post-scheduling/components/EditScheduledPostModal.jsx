import { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import useUpdateScheduledPost from '../hooks/useUpdateScheduledPost';
import { utcIsoToTurkeyParts, turkeyTimeToUtcIso } from '../utils/formatTurkeyTime';

const CONTENT_MAX = 10000;

function extractApiError(err) {
  if (!err) return null;
  const data = err?.response?.data;
  if (!data) return err?.message ?? 'Bir hata oluştu.';
  if (typeof data === 'string') return data;
  if (data.errors) {
    const msgs = Object.values(data.errors).flat();
    return msgs.join(' ');
  }
  return data.detail ?? data.error ?? data.message ?? 'Bir hata oluştu.';
}

export default function EditScheduledPostModal({ post, onClose, onSaved }) {
  const { update, updating, error } = useUpdateScheduledPost();

  const parts = post?.scheduledAtUtc ? utcIsoToTurkeyParts(post.scheduledAtUtc) : { date: '', time: '' };

  const [content, setContent]   = useState(post?.content ?? '');
  const [date,    setDate]       = useState(parts.date);
  const [time,    setTime]       = useState(parts.time);

  // ESC key — disabled while saving
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !updating) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, updating]);

  const remaining = CONTENT_MAX - content.length;
  const canSave =
    !updating &&
    content.trim().length > 0 &&
    remaining >= 0 &&
    date.length > 0 &&
    time.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    try {
      const scheduledAtUtc = turkeyTimeToUtcIso(date, time);
      const updated = await update(post.id, { content: content.trim(), scheduledAtUtc });
      onSaved(updated);
      onClose();
    } catch {
      // error captured in hook; keep modal open
    }
  };

  const apiError = extractApiError(error);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => !updating && onClose()}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative z-10 w-full max-w-[520px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-text-heading)]">Gönderiyi Düzenle</h2>
          <button
            type="button"
            onClick={() => !updating && onClose()}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-white/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form className="px-6 py-6 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          {/* API error */}
          {apiError && (
            <div className="flex items-center gap-2.5 px-3.5 py-3 bg-red-500/[0.08] border border-red-500/25 rounded-[var(--radius-md)] text-red-400 text-[13px] leading-relaxed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4 shrink-0">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          {/* Content textarea */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="postContent" className="text-sm font-medium text-[var(--color-text-primary)]">
                İçerik
              </label>
              <span
                className={`text-xs ${remaining < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}
              >
                {remaining}
              </span>
            </div>
            <textarea
              id="postContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              maxLength={CONTENT_MAX + 40}
              placeholder="Gönderi içeriği…"
              disabled={updating}
              className="composer-scroll w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-3 text-sm text-[var(--color-text-primary)] leading-relaxed outline-none resize-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
            />
          </div>

          {/* Date + Time (Turkey time) */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label htmlFor="postDate" className="text-sm font-medium text-[var(--color-text-primary)]">
                Tarih (Türkiye)
              </label>
              <input
                id="postDate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={updating}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label htmlFor="postTime" className="text-sm font-medium text-[var(--color-text-primary)]">
                Saat (Türkiye)
              </label>
              <input
                id="postTime"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={updating}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => !updating && onClose()}
              disabled={updating}
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={updating}
              disabled={!canSave}
            >
              Kaydet
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
