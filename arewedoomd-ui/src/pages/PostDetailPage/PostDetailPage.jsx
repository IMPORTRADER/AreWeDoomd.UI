import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import usePostDetail from '../../features/discover/hooks/usePostDetail';
import CommentItem from '../../features/discover/components/CommentItem';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

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
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const [searchParams] = useSearchParams();
  const anchorCommentId = searchParams.get('anchor');
  const { user } = useAuth();
  const currentUserId = user?.userId ?? user?.id ?? null;

  const {
    post, comments, totalCount, hasMoreBefore, hasMoreAfter,
    loading, loadingOlder, loadingNewer, submitting, error,
    loadOlder, loadNewer, addComment, removeComment,
  } = usePostDetail(postId, anchorCommentId);

  const [draft, setDraft] = useState('');
  const anchorAppliedRef = useRef(false);

  // Reset the anchor-applied guard whenever the anchor param changes so a new
  // navigation to the same page with a different ?anchor= fires the scroll.
  useEffect(() => {
    anchorAppliedRef.current = false;
  }, [anchorCommentId]);

  // FR-12: scroll anchor comment to top of viewport (instant, one time)
  useLayoutEffect(() => {
    if (loading || anchorAppliedRef.current || !anchorCommentId) return;
    anchorAppliedRef.current = true;
    const el = document.getElementById(`comment-${anchorCommentId}`);
    if (el) el.scrollIntoView({ block: 'start' });
  }, [loading, anchorCommentId]);

  // FR-13: preserve scroll position when older comments are prepended
  async function handleLoadOlder() {
    const scroller = document.scrollingElement;
    const prevHeight = scroller.scrollHeight;
    const added = await loadOlder();
    if (added > 0) {
      requestAnimationFrame(() => {
        scroller.scrollTop += scroller.scrollHeight - prevHeight;
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!draft.trim() || submitting) return;
    const result = await addComment(draft);
    if (result) setDraft('');
  }

  if (loading) return <LoadingSpinner />;

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-[var(--color-text-secondary)]">{error ?? 'Post not found.'}</p>
        <Link to="/" className="mt-4 inline-block text-[var(--color-link)] hover:underline">
          Back to feed
        </Link>
      </div>
    );
  }

  const { author, content, likeCount, createdAt, updatedAt } = post;
  const authorUsername = author?.username ?? '';
  const authorProfileImageUrl = author?.profileImageUrl ?? '';
  const authorBadge = userTypeBadge(author?.userType);
  const initials = avatarInitials(authorUsername);
  const handle = authorUsername || (author?.userId ? author.userId.slice(0, 8) : 'Unknown');
  const isUpdated = updatedAt !== null && updatedAt !== undefined;
  const updatedTooltip = isUpdated
    ? new Date(updatedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="min-h-svh bg-[var(--color-bg)] text-[var(--color-text-primary)]">
      <div className="mx-auto max-w-2xl px-4 py-6 flex flex-col gap-4">
        <Link to="/" className="text-sm text-[var(--color-link)] hover:underline">
          ← Back to feed
        </Link>

        {/* Post content */}
        <article className="overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[0_20px_46px_rgba(0,0,0,0.24)]">
          <div className="h-1 bg-[linear-gradient(90deg,rgba(56,189,248,0.45)_0%,rgba(56,189,248,0.18)_34%,rgba(245,73,73,0.18)_66%,rgba(245,73,73,0.45)_100%)]" />
          <div className="p-5 pb-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              {authorProfileImageUrl ? (
                <img
                  src={authorProfileImageUrl}
                  alt=""
                  className="w-[46px] h-[46px] rounded-full shrink-0 object-cover bg-[var(--color-surface-2)]"
                />
              ) : (
                <div className={`w-[46px] h-[46px] rounded-full shrink-0 flex items-center justify-center text-[15px] font-bold text-white bg-gradient-to-br ${avatarGradient(author?.userType)}`}>
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-[17px] font-bold text-[var(--color-text-heading)] leading-tight truncate">
                    @{handle}
                  </p>
                  {authorBadge && (
                    <span className={`shrink-0 rounded px-1.5 py-0.5 border text-xs font-bold uppercase leading-none ${authorBadge.className}`}>
                      {authorBadge.label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {timeAgo(createdAt)}
                  </p>
                  {isUpdated && (
                    <>
                      <span className="text-xs text-[var(--color-text-secondary)]">·</span>
                      <span
                        title={updatedTooltip}
                        className="text-xs font-medium text-[var(--color-link)]"
                      >
                        Updated
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mt-4">
              <p className="text-base text-[var(--color-text-primary)] leading-relaxed break-words">
                {content}
              </p>
            </div>
          </div>

          {/* Footer — like count + comment count (read-only) */}
          <div className="flex items-center gap-2 px-5 py-3 bg-[var(--color-panel)] border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full text-sm text-[var(--color-text-secondary)]">
              <HeartIcon />
              <span className="font-medium">{likeCount ?? 0}</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full text-sm text-[var(--color-text-secondary)]">
              <MessageIcon />
              <span className="font-medium">{totalCount}</span>
            </div>
          </div>
        </article>

        {/* Comments — chronological oldest→newest */}
        <section className="flex flex-col gap-3.5">
          {hasMoreBefore && (
            <button
              type="button"
              onClick={handleLoadOlder}
              disabled={loadingOlder}
              className="w-full rounded-2xl border border-dashed border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-link)] hover:bg-[var(--color-link)]/10 transition-colors disabled:opacity-60"
            >
              {loadingOlder ? 'Loading…' : 'Show older comments'}
            </button>
          )}

          {comments.map((comment) => (
            <div key={comment.id} id={`comment-${comment.id}`}>
              <CommentItem
                comment={comment}
                currentUserId={currentUserId}
                onDelete={currentUserId ? removeComment : undefined}
              />
            </div>
          ))}

          {hasMoreAfter && (
            <button
              type="button"
              onClick={loadNewer}
              disabled={loadingNewer}
              className="w-full rounded-2xl border border-dashed border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-link)] hover:bg-[var(--color-link)]/10 transition-colors disabled:opacity-60"
            >
              {loadingNewer ? 'Loading…' : 'Show newer comments'}
            </button>
          )}

          {comments.length === 0 && (
            <p className="py-6 text-center text-xs text-[var(--color-text-secondary)]">
              No comments yet. Be the first to share your thoughts.
            </p>
          )}
        </section>

        {/* Composer — members only */}
        {currentUserId && (
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a comment..."
              rows={1}
              disabled={submitting}
              maxLength={280}
              className="min-h-10 max-h-32 flex-1 resize-none rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] px-3.5 py-2.5 text-[15px] leading-5 text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] outline-none focus:border-[var(--color-link)] transition-colors"
            />
            <button
              type="submit"
              disabled={!draft.trim() || submitting}
              className="px-4 h-10 rounded-full bg-[var(--color-btn-primary)] text-white text-sm font-semibold hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-40"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
