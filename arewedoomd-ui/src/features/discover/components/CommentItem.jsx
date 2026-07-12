import MentionText from './MentionText';
import useLikeComment from '../hooks/useLikeComment';

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

function HeartIcon({ filled }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ReplyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 17 4 12 9 7" />
      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
  );
}

export default function CommentItem({ comment, currentUserId, onDelete, onReply, highlighted = false }) {
  const author = comment.author;
  const authorUserId = author?.userId ?? '';
  const authorUsername = author?.username ?? '';
  const authorProfileImageUrl = author?.profileImageUrl ?? '';
  const isOwner = Boolean(currentUserId) && currentUserId === authorUserId;
  const initials = avatarInitials(authorUsername);
  const handle = authorUsername || (authorUserId ? authorUserId.slice(0, 8) : 'Unknown');
  const authorBadge = userTypeBadge(author?.userType);
  const isAuthenticated = Boolean(currentUserId);
  const { liked, likeCount, toggle, busy } = useLikeComment({
    postId: comment.postId,
    commentId: comment.id,
    initialLikeCount: comment.likeCount,
  });

  return (
    <div
      className={[
        'group/comment min-w-0 rounded-2xl px-3.5 py-2.5 transition-colors',
        'hover:bg-[var(--color-surface)]',
        highlighted ? 'comment-highlight' : '',
      ].join(' ')}
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
            {isOwner && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                className="ml-auto opacity-0 group-hover/comment:opacity-100 text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-all duration-150"
                title="Delete comment"
              >
                <TrashIcon />
              </button>
            )}
          </div>
          <p className="text-[15px] text-[var(--color-text-primary)] leading-relaxed mt-1.5 break-words whitespace-pre-wrap">
            <MentionText text={comment.content} />
          </p>
          <div className="flex items-center mt-2.5 -ml-2">
            <button
              type="button"
              onClick={toggle}
              aria-label={liked ? 'Unlike' : 'Like'}
              aria-pressed={liked}
              disabled={!isAuthenticated || busy}
              className={`flex items-center gap-[5px] px-2 py-1.5 rounded-full text-[12.5px] font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                liked
                  ? 'text-red-400 bg-red-400/10'
                  : 'text-[var(--color-text-secondary)] hover:text-red-400 hover:bg-red-400/10'
              }`}
            >
              <HeartIcon filled={liked} />
              <span className="font-medium tabular-nums">{likeCount}</span>
            </button>
            {onReply && authorUsername && (
              <button
                type="button"
                onClick={() => onReply(authorUsername)}
                className="flex items-center gap-[5px] px-2 py-1.5 rounded-full text-[12.5px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-link)] hover:bg-sky-400/10 transition-all duration-200"
              >
                <ReplyIcon />
                Reply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
