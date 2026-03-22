import { useState, useRef, useEffect, useCallback } from 'react';
import useCreatePost from '../hooks/useCreatePost';

const MAX_CHARS = 280;

const AVATAR_GRADIENTS = [
  'from-[#1a4a7a] to-[#0d3d4a]',
  'from-[#4a1a4a] to-[#6b1a1a]',
  'from-[#1a4a2a] to-[#0d3d1a]',
  'from-[#4a3a1a] to-[#6b4a0a]',
  'from-[#1a2a6a] to-[#0d1a5a]',
];

function avatarGradient(userId) {
  const sum = String(userId).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[sum % AVATAR_GRADIENTS.length];
}

export default function PostComposer({ user, onPostCreated }) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent]   = useState('');
  const textareaRef             = useRef(null);
  const wrapperRef              = useRef(null);

  const remaining   = MAX_CHARS - content.length;
  const isOverLimit = remaining < 0;
  const isEmpty     = content.trim().length === 0;
  const canSubmit   = !isEmpty && !isOverLimit;

  const { submit, submitting, error } = useCreatePost({
    onSuccess: (newPost) => {
      setContent('');
      setExpanded(false);
      onPostCreated?.(newPost);
    },
  });

  // Focus textarea when expanding
  useEffect(() => {
    if (expanded) {
      textareaRef.current?.focus();
    }
  }, [expanded]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [content]);

  // Collapse when clicking outside (only if content is empty)
  useEffect(() => {
    if (!expanded) return;
    function onPointerDown(e) {
      if (!wrapperRef.current?.contains(e.target) && isEmpty) {
        setExpanded(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [expanded, isEmpty]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && canSubmit && !submitting) {
      e.preventDefault();
      submit(content);
    }
    if (e.key === 'Escape' && isEmpty) {
      setExpanded(false);
    }
  };

  const initials = String(user.userId ?? user.username ?? '??').slice(0, 2).toUpperCase();
  const gradient = avatarGradient(user.userId ?? user.username ?? '');

  // Progress ring
  const radius           = 10;
  const circumference    = 2 * Math.PI * radius;
  const progress         = Math.min(content.length / MAX_CHARS, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const ringColor        = isOverLimit ? '#ef4444' : remaining <= 20 ? '#f59e0b' : 'var(--color-link)';

  return (
    <div
      ref={wrapperRef}
      className={[
        'bg-[var(--color-surface)] border rounded-[var(--radius-lg)] transition-all duration-200',
        expanded
          ? 'border-[#3a4a5a] shadow-[0_0_0_1px_rgba(102,170,219,0.12)] p-4'
          : 'border-[var(--color-border)] p-3 cursor-text hover:border-[#3a3a3a]',
      ].join(' ')}
      onClick={() => { if (!expanded) setExpanded(true); }}
    >
      <div className="flex gap-3 items-start">
        {/* Avatar */}
        <div
          className={[
            `bg-gradient-to-br ${gradient}`,
            'rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white',
            'transition-all duration-200',
            expanded ? 'w-9 h-9' : 'w-7 h-7',
          ].join(' ')}
        >
          {initials}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Collapsed placeholder */}
          {!expanded && (
            <p className="text-sm text-[var(--color-text-secondary)] leading-[28px] select-none truncate">
              What&apos;s on your mind? Are we doomed?
            </p>
          )}

          {/* Expanded textarea */}
          {expanded && (
            <>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What's on your mind? Are we doomed?"
                rows={2}
                disabled={submitting}
                className={[
                  'w-full bg-transparent text-sm text-[var(--color-text-primary)]',
                  'placeholder:text-[var(--color-text-secondary)] resize-none outline-none',
                  'leading-relaxed overflow-hidden disabled:opacity-60',
                ].join(' ')}
              />

              {/* Toolbar */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]">
                <span className="text-[11px] text-[var(--color-text-secondary)] select-none">
                  {submitting ? 'Posting…' : 'Ctrl+Enter to post'}
                </span>

                <div className="flex items-center gap-3">
                  {/* Circular counter */}
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90" aria-hidden="true">
                      <circle cx="12" cy="12" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="2" />
                      <circle
                        cx="12" cy="12" r={radius} fill="none"
                        stroke={ringColor} strokeWidth="2" strokeLinecap="round"
                        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                        style={{ transition: 'stroke-dashoffset 0.15s ease, stroke 0.15s ease' }}
                      />
                    </svg>
                    {remaining <= 20 && (
                      <span className="absolute text-[9px] font-bold leading-none" style={{ color: ringColor }}>
                        {remaining}
                      </span>
                    )}
                  </div>

                  {/* Post button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); submit(content); }}
                    disabled={!canSubmit || submitting}
                    className={[
                      'px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150',
                      canSubmit && !submitting
                        ? 'bg-[var(--color-btn-primary)] text-white hover:bg-[var(--color-btn-primary-hover)] active:scale-95'
                        : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] cursor-not-allowed',
                    ].join(' ')}
                  >
                    {submitting ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full border border-white/40 border-t-white animate-spin" />
                        Posting
                      </span>
                    ) : (
                      'Post'
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="mt-2 text-xs text-[var(--color-danger)]">{error}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
