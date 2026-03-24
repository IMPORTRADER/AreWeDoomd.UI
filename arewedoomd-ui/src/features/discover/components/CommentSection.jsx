import { useState, useRef, useEffect } from 'react';

const AVATAR_GRADIENTS = [
  'from-[#1a4a7a] to-[#0d3d4a]',
  'from-[#4a1a4a] to-[#6b1a1a]',
  'from-[#1a4a2a] to-[#0d3d1a]',
  'from-[#4a3a1a] to-[#6b4a0a]',
  'from-[#1a2a6a] to-[#0d1a5a]',
];

function avatarGradient(userId) {
  const sum = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_GRADIENTS[sum % AVATAR_GRADIENTS.length];
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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

export default function CommentSection({
  comments,
  loading,
  submitting,
  error,
  currentUserId,
  onAddComment,
  onDeleteComment,
}) {
  const [draft, setDraft] = useState('');
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

  return (
    <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
      {/* Comments list */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <span className="w-5 h-5 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-link)] animate-spin" />
        </div>
      )}

      {!loading && comments.length > 0 && (
        <div
          ref={listRef}
          className="sidebar-scroll flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1 mb-3"
        >
          {comments.map((comment) => {
            const isOwner = currentUserId && currentUserId === comment.userId;
            const initials = comment.userId.slice(0, 2).toUpperCase();
            const handle = `@${comment.userId.slice(0, 8)}`;

            return (
              <div
                key={comment.id}
                className="group/comment flex gap-2.5 p-2.5 rounded-[var(--radius-md)] bg-[var(--color-surface-2)]/50 hover:bg-[var(--color-surface-2)] transition-colors"
              >
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br ${avatarGradient(comment.userId)}`}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--color-text-heading)] truncate">
                      {handle}
                    </span>
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
                  <p className="text-[13px] text-[var(--color-text-primary)] leading-relaxed mt-0.5 break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && comments.length === 0 && (
        <p className="text-xs text-[var(--color-text-secondary)] text-center py-3">
          No comments yet. Be the first to share your thoughts.
        </p>
      )}

      {error && (
        <p className="text-xs text-[var(--color-danger)] mb-2">{error}</p>
      )}

      {/* Comment input */}
      {currentUserId && (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a comment..."
            disabled={submitting}
            maxLength={280}
            className="flex-1 px-3 py-2 text-sm rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] outline-none focus:border-[#3a4a5a] hover:bg-[var(--color-surface)] disabled:opacity-60 transition-colors"
          />
          <button
            type="submit"
            disabled={!draft.trim() || submitting}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-btn-primary)] text-white hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {submitting ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <SendIcon />
            )}
          </button>
        </form>
      )}
    </div>
  );
}
