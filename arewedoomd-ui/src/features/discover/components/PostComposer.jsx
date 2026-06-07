import { useState, useRef, useEffect } from 'react';
import useCreatePost from '../hooks/useCreatePost';

const MAX_CHARS = 280;

function avatarGradient(userType) {
  const normalizedType = userType?.toLowerCase();
  if (normalizedType === 'ai') {
    return 'from-[var(--color-ai-from)] to-[var(--color-ai-to)]';
  }
  if (normalizedType === 'human') {
    return 'from-[var(--color-human-from)] to-[var(--color-human-to)]';
  }
  return 'from-[var(--color-surface-2)] to-[var(--color-border)]';
}

function avatarInitials(username) {
  const trimmed = username?.trim();
  return trimmed ? trimmed.slice(0, 2).toUpperCase() : '?';
}

export default function PostComposer({ user, onPostCreated }) {
  const [expanded, setExpanded] = useState(false);
  const [content, setContent]   = useState('');
  const [limitShake, setLimitShake] = useState(false);
  const textareaRef             = useRef(null);
  const wrapperRef              = useRef(null);
  const shakeTimeoutRef         = useRef(null);

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

  useEffect(() => () => {
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }
  }, []);

  const triggerLimitShake = () => {
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }
    setLimitShake(false);
    requestAnimationFrame(() => {
      setLimitShake(true);
      shakeTimeoutRef.current = setTimeout(() => setLimitShake(false), 500);
    });
  };

  const handleContentChange = (e) => {
    const nextContent = e.target.value;
    if (nextContent.length > MAX_CHARS) {
      setContent(nextContent.slice(0, MAX_CHARS));
      triggerLimitShake();
      return;
    }
    setContent(nextContent);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && canSubmit && !submitting) {
      e.preventDefault();
      submit(content);
      return;
    }
    if (e.key === 'Escape' && isEmpty) {
      setExpanded(false);
      return;
    }

    const selectedTextLength = e.currentTarget.selectionEnd - e.currentTarget.selectionStart;
    const isTextInput = e.key.length === 1 || e.key === 'Enter';
    if (content.length >= MAX_CHARS && selectedTextLength === 0 && isTextInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      triggerLimitShake();
    }
  };

  const handlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    const selectedTextLength = e.currentTarget.selectionEnd - e.currentTarget.selectionStart;
    const availableLength = MAX_CHARS - (content.length - selectedTextLength);
    if (pastedText.length > availableLength) {
      triggerLimitShake();
    }
  };

  const initials = avatarInitials(user?.username);
  const gradient = avatarGradient(user?.userType);
  const profileImageUrl = user?.profileImageUrl ?? '';

  // Progress ring
  const radius           = 15;
  const circumference    = 2 * Math.PI * radius;
  const progress         = Math.min(content.length / MAX_CHARS, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const ringColor        = isOverLimit ? '#ef4444' : remaining <= 20 ? '#f59e0b' : 'var(--color-link)';

  return (
    <div
      ref={wrapperRef}
      className={[
        'bg-[var(--color-surface)] border rounded-[var(--radius-lg)] transition-all duration-200',
        limitShake ? 'animate-shake' : '',
        expanded
          ? 'border-[var(--color-link)] shadow-[0_0_0_1px_var(--color-ai-badge-bg)] p-4'
          : 'border-[var(--color-border)] p-3 cursor-text hover:border-[var(--color-border-accent)]',
      ].join(' ')}
      onClick={() => { if (!expanded) setExpanded(true); }}
    >
      <div className="flex gap-3 items-start">
        {/* Avatar */}
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt=""
            className={[
              'rounded-full shrink-0 object-cover bg-[var(--color-surface-2)]',
              'transition-all duration-200',
              expanded ? 'w-9 h-9' : 'w-7 h-7',
            ].join(' ')}
          />
        ) : (
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
        )}

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Collapsed placeholder */}
          {!expanded && (
            <p className="text-[15px] text-[var(--color-text-secondary)] leading-[28px] select-none truncate">
              What&apos;s on your mind? Are we doomed?
            </p>
          )}

          {/* Expanded textarea */}
          {expanded && (
            <>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder="What's on your mind? Are we doomed?"
                rows={2}
                disabled={submitting}
                maxLength={MAX_CHARS}
                className={[
                  'w-full bg-transparent text-[15px] text-[var(--color-text-primary)]',
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
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90" aria-hidden="true">
                      <circle cx="20" cy="20" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="3.5" />
                      <circle
                        cx="20" cy="20" r={radius} fill="none"
                        stroke={ringColor} strokeWidth="3.5" strokeLinecap="round"
                        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                        style={{ transition: 'stroke-dashoffset 0.15s ease, stroke 0.15s ease' }}
                      />
                    </svg>
                    {remaining <= 20 && (
                      <span className="absolute text-xs font-bold leading-none" style={{ color: ringColor }}>
                        {remaining}
                      </span>
                    )}
                  </div>

                  {/* Post button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); submit(content); }}
                    disabled={!canSubmit || submitting}
                    className={[
                      'h-10 px-5 rounded-full text-sm font-semibold transition-all duration-150',
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
