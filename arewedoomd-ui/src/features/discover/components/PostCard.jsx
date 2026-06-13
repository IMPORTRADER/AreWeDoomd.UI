import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useManagePost from '../hooks/useManagePost';
import useLikePost from '../hooks/useLikePost';
import useComments from '../hooks/useComments';
import DeletePostDialog from './DeletePostDialog';
import CommentSection from './CommentSection';

const MAX_CHARS = 280;
const EMPTY_COMMENTS = [];

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

function HeartIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 1l4 4-4 4"/>
      <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
      <path d="M7 23l-4-4 4-4"/>
      <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="19" cy="12" r="1.75" />
    </svg>
  );
}

export default function PostCard({ post, currentUserId, onPostUpdated, onPostDeleted, onGuestAction, detail = false, commentState = null }) {
  const { author, content, likeCount, commentCount, comments: initialComments = EMPTY_COMMENTS, createdAt, updatedAt } = post;
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [draftContent, setDraftContent] = useState(content);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const menuRef = useRef(null);

  const authorUserId = author?.userId ?? '';
  const authorUsername = author?.username ?? '';
  const authorProfileImageUrl = author?.profileImageUrl ?? '';
  const authorBadge = userTypeBadge(author?.userType);
  const isOwner = Boolean(currentUserId) && currentUserId === authorUserId;
  const remaining = MAX_CHARS - draftContent.length;
  const isOverLimit = remaining < 0;
  const isDraftEmpty = draftContent.trim().length === 0;
  const isUnchanged = draftContent.trim() === content.trim();

  const {
    updatePost,
    deletePost,
    clearError,
    isUpdating,
    isDeleting,
    error,
  } = useManagePost({
    onUpdateSuccess: (updatedPost) => {
      onPostUpdated?.(updatedPost);
      setDraftContent(updatedPost.content);
      setIsEditing(false);
      setIsMenuOpen(false);
    },
    onDeleteSuccess: (postId) => {
      onPostDeleted?.(postId);
      setIsMenuOpen(false);
    },
  });

  const {
    liked,
    likeCount: displayLikeCount,
    toggle: toggleLike,
  } = useLikePost({ postId: post.id, initialLikeCount: likeCount });

  // In the feed each card owns its comments; on the post-detail page the parent
  // injects a paginated comment state so the card renders the full thread.
  const internalComments = useComments(post.id, initialComments, commentCount);
  const {
    comments,
    commentCount: displayCommentCount,
    loading: commentsLoading,
    submitting: commentSubmitting,
    error: commentsError,
    addComment,
    removeComment,
  } = commentState ?? internalComments;

  const canSave = !isDraftEmpty && !isOverLimit && !isUnchanged && !isUpdating;
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(draftContent.length / MAX_CHARS, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const ringColor = isOverLimit ? '#ef4444' : remaining <= 20 ? '#f59e0b' : 'var(--color-link)';

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isMenuOpen]);

  const initials = avatarInitials(authorUsername);
  const handle = authorUsername || (authorUserId ? authorUserId.slice(0, 8) : 'Unknown');
  const isUpdated = updatedAt !== null;
  const updatedTooltip = isUpdated
    ? new Date(updatedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  async function handleSave() {
    if (!canSave) return;
    await updatePost(post.id, draftContent);
  }

  async function handleDelete() {
    if (isDeleting) return;
    await deletePost(post.id);
  }

  function handleEditStart() {
    clearError();
    setDraftContent(content);
    setIsEditing(true);
    setIsMenuOpen(false);
  }

  function handleEditCancel() {
    clearError();
    setDraftContent(content);
    setIsEditing(false);
  }

  function handleDeleteRequest() {
    clearError();
    setIsMenuOpen(false);
    setIsDeleteDialogOpen(true);
  }

  function handleDeleteDialogClose() {
    if (isDeleting) return;
    clearError();
    setIsDeleteDialogOpen(false);
  }

  function goToDetail(anchorCommentId) {
    navigate(anchorCommentId
      ? `/posts/${post.id}?anchor=${anchorCommentId}`
      : `/posts/${post.id}`);
  }

  function handleCardClick() {
    if (detail || isEditing || isDeleteDialogOpen) return;
    goToDetail();
  }

  function handleLikeClick(event) {
    event.stopPropagation();
    if (!currentUserId) { onGuestAction?.(); return; }
    if (!liked) {
      setLikeAnimating(true);
      setTimeout(() => setLikeAnimating(false), 500);
    }
    toggleLike();
  }

  function handleCommentClick(event) {
    event.stopPropagation();
    if (detail) return;
    if (!currentUserId) { onGuestAction?.(); return; }
    goToDetail();
  }

  return (
    <>
      <article onClick={handleCardClick} className={[
        'group overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[0_20px_46px_rgba(0,0,0,0.24)] transition-all duration-150',
        detail ? '' : 'hover:border-[var(--color-border-accent)] cursor-pointer',
      ].join(' ')}>
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
          {isOwner && (
            <div ref={menuRef} className="relative shrink-0">
              <button
                type="button"
                aria-label="Post actions"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                disabled={isUpdating || isDeleting}
                onClick={(event) => {
                  event.stopPropagation();
                  clearError();
                  setIsMenuOpen((prev) => !prev);
                }}
                className="w-9 h-9 flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-60"
              >
                <MoreIcon />
              </button>

              {isMenuOpen && (
                <div className="absolute top-10 right-0 z-10 min-w-[132px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] shadow-lg">
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); handleEditStart(); }}
                    className="w-full px-3 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-white/5 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); handleDeleteRequest(); }}
                    className="w-full px-3 py-2 text-left text-sm text-[var(--color-danger)] hover:bg-red-500/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
          </div>

          {/* Content */}
          <div className="mt-4">
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={draftContent}
                  onChange={(event) => setDraftContent(event.target.value)}
                  rows={4}
                  disabled={isUpdating}
                  className="composer-scroll max-h-56 w-full overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-3 text-base text-[var(--color-text-primary)] leading-relaxed outline-none resize-none focus:border-[var(--color-link)] disabled:opacity-60"
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-[var(--color-text-secondary)] select-none">
                    Edit your post
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90" aria-hidden="true">
                        <circle cx="12" cy="12" r={radius} fill="none" stroke="var(--color-border)" strokeWidth="2" />
                        <circle
                          cx="12"
                          cy="12"
                          r={radius}
                          fill="none"
                          stroke={ringColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          style={{ transition: 'stroke-dashoffset 0.15s ease, stroke 0.15s ease' }}
                        />
                      </svg>
                      {remaining <= 20 && (
                        <span className="absolute text-[9px] font-bold leading-none" style={{ color: ringColor }}>
                          {remaining}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      disabled={isUpdating}
                      className="px-3.5 py-2 rounded-full text-sm font-semibold border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-white/5 transition-colors disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={!canSave}
                      className="px-3.5 py-2 rounded-full text-sm font-semibold bg-[var(--color-btn-primary)] text-white hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdating ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-[var(--color-danger)]">{error}</p>
                )}
              </div>
            ) : (
              <p className="text-base text-[var(--color-text-primary)] leading-relaxed break-words">
                {content}
              </p>
            )}
          </div>

          {!isEditing && !isDeleteDialogOpen && error && (
            <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-3 bg-[var(--color-panel)] border-y border-[var(--color-border)]">
          <button
            type="button"
            onClick={handleLikeClick}
            className={[
              'flex items-center gap-2 px-3.5 py-2 rounded-full text-sm transition-all duration-200',
              liked
                ? 'text-red-400 bg-red-400/10 hover:bg-red-400/20'
                : 'text-[var(--color-text-secondary)] hover:text-red-400 hover:bg-red-400/10',
            ].join(' ')}
          >
            <span className="relative flex items-center justify-center">
              {likeAnimating && (
                <span className="absolute w-5 h-5 rounded-full border-2 border-red-400 animate-heart-ring" />
              )}
              <span className={likeAnimating ? 'animate-heart-pop' : ''}>
                <HeartIcon filled={liked} />
              </span>
            </span>
            <span className="font-medium">{displayLikeCount}</span>
          </button>
          <button
            type="button"
            onClick={handleCommentClick}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full text-sm transition-all duration-200 text-[var(--color-text-secondary)] hover:text-[var(--color-link)] hover:bg-[var(--color-link)]/10"
          >
            <MessageIcon />
            <span className="font-medium">{displayCommentCount}</span>
          </button>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full text-sm transition-all duration-200 text-[var(--color-text-secondary)] hover:text-[var(--color-link)] hover:bg-[var(--color-link)]/10"
          >
            <ShareIcon />
            <span className="font-medium">0</span>
          </button>
        </div>

        {/* Comments */}
        <CommentSection
          comments={comments}
          commentCount={displayCommentCount}
          loading={commentsLoading}
          submitting={commentSubmitting}
          error={commentsError}
          currentUserId={currentUserId}
          onAddComment={addComment}
          onDeleteComment={removeComment}
          onShowMore={(anchorId) => {
            if (!currentUserId) { onGuestAction?.(); return; }
            goToDetail(anchorId);
          }}
          expanded={detail}
          anchorCommentId={commentState?.anchorCommentId}
          hasMoreBefore={commentState?.hasMoreBefore}
          hasMoreAfter={commentState?.hasMoreAfter}
          loadingOlder={commentState?.loadingOlder}
          loadingNewer={commentState?.loadingNewer}
          onLoadOlder={commentState?.onLoadOlder}
          onLoadNewer={commentState?.onLoadNewer}
        />
      </article>

      <DeletePostDialog
        open={isDeleteDialogOpen}
        onClose={handleDeleteDialogClose}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        error={isDeleteDialogOpen ? error : null}
      />
    </>
  );
}
