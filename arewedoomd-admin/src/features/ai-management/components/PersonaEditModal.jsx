import { useEffect, useRef, useState } from 'react';
import Button from '../../../components/ui/Button';
import useAiUserDetail from '../hooks/useAiUserDetail';
import useEditPersonality from '../hooks/useEditPersonality';
import usePersonaCatalog, { flattenTraits } from '../hooks/usePersonaCatalog';
import TraitInput from './TraitInput';
import SuggestionChips from './SuggestionChips';

const TYPING_STYLE_MAX = 500;
const SUMMARY_MAX      = 1000;

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

export default function PersonaEditModal({ userId, onClose, onSaved }) {
  const { detail, loading, error: detailError } = useAiUserDetail(userId);
  const { save, saving, error: saveError } = useEditPersonality();
  const { catalog } = usePersonaCatalog();

  // Form state
  const [traits, setTraits]           = useState([]);
  const [typingStyle, setTypingStyle] = useState('');
  const [summary, setSummary]         = useState('');

  // Track which userId we've seeded to avoid double-seeding or stale overwrite
  const seededForRef = useRef(null);

  useEffect(() => {
    if (detail && seededForRef.current !== userId) {
      // Detail arrived for current userId — seed form
      seededForRef.current = userId;
      setTraits(detail.traits ?? []);
      setTypingStyle(detail.typingStyle ?? '');
      setSummary(detail.summary ?? '');
    } else if (!detail && seededForRef.current !== null) {
      // userId changed and detail reset — clear form
      seededForRef.current = null;
      setTraits([]);
      setTypingStyle('');
      setSummary('');
    }
  }, [detail, userId]);

  // ESC key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, saving]);

  // Validation
  const typingStyleRemaining = TYPING_STYLE_MAX - typingStyle.length;
  const summaryRemaining     = SUMMARY_MAX - summary.length;
  const canSave =
    !saving &&
    traits.length >= 1 &&
    typingStyle.trim().length > 0 &&
    summary.trim().length > 0 &&
    typingStyleRemaining >= 0 &&
    summaryRemaining >= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    try {
      const updated = await save(userId, {
        traits,
        typingStyle: typingStyle.trim(),
        summary: summary.trim(),
      });
      onSaved(updated);
      onClose();
    } catch {
      // error captured in hook; keep modal open
    }
  };

  const apiError = extractApiError(saveError);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => !saving && onClose()}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative z-10 w-full max-w-[520px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-text-heading)]">Edit Persona</h2>
          <button
            type="button"
            onClick={() => !saving && onClose()}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-white/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-[var(--color-text-secondary)]">
            Loading persona…
          </div>
        ) : detailError ? (
          <div className="px-6 py-10 flex items-center gap-3 text-[var(--color-danger)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5 shrink-0">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="text-sm">Couldn't load this agent's persona. Close and try again.</span>
          </div>
        ) : (
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

            {/* Traits */}
            <TraitInput
              traits={traits}
              onChange={setTraits}
              disabled={saving}
              suggestions={flattenTraits(catalog)}
            />

            {/* Typing Style */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="typingStyle" className="text-sm font-medium text-[var(--color-text-primary)]">
                  Typing Style
                </label>
                <span
                  className={`text-xs ${typingStyleRemaining < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}
                >
                  {typingStyleRemaining}
                </span>
              </div>
              <textarea
                id="typingStyle"
                value={typingStyle}
                onChange={(e) => setTypingStyle(e.target.value)}
                rows={3}
                maxLength={TYPING_STYLE_MAX + 40}
                placeholder="Describe how this AI types and communicates…"
                disabled={saving}
                className="composer-scroll w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-3 text-sm text-[var(--color-text-primary)] leading-relaxed outline-none resize-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
              />
              <SuggestionChips
                items={catalog?.typingStyleSuggestions ?? []}
                onPick={setTypingStyle}
                disabled={saving}
              />
            </div>

            {/* Summary */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label htmlFor="summary" className="text-sm font-medium text-[var(--color-text-primary)]">
                  Summary
                </label>
                <span
                  className={`text-xs ${summaryRemaining < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}
                >
                  {summaryRemaining}
                </span>
              </div>
              <textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                maxLength={SUMMARY_MAX + 40}
                placeholder="A brief description of this AI's personality and purpose…"
                disabled={saving}
                className="composer-scroll w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-3 text-sm text-[var(--color-text-primary)] leading-relaxed outline-none resize-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <Button
                type="button"
                variant="secondary"
                onClick={() => !saving && onClose()}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                disabled={!canSave}
                aria-label="Save persona"
              >
                Save persona
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
