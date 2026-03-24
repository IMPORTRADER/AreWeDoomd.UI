import { useEffect, useRef, useState } from 'react';
import useManagePost from '../hooks/useManagePost';
import useLikePost from '../hooks/useLikePost';
import useComments from '../hooks/useComments';
import DeletePostDialog from './DeletePostDialog';
import CommentSection from './CommentSection';

const AVATAR_GRADIENTS = [
  'from-[#1a4a7a] to-[#0d3d4a]',
  'from-[#4a1a4a] to-[#6b1a1a]',
  'from-[#1a4a2a] to-[#0d3d1a]',
  'from-[#4a3a1a] to-[#6b4a0a]',
  'from-[#1a2a6a] to-[#0d1a5a]',
];

const MAX_CHARS = 280;

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

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="1.75" />
      <circle cx="12" cy="12" r="1.75" />
      <circle cx="19" cy="12" r="1.75" />
    </svg>
  );
}

export default function PostCard({ post, currentUserId, onPostUpdated, onPostDeleted, onGuestAction }) {
  const { userId, content, likeCount, commentCount, createdAt, updatedAt } = post;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [draftContent, setDraftContent] = useState(content);
  const [commentsOpen, setCommentsOpen] = useState(true);
  const menuRef = useRef(null);

  const isOwner = Boolean(currentUserId) && currentUserId === userId;
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

  const {
    comments,
    loading: commentsLoading,
    submitting: commentSubmitting,
    error: commentsError,
    loaded: commentsLoaded,
    fetchComments,
    addComment,
    removeComment,
  } = useComments(post.id);

  const displayCommentCount = commentsLoaded ? comments.length : commentCount;

  const canSave = !isDraftEmpty && !isOverLimit && !isUnchanged && !isUpdating;
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(draftContent.length / MAX_CHARS, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const ringColor = isOverLimit ? '#ef4444' : remaining <= 20 ? '#f59e0b' : 'var(--color-link)';

  useEffect(() => {
    setDraftContent(content);
  }, [content]);

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

  const initials = userId.slice(0, 2).toUpperCase();
  const handle   = `@${userId.slice(0, 8)}`;
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

  function handleLikeClick(event) {
    event.stopPropagation();
    if (!currentUserId) { onGuestAction?.(); return; }
    toggleLike();
  }

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  function handleCommentClick(event) {
    event.stopPropagation();
    if (!currentUserId) { onGuestAction?.(); return; }
  }

  return (
    <>
      <article className="group bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 hover:border-[#3a3a3a] hover:bg-[var(--color-surface)] transition-all duration-150 cursor-pointer">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3.5">
          <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${avatarGradient(userId)}`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--color-text-heading)] leading-none truncate">
              {handle}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                {timeAgo(createdAt)}
              </p>
              {isUpdated && (
                <>
                  <span className="text-[11px] text-[var(--color-text-secondary)]">·</span>
                  <span
                    title={updatedTooltip}
                    className="text-[11px] font-medium text-[var(--color-link)]"
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
                className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)] transition-colors disabled:opacity-60"
              >
                <MoreIcon />
              </button>

              {isMenuOpen && (
                <div className="absolute top-10 right-0 z-10 min-w-[132px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] shadow-lg">
                  <button
                    type="button"
                    onClick={handleEditStart}
                    className="w-full px-3 py-2 text-left text-sm text-[var(--color-text-primary)] hover:bg-white/5 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteRequest}
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
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={draftContent}
              onChange={(event) => setDraftContent(event.target.value)}
              rows={4}
              disabled={isUpdating}
              className="sidebar-scroll max-h-56 w-full overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] leading-relaxed outline-none resize-none focus:border-[#3a4a5a] disabled:opacity-60"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-[var(--color-text-secondary)] select-none">
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
                  className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-white/5 transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!canSave}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--color-btn-primary)] text-white hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-xs text-[var(--color-danger)]">{error}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-primary)] leading-relaxed break-words">
            {content}
          </p>
        )}

        {!isEditing && !isDeleteDialogOpen && error && (
          <p className="mt-3 text-xs text-[var(--color-danger)]">{error}</p>
        )}

        {/* Footer */}
        <div className="flex items-center gap-1 mt-4 pt-3.5 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={handleLikeClick}
            className={[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200',
              liked
                ? 'text-red-400 bg-red-400/10 hover:bg-red-400/20'
                : 'text-[var(--color-text-secondary)] hover:text-red-400 hover:bg-red-400/10',
            ].join(' ')}
          >
            <HeartIcon filled={liked} />
            <span className="font-medium">{displayLikeCount}</span>
          </button>
          <button
            type="button"
            onClick={handleCommentClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200 text-[var(--color-text-secondary)] hover:text-[var(--color-link)] hover:bg-[var(--color-link)]/10"
          >
            <MessageIcon />
            <span className="font-medium">{displayCommentCount}</span>
          </button>
        </div>

        {/* Comments */}
        <CommentSection
          comments={comments}
          loading={commentsLoading}
          submitting={commentSubmitting}
          error={commentsError}
          currentUserId={currentUserId}
          onAddComment={addComment}
          onDeleteComment={removeComment}
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
