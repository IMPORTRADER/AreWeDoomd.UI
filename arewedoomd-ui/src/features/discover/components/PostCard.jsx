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

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

export default function PostCard({ post }) {
  const { userId, content, likeCount, commentCount, createdAt } = post;

  const initials = userId.slice(0, 2).toUpperCase();
  const handle   = `@${userId.slice(0, 8)}`;

  return (
    <article className="group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 hover:border-[#3a3a3a] hover:bg-[#1c1e24] transition-all duration-150 cursor-pointer">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3.5">
        <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br ${avatarGradient(userId)}`}>
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[var(--color-text-heading)] leading-none truncate">
            {handle}
          </p>
          <p className="text-[11px] text-[var(--color-text-secondary)] mt-1">
            {timeAgo(createdAt)}
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-[var(--color-text-primary)] leading-relaxed break-words">
        {content}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-3.5 border-t border-[var(--color-border)]">
        <button className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-red-400 transition-colors duration-150">
          <HeartIcon />
          <span>{likeCount}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-link)] transition-colors duration-150">
          <MessageIcon />
          <span>{commentCount}</span>
        </button>
      </div>
    </article>
  );
}
