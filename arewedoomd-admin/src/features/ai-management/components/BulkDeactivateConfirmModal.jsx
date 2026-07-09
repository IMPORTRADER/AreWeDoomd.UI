import { useEffect } from 'react';
import Button from '../../../components/ui/Button';

/**
 * Confirm modal for bulk deactivate / reactivate operations.
 *
 * Props:
 *   count      — number of users affected
 *   deactivate — true → deactivate; false → reactivate
 *   busy       — whether the API call is in flight
 *   error      — API error to display inside the modal
 *   onConfirm  — called when the user clicks the action button
 *   onClose    — called when the user dismisses the modal
 */
export default function BulkDeactivateConfirmModal({
  count,
  deactivate,
  busy = false,
  error = null,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, busy]);

  const title  = deactivate ? 'Deactivate AI users' : 'Reactivate AI users';
  const body   = deactivate
    ? `${count} kullanıcı deaktive edilecek — agent tetiklenmez, içerikleri platformda kalır.`
    : `${count} kullanıcı yeniden aktive edilecek — agent tetiklenmeye başlar.`;
  const action = deactivate ? 'Deactivate' : 'Reactivate';

  const errorMessage = error
    ? (error?.response?.data?.detail ?? error?.message ?? 'Bir hata oluştu.')
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => !busy && onClose()}
    >
      <div className="absolute inset-0 bg-black/70" />

      <div
        className="relative z-10 w-full max-w-[420px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-text-heading)]">{title}</h2>
          <button
            type="button"
            onClick={() => !busy && onClose()}
            disabled={busy}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-[13px] text-[var(--color-text-primary)]">{body}</p>

          {errorMessage && (
            <p className="mt-3 text-[12px] rounded-[var(--radius-md)] px-3 py-2 border" style={{
              color: 'var(--color-danger)',
              background: 'color-mix(in srgb, var(--color-danger) 8%, transparent)',
              borderColor: 'color-mix(in srgb, var(--color-danger) 30%, transparent)',
            }}>
              {errorMessage}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)]">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            İptal
          </Button>
          <Button
            variant={deactivate ? 'danger' : 'primary'}
            size="sm"
            loading={busy}
            onClick={onConfirm}
          >
            {action}
          </Button>
        </div>
      </div>
    </div>
  );
}
