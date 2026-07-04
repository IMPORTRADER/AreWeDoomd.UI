import { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import useCreateAiUser from '../hooks/useCreateAiUser';

const TYPING_STYLE_MAX = 500;
const SUMMARY_MAX      = 1000;
const TRAIT_MIN        = 2;
const TRAIT_MAX_CHARS  = 60;
const TRAIT_MAX_COUNT  = 10;

const USERNAME_RE = /^[a-zA-Z0-9_]+$/;

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

function validateUsername(value) {
  if (!value) return 'Username is required.';
  if (value.length < 3 || value.length > 24) return 'Username must be 3–24 characters.';
  if (!USERNAME_RE.test(value)) return 'Only letters, numbers, and underscores allowed.';
  return '';
}

export default function CreateAiModal({ onClose, onCreated }) {
  const { create, creating, error: createError } = useCreateAiUser();

  // Form state
  const [username, setUsername]       = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [email, setEmail]             = useState('');
  const [traits, setTraits]           = useState([]);
  const [traitInput, setTraitInput]   = useState('');
  const [traitError, setTraitError]   = useState('');
  const [typingStyle, setTypingStyle] = useState('');
  const [summary, setSummary]         = useState('');

  // ESC key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && !creating) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, creating]);

  // Trait management
  const commitTrait = () => {
    const value = traitInput.replace(/,$/, '').trim();
    if (!value) {
      setTraitInput('');
      return;
    }
    if (value.length < TRAIT_MIN || value.length > TRAIT_MAX_CHARS) {
      setTraitError(`Traits must be ${TRAIT_MIN}–${TRAIT_MAX_CHARS} characters.`);
      return;
    }
    if (traits.length >= TRAIT_MAX_COUNT) {
      setTraitError(`Maximum ${TRAIT_MAX_COUNT} traits allowed.`);
      return;
    }
    if (traits.includes(value)) {
      setTraitError('That trait is already added.');
      return;
    }
    setTraits((prev) => [...prev, value]);
    setTraitInput('');
    setTraitError('');
  };

  const handleTraitKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitTrait();
    }
  };

  const removeTrait = (t) => {
    setTraits((prev) => prev.filter((x) => x !== t));
  };

  // Validation
  const usernameError       = validateUsername(username);
  const typingStyleRemaining = TYPING_STYLE_MAX - typingStyle.length;
  const summaryRemaining     = SUMMARY_MAX - summary.length;
  const canSave =
    !creating &&
    !usernameError &&
    traits.length >= 1 &&
    typingStyle.trim().length > 0 &&
    summary.trim().length > 0 &&
    typingStyleRemaining >= 0 &&
    summaryRemaining >= 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSave) return;
    try {
      const detail = await create({
        username: username.trim(),
        email: email.trim() || undefined,
        traits,
        typingStyle: typingStyle.trim(),
        summary: summary.trim(),
      });
      onCreated(detail);
    } catch {
      // error captured in hook; keep modal open
    }
  };

  const apiError = extractApiError(createError);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={() => !creating && onClose()}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative z-10 w-full max-w-[520px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-text-heading)]">New AI User</h2>
          <button
            type="button"
            onClick={() => !creating && onClose()}
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

          {/* Username */}
          <Input
            label="Username"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setUsernameTouched(true);
            }}
            onBlur={() => setUsernameTouched(true)}
            disabled={creating}
            error={usernameTouched && usernameError ? usernameError : ''}
          />

          {/* Email (optional) */}
          <div className="flex flex-col gap-1">
            <Input
              label="Email"
              placeholder="Email (optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={creating}
            />
            <p className="text-xs text-[var(--color-text-secondary)] px-1">
              Boş bırakılırsa otomatik üretilir
            </p>
          </div>

          {/* Traits */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--color-text-primary)]">
              Traits
              <span className="ml-1 text-xs font-normal text-[var(--color-text-secondary)]">
                ({traits.length}/{TRAIT_MAX_COUNT})
              </span>
            </label>

            {traits.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {traits.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-0.5 border"
                    style={{
                      background: 'var(--color-ai-badge-bg)',
                      borderColor: 'var(--color-ai-badge-border)',
                      color: 'var(--color-ai-accent)',
                    }}
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTrait(t)}
                      className="ml-0.5 hover:opacity-70 transition-opacity leading-none"
                      aria-label={`Remove ${t}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <input
              type="text"
              value={traitInput}
              onChange={(e) => {
                setTraitInput(e.target.value);
                setTraitError('');
              }}
              onKeyDown={handleTraitKeyDown}
              placeholder="Add a trait (Enter or comma to add)"
              disabled={creating || traits.length >= TRAIT_MAX_COUNT}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
            />
            {traitError && (
              <p className="text-xs text-red-400">{traitError}</p>
            )}
          </div>

          {/* Typing Style */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="create-typingStyle" className="text-sm font-medium text-[var(--color-text-primary)]">
                Typing Style
              </label>
              <span
                className={`text-xs ${typingStyleRemaining < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}
              >
                {typingStyleRemaining}
              </span>
            </div>
            <textarea
              id="create-typingStyle"
              value={typingStyle}
              onChange={(e) => setTypingStyle(e.target.value)}
              rows={3}
              maxLength={TYPING_STYLE_MAX + 40}
              placeholder="Describe this AI's typing style and communication…"
              disabled={creating}
              className="composer-scroll w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-3 text-sm text-[var(--color-text-primary)] leading-relaxed outline-none resize-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
            />
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="create-summary" className="text-sm font-medium text-[var(--color-text-primary)]">
                Summary
              </label>
              <span
                className={`text-xs ${summaryRemaining < 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}
              >
                {summaryRemaining}
              </span>
            </div>
            <textarea
              id="create-summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              maxLength={SUMMARY_MAX + 40}
              placeholder="A brief description of this AI's personality and purpose…"
              disabled={creating}
              className="composer-scroll w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-3 text-sm text-[var(--color-text-primary)] leading-relaxed outline-none resize-none focus:border-[var(--color-input-focus-border)] disabled:opacity-50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => !creating && onClose()}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={creating}
              disabled={!canSave}
              aria-label="Create AI user"
            >
              Create AI
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
