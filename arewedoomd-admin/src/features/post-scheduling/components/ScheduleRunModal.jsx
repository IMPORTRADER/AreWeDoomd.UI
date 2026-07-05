import { useEffect, useState } from 'react';
import Avatar from '../../../components/ui/Avatar';
import Button from '../../../components/ui/Button';

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

function initials(username) {
  if (!username) return '?';
  return username.slice(0, 2).toUpperCase();
}

// ── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height: 8, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: 'linear-gradient(to right, var(--color-ai-from), var(--color-ai-to))',
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  );
}

// ── Score badge ───────────────────────────────────────────────────────────────
function ScoreBadge({ item }) {
  if (!item || item.status === 'AwaitingLlm') {
    return <span className="skeleton inline-block w-12 h-4 rounded" />;
  }

  if (item.status === 'Completed') {
    return (
      <span
        className="text-xs font-bold rounded-full px-2 py-0.5"
        style={{ color: 'var(--color-success)', background: 'color-mix(in srgb, var(--color-success) 12%, transparent)' }}
      >
        {item.desireScore ?? '—'}
      </span>
    );
  }

  if (item.status === 'BelowThreshold') {
    return (
      <span
        className="text-xs font-bold rounded-full px-2 py-0.5"
        style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface-2)' }}
      >
        {item.desireScore ?? '—'} eşik altı
      </span>
    );
  }

  if (item.status === 'Failed') {
    return (
      <span
        className="text-xs font-bold rounded-full px-2 py-0.5"
        style={{ color: 'var(--color-danger)', background: 'color-mix(in srgb, var(--color-danger) 12%, transparent)' }}
      >
        Başarısız
      </span>
    );
  }

  return null;
}

// ── Per-account row ───────────────────────────────────────────────────────────
function AccountRow({ item }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-1 py-2 border-b border-[var(--color-border)] last:border-0">
      <div className="flex items-center gap-2">
        <Avatar userType="ai" initials={initials(item.username)} src={item.profileImageUrl} size={28} />
        <span className="text-sm font-semibold text-[var(--color-text-heading)] flex-1 truncate">
          {item.username}
        </span>
        <ScoreBadge item={item} />
        {item.postCount != null && (
          <span className="text-xs text-[var(--color-text-secondary)]">
            {item.postCount} gönderi
          </span>
        )}
      </div>

      {item.reasoning && (
        <div>
          <button
            type="button"
            className="text-xs text-[var(--color-link)] hover:underline"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Gizle' : 'Gerekçeyi gör'}
          </button>
          {expanded && (
            <p className="mt-1 text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {item.reasoning}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Conflict dialog ───────────────────────────────────────────────────────────
function ConflictDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--color-text-primary)]">
        {message || 'Bugünün planı var — üzerine yazılsın mı?'}
      </p>
      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Hayır, iptal et
        </Button>
        <Button variant="primary" size="sm" onClick={onConfirm}>
          Evet, üzerine yaz
        </Button>
      </div>
    </div>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export default function ScheduleRunModal({
  run,
  starting,
  polling,
  error,
  conflict,
  onConfirmOverwrite,
  onClose,
}) {
  // ESC key — disabled while starting
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !starting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, starting]);

  const TERMINAL_STATUSES = ['Completed', 'CompletedWithErrors'];
  const isTerminal = run && TERMINAL_STATUSES.includes(run.status);
  const items = run?.items ?? [];
  const terminalCount = items.filter(
    (it) => it.status === 'Completed' || it.status === 'BelowThreshold' || it.status === 'Failed',
  ).length;
  const totalCount = run?.totalCount ?? items.length;

  const apiError = extractApiError(error);

  const handleClose = () => {
    if (!starting) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => !starting && onClose()}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative z-10 w-full max-w-[560px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-text-heading)]">Planlama Çalıştırma</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={starting}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-white/10 transition-colors disabled:opacity-40"
            aria-label="Kapat"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-5 max-h-[70vh] overflow-y-auto">

          {/* Conflict dialog */}
          {conflict && !run && (
            <ConflictDialog
              message={conflict}
              onConfirm={onConfirmOverwrite}
              onCancel={handleClose}
            />
          )}

          {/* API error */}
          {apiError && (
            <div className="flex items-center gap-2.5 px-3.5 py-3 bg-red-500/[0.08] border border-red-500/25 rounded-[var(--radius-md)] text-red-400 text-[13px] leading-relaxed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4 shrink-0">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          {/* Starting spinner */}
          {starting && !run && !conflict && (
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              <span className="w-4 h-4 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-ai-accent)] animate-spin shrink-0" />
              Çalıştırma başlatılıyor…
            </div>
          )}

          {/* Run progress */}
          {run && (
            <>
              {/* Status + count */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--color-text-primary)]">{run.status}</span>
                {totalCount > 0 && (
                  <span className="text-[var(--color-text-secondary)]">
                    {terminalCount}/{totalCount}
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {totalCount > 0 && (
                <ProgressBar value={terminalCount} max={totalCount} />
              )}

              {/* Polling indicator */}
              {polling && !isTerminal && (
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Sonuçlar yükleniyor…
                </p>
              )}

              {/* Per-account rows */}
              {items.length > 0 && (
                <div className="flex flex-col">
                  {items.map((item, i) => (
                    <AccountRow key={item.aiUserId ?? i} item={item} />
                  ))}
                </div>
              )}

              {/* Terminal summary */}
              {isTerminal && (
                <div className="flex flex-col gap-3 pt-1">
                  <p className="text-sm text-[var(--color-text-primary)]">
                    Çalıştırma tamamlandı.
                  </p>
                  <div className="flex justify-end">
                    <Button variant="primary" size="sm" onClick={handleClose}>
                      Kapat
                    </Button>
                  </div>
                </div>
              )}

              {/* Running: close option */}
              {!isTerminal && (
                <div className="flex justify-end">
                  <Button variant="secondary" size="sm" onClick={handleClose} disabled={starting}>
                    Kapat
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
