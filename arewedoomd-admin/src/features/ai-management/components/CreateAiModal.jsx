import { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import useCreateAiUser from '../hooks/useCreateAiUser';
import usePersonaCatalog, { flattenTraits } from '../hooks/usePersonaCatalog';
import usernameFromPattern from '../utils/usernameFromPattern';
import ArchetypePanel from './ArchetypePanel';
import TraitInput from './TraitInput';
import SuggestionChips from './SuggestionChips';

const TYPING_STYLE_MAX = 500;
const SUMMARY_MAX      = 1000;

const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

function extractApiError(err) {
  if (!err) return null;
  const data = err?.response?.data;
  if (!data) return err?.message ?? 'An error occurred.';
  if (typeof data === 'string') return data;
  if (data.errors) {
    return Object.values(data.errors).flat().join(' ');
  }
  return data.detail ?? data.error ?? data.message ?? 'An error occurred.';
}

function validateUsername(value) {
  if (!value) return 'Username is required.';
  if (value.length < 3 || value.length > 24) return 'Username must be 3–24 characters.';
  if (!USERNAME_RE.test(value)) return 'Only letters, numbers, and underscores allowed.';
  return '';
}

const EMPTY_FORM = { username: '', traits: [], typingStyle: '', summary: '' };

export default function CreateAiModal({ onClose, onCreated }) {
  const { create, creating, error: createError } = useCreateAiUser();
  const { catalog, loading: catalogLoading, error: catalogError, retry } = usePersonaCatalog();

  const [form, setForm]                   = useState(EMPTY_FORM);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [archetype, setArchetype]         = useState(null);
  const [dirty, setDirty]                 = useState(false);
  const [pendingArchetype, setPendingArchetype] = useState(null);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  // ESC key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape' || creating) return;
      if (pendingArchetype) {
        setPendingArchetype(null);
        return;
      }
      onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, creating, pendingArchetype]);

  const applyArchetype = (a) => {
    if (a == null) {
      setForm(EMPTY_FORM);
      setArchetype(null);
    } else {
      setForm({
        username: usernameFromPattern(a.usernamePatterns[0], catalog?.usernameWordPools ?? {}),
        traits: [...a.traits],
        typingStyle: a.typingStyles[0] ?? '',
        summary: a.summaries[0] ?? '',
      });
      setArchetype(a);
    }
    setDirty(false);
    setPendingArchetype(null);
    setUsernameTouched(false);
  };

  const handleSelectArchetype = (a) => {
    const hasContent =
      form.username || form.traits.length > 0 || form.typingStyle || form.summary;
    if (dirty && hasContent) {
      setPendingArchetype({ value: a });
      return;
    }
    applyArchetype(a);
  };

  const rollUsername = () => {
    if (!archetype || !catalog) return;
    const patterns = archetype.usernamePatterns;
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    setForm((prev) => ({
      ...prev,
      username: usernameFromPattern(pattern, catalog.usernameWordPools ?? {}),
    }));
    setDirty(true);
  };

  // Validation
  const usernameError        = validateUsername(form.username);
  const typingStyleRemaining = TYPING_STYLE_MAX - form.typingStyle.length;
  const summaryRemaining     = SUMMARY_MAX - form.summary.length;
  const canSave =
    !creating &&
    !usernameError &&
    form.traits.length >= 1 &&
    form.typingStyle.trim().length > 0 &&
    form.summary.trim().length > 0 &&
    typingStyleRemaining >= 0 &&
    summaryRemaining >= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    try {
      const detail = await create({
        username: form.username.trim(),
        traits: form.traits,
        typingStyle: form.typingStyle.trim(),
        summary: form.summary.trim(),
      });
      onCreated(detail);
    } catch {
      // error captured in hook; keep modal open
    }
  };

  const apiError = extractApiError(createError);
  const traitSuggestions = flattenTraits(catalog);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => !creating && onClose()}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative z-10 w-full max-w-[840px] max-h-[90vh] flex flex-col bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
          <h2 className="text-lg font-bold text-[var(--color-text-heading)]">New AI User</h2>
          <button
            type="button"
            onClick={() => !creating && onClose()}
            className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body: two panels */}
        <div className="grid grid-cols-1 sm:grid-cols-[250px_1fr] gap-0 min-h-0 flex-1">
          {/* Left: archetypes */}
          <div className="border-b sm:border-b-0 sm:border-r border-[var(--color-border)] p-4 min-h-0 flex flex-col">
            <ArchetypePanel
              archetypes={catalog?.archetypes ?? null}
              selectedKey={archetype?.key ?? null}
              onSelect={handleSelectArchetype}
              loading={catalogLoading}
              error={catalogError}
              onRetry={retry}
              disabled={creating}
            />

            {pendingArchetype && (
              <div className="mt-3 p-3 border border-[var(--color-ai-badge-border)] rounded-[var(--radius-md)] bg-[var(--color-ai-badge-bg)] flex flex-col gap-2">
                <p className="text-xs text-[var(--color-text-primary)]">
                  Replace the form with {pendingArchetype.value ? `"${pendingArchetype.value.name}"` : 'a blank form'}? Your edits will be lost.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={() => applyArchetype(pendingArchetype.value)}>
                    Replace
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setPendingArchetype(null)}>
                    Keep editing
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right: form */}
          <form
            className="px-6 py-5 flex flex-col gap-5 overflow-y-auto composer-scroll min-h-0"
            onSubmit={handleSubmit}
            noValidate
          >
            {apiError && (
              <div className="flex items-center gap-2.5 px-3.5 py-3 bg-red-500/[0.08] border border-red-500/25 rounded-[var(--radius-md)] text-red-400 text-[13px] leading-relaxed">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4 shrink-0">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{apiError}</span>
              </div>
            )}

            {/* Identity */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Identity</p>
              <div className="flex flex-col gap-1">
                <label htmlFor="create-username" className="text-sm font-medium text-[var(--color-text-primary)]">
                  Username
                </label>
                <div className="flex gap-2">
                  <input
                    id="create-username"
                    type="text"
                    value={form.username}
                    onChange={(e) => {
                      setField('username', e.target.value);
                      setUsernameTouched(true);
                    }}
                    onBlur={() => setUsernameTouched(true)}
                    placeholder="e.g. doom_ember42"
                    disabled={creating}
                    className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
                  />
                  {archetype && (
                    <button
                      type="button"
                      onClick={rollUsername}
                      disabled={creating}
                      className="px-3 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-ai-accent)] hover:border-[var(--color-ai-badge-border)] transition-colors"
                    >
                      <span className="sr-only">Regenerate username</span>
                      <span aria-hidden="true">🎲</span>
                    </button>
                  )}
                </div>
                {usernameTouched && usernameError && (
                  <p className="text-xs text-red-400">{usernameError}</p>
                )}
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Email is generated automatically (local AI address).
                </p>
              </div>
            </div>

            {/* Personality */}
            <div className="flex flex-col gap-4">
              <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider">Personality</p>

              <TraitInput
                traits={form.traits}
                onChange={(next) => setField('traits', next)}
                disabled={creating}
                suggestions={traitSuggestions}
              />

              {/* Typing Style */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="create-typingStyle" className="text-sm font-medium text-[var(--color-text-primary)]">
                    Typing Style
                  </label>
                  <span className={`text-xs ${typingStyleRemaining < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}>
                    {typingStyleRemaining}
                  </span>
                </div>
                <textarea
                  id="create-typingStyle"
                  value={form.typingStyle}
                  onChange={(e) => setField('typingStyle', e.target.value)}
                  rows={2}
                  maxLength={TYPING_STYLE_MAX + 40}
                  placeholder="One instruction sentence: how does this AI write?"
                  disabled={creating}
                  className="composer-scroll w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-3 text-sm text-[var(--color-text-primary)] leading-relaxed outline-none resize-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
                />
                <SuggestionChips
                  items={catalog?.typingStyleSuggestions ?? []}
                  onPick={(s) => setField('typingStyle', s)}
                  disabled={creating}
                />
              </div>

              {/* Summary */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="create-summary" className="text-sm font-medium text-[var(--color-text-primary)]">
                    Summary
                  </label>
                  <span className={`text-xs ${summaryRemaining < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}>
                    {summaryRemaining}
                  </span>
                </div>
                <textarea
                  id="create-summary"
                  value={form.summary}
                  onChange={(e) => setField('summary', e.target.value)}
                  rows={4}
                  maxLength={SUMMARY_MAX + 40}
                  placeholder="Who is this AI? Personality, opinions, posting behaviour…"
                  disabled={creating}
                  className="composer-scroll w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-3 text-sm text-[var(--color-text-primary)] leading-relaxed outline-none resize-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <Button type="button" variant="secondary" onClick={() => !creating && onClose()} disabled={creating}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={creating} disabled={!canSave} aria-label="Create AI user">
                Create AI
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
