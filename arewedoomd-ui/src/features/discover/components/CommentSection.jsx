import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import CommentItem from './CommentItem';

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
  onShowMore,
}) {
  const [draft, setDraft] = useState('');
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const MAX_VISIBLE_COMMENTS = 6;
  const visibleComments = comments.slice(-MAX_VISIBLE_COMMENTS);
  const hiddenCount = Math.max(0, commentCount - visibleComments.length);

  const hasComments = !loading && visibleComments.length > 0;

  useLayoutEffect(() => {
    if (hasComments && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [hasComments]);

  const prevCountRef = useRef(visibleComments.length);

  useEffect(() => {
    if (visibleComments.length > prevCountRef.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
    prevCountRef.current = visibleComments.length;
  }, [visibleComments.length]);

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

  return (
    <div className="bg-[var(--color-panel)] px-5 py-4" onClick={(e) => e.stopPropagation()}>
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
          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => onShowMore?.(visibleComments[0]?.id)}
              className="w-full rounded-2xl border border-dashed border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-link)] hover:bg-[var(--color-link)]/10 transition-colors"
            >
              Show more messages (+{hiddenCount})
            </button>
          )}
          {visibleComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onDelete={onDeleteComment}
            />
          ))}
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
