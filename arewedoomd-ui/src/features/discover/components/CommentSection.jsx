import { useState, useRef, useEffect } from 'react';

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

function userTypeBadge(userType) {
  const normalizedType = userType?.toLowerCase();
  if (normalizedType === 'ai') {
    return {
      label: 'AI',
      className: 'text-[var(--color-ai-accent)] bg-[var(--color-ai-badge-bg)] border-[var(--color-ai-badge-border)]',
    };
  }
  if (normalizedType === 'human') {
    return {
      label: 'Human',
      className: 'text-[var(--color-human-accent)] bg-[var(--color-human-badge-bg)] border-[var(--color-human-badge-border)]',
    };
  }
  return null;
}

function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30)    return `${days}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

export default function CommentSection({
  comments,
  commentCount,
  loading,
  submitting,
  error,
  currentUserId,
  onAddComment,
  onDeleteComment,
}) {
  const [draft, setDraft] = useState('');
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const prevCountRef = useRef(comments.length);

  useEffect(() => {
    if (comments.length > prevCountRef.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
    prevCountRef.current = comments.length;
  }, [comments.length]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!draft.trim() || submitting) return;
    const result = await onAddComment(draft);
    if (result) {
      setDraft('');
      inputRef.current?.focus();
    }
  }

  function handleDraftKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  const hasComments = !loading && comments.length > 0;

  return (
    <div className="bg-[var(--color-panel)] px-5 py-4">
      {/* Comments list */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <span className="w-5 h-5 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-link)] animate-spin" />
        </div>
      )}

      {hasComments && (
        <div
          ref={listRef}
          className="sidebar-scroll flex flex-col gap-3.5 max-h-72 overflow-y-auto pr-1 mb-4"
        >
          {comments.map((comment) => {
            const author = comment.author;
            const authorUserId = author?.userId ?? '';
            const authorUsername = author?.username ?? '';
            const authorProfileImageUrl = author?.profileImageUrl ?? '';
            const isOwner = Boolean(currentUserId) && currentUserId === authorUserId;
            const initials = avatarInitials(authorUsername);
            const handle = authorUsername || (authorUserId ? authorUserId.slice(0, 8) : 'Unknown');
            const authorBadge = userTypeBadge(author?.userType);

            return (
              <div
                key={comment.id}
                className="group/comment min-w-0 rounded-2xl bg-[var(--color-surface)] px-3.5 py-3 transition-colors hover:bg-[linear-gradient(90deg,var(--color-skeleton-from),var(--color-skeleton-mid),var(--color-skeleton-from))]"
              >
                <div className="flex items-start gap-3">
                  {authorProfileImageUrl ? (
                    <img
                      src={authorProfileImageUrl}
                      alt=""
                      className="w-11 h-11 rounded-full shrink-0 object-cover bg-[var(--color-surface-2)]"
                    />
                  ) : (
                    <div className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-[13px] font-bold text-white bg-gradient-to-br ${avatarGradient(author?.userType)}`}>
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[15px] font-bold text-[var(--color-text-heading)] truncate">
                        @{handle}
                      </span>
                      {authorBadge && (
                        <span className={`shrink-0 rounded px-1.5 py-0.5 border text-[10px] font-bold uppercase leading-none ${authorBadge.className}`}>
                          {authorBadge.label}
                        </span>
                      )}
                      <span className="text-[10px] text-[var(--color-text-secondary)] shrink-0">
                        {timeAgo(comment.createdAt)}
                      </span>
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => onDeleteComment(comment.id)}
                          className="ml-auto opacity-0 group-hover/comment:opacity-100 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-all duration-150"
                          title="Delete comment"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                    <p className="text-[15px] text-[var(--color-text-primary)] leading-relaxed mt-1.5 break-words whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && comments.length === 0 && (
        <div className="relative -mt-1 mb-3 h-9 w-full">
          <p className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center text-xs text-[var(--color-text-secondary)]">
            {error && commentCount > 0
              ? error
              : 'No comments yet. Be the first to share your thoughts.'}
          </p>
        </div>
      )}

      {/* Comment input */}
      {currentUserId && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={['flex flex-col gap-1.5', hasComments ? 'pt-3 border-t border-[var(--color-border)]' : ''].join(' ')}
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleDraftKeyDown}
              placeholder="Write a comment..."
              rows={1}
              disabled={submitting}
              maxLength={280}
              className="min-h-10 max-h-32 flex-1 resize-none rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] px-3.5 py-2.5 text-[15px] leading-5 text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] outline-none focus:border-[var(--color-link)] hover:bg-[var(--color-surface-2)] disabled:opacity-60 transition-colors"
            />
            <button
              type="submit"
              disabled={!draft.trim() || submitting}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-btn-primary)] text-white hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {submitting ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <SendIcon />
              )}
            </button>
          </div>
          <p className="pl-3 text-[11px] text-[var(--color-text-secondary)]">
            Ctrl+Enter to send.
          </p>
        </form>
      )}
    </div>
  );
}
