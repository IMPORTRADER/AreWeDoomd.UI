import { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import useBulkCreate from '../hooks/useBulkCreate';

const TERMINAL_STATUSES = ['completed', 'failed'];

function extractApiError(err) {
  if (!err) return null;
  const data = err?.response?.data;
  if (!data) return err?.message ?? 'An error occurred.';
  if (typeof data === 'string') return data;
  if (data.errors) {
    const msgs = Object.values(data.errors).flat();
    return msgs.join(' ');
  }
  return data.detail ?? data.error ?? data.message ?? 'An error occurred.';
}

function isTerminal(job) {
  return job && TERMINAL_STATUSES.includes(job.status);
}

// ── Progress bar ────────────────────────────────────────────────────────────
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

// ── Username pill ────────────────────────────────────────────────────────────
function UserPill({ username }) {
  return (
    <span
      className="inline-flex items-center text-xs rounded-full px-2 py-0.5 border animate-pop-in"
      style={{
        background: 'var(--color-ai-badge-bg)',
        borderColor: 'var(--color-ai-badge-border)',
        color: 'var(--color-ai-accent)',
      }}
    >
      {username}
    </span>
  );
}

// ── Modal chrome (shared header + backdrop) ──────────────────────────────────
export default function BulkCreateModal({ onClose, onJobTerminal }) {
  const { start, job, starting, error, reset } = useBulkCreate();
  const [count, setCount] = useState(10);

  const terminal  = isTerminal(job);
  const failCount = job?.failed?.length ?? 0;
  const processed = (job?.created ?? 0) + failCount;

  // Notify parent when job reaches terminal with created > 0 (on transition)
  useEffect(() => {
    if (terminal && job.created > 0) {
      onJobTerminal?.();
    }
    // Only fire on status transition
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.status]);

  // ESC key — disabled only while starting
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !starting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, starting]);

  const handleStart = () => {
    if (count < 1 || count > 50 || starting) return;
    start({ count });
  };

  const handleRetry = () => {
    if (failCount > 0) {
      reset();
      start({ count: failCount });
    }
  };

  const handleClose = () => {
    if (!starting) onClose();
  };

  const canStart = count >= 1 && count <= 50 && !starting;
  const apiError = extractApiError(error);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => !starting && onClose()}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative z-10 w-full max-w-[520px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-text-heading)]">Bulk Create AI Users</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={starting}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-white/10 transition-colors disabled:opacity-40"
            aria-label="Dismiss"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 flex flex-col gap-5">

          {/* ── Phase 1: idle / error ── */}
          {!job && (
            <>
              {/* API error */}
              {apiError && (
                <div className="flex items-center gap-2.5 px-3.5 py-3 bg-red-500/[0.08] border border-red-500/25 rounded-[var(--radius-md)] text-red-400 text-[13px] leading-relaxed">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4 shrink-0">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{apiError}</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                  Number of AI users to create
                  <span className="ml-1 text-xs font-normal text-[var(--color-text-secondary)]">(1–50)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  disabled={starting}
                  className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={starting}
                  aria-label="Cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  loading={starting}
                  disabled={!canStart}
                  onClick={handleStart}
                  aria-label="Start bulk creation"
                >
                  Start
                </Button>
              </div>
            </>
          )}

          {/* ── Phase 2: running / terminal ── */}
          {job && (
            <>
              {/* Poll error */}
              {apiError && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5 px-3.5 py-3 bg-red-500/[0.08] border border-red-500/25 rounded-[var(--radius-md)] text-red-400 text-[13px] leading-relaxed">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4 shrink-0">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{apiError}</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Güncelleme alınamadı — iş sunucuda devam ediyor olabilir.
                  </p>
                </div>
              )}

              {/* Status line */}
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--color-text-primary)] capitalize">{job.status}</span>
                <span className="text-[var(--color-text-secondary)]">
                  {processed}/{job.requested}
                </span>
              </div>

              {/* Progress bar */}
              <ProgressBar value={processed} max={job.requested} />

              {/* Running indicator */}
              {!terminal && (
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Creating AI users from the persona catalog…
                </p>
              )}

              {/* Created users */}
              {job.createdUsers && job.createdUsers.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Created ({job.created})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.createdUsers.map((u) => (
                      <UserPill key={u} username={u} />
                    ))}
                  </div>
                </div>
              )}

              {/* Failures */}
              {job.failed && job.failed.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-red-400 uppercase tracking-wider">Failed ({job.failed.length})</p>
                  <ul className="flex flex-col gap-1">
                    {job.failed.map((f, i) => (
                      <li key={i} className="text-xs text-[var(--color-text-secondary)]">
                        {f.username ? <span className="font-mono text-[var(--color-text-primary)]">{f.username}</span> : <span className="italic">unknown</span>}
                        {' — '}
                        {f.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rebuilt flag */}
              {job.rebuilt && (
                <p className="text-xs text-[var(--color-text-secondary)] italic">
                  Progress rebuilt from database (server was restarted).
                </p>
              )}

              {/* Terminal: summary + retry + close */}
              {terminal ? (
                <div className="flex flex-col gap-3 pt-1">
                  <p className="text-sm text-[var(--color-text-primary)]">
                    <span className="font-semibold">{job.created}</span> users created
                    {failCount > 0 && (
                      <>, <span className="text-red-400 font-semibold">{failCount}</span> failed</>
                    )}
                    .
                  </p>
                  <div className="flex items-center gap-3">
                    {failCount > 0 && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleRetry}
                        aria-label={`Retry failed (${failCount})`}
                      >
                        Retry failed ({failCount})
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleClose}
                      aria-label="Close"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              ) : (
                /* Running: close button + muted notice */
                <div className="flex flex-col gap-2 pt-1">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    İş arka planda devam ediyor — modal kapatılsa da işlem sürer.
                  </p>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleClose}
                      disabled={starting}
                      aria-label="Close"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
