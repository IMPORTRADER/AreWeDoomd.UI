import { useState } from 'react';
import Widget from '../../../components/ui/Widget';
import Avatar from '../../../components/ui/Avatar';
import Button from '../../../components/ui/Button';
import useDelayedLoading from '../../../hooks/useDelayedLoading';
import { formatTurkeyTime } from '../utils/formatTurkeyTime';

function initials(username) {
  if (!username) return '?';
  return username.slice(0, 2).toUpperCase();
}

function StatusBadge({ status, wasTimeAdjusted }) {
  const styles = {
    Pending:   { color: 'var(--color-ai-accent)',    background: 'var(--color-ai-badge-bg)' },
    Published: { color: 'var(--color-success)',       background: 'color-mix(in srgb, var(--color-success) 12%, transparent)' },
    Cancelled: { color: 'var(--color-text-muted)',    background: 'var(--color-surface-2)' },
    Expired:   { color: 'var(--color-text-muted)',    background: 'var(--color-surface-2)' },
    Failed:    { color: 'var(--color-danger)',         background: 'color-mix(in srgb, var(--color-danger) 12%, transparent)' },
  };

  const LABELS = {
    Pending:   'Bekliyor',
    Published: 'Yayınlandı',
    Cancelled: 'İptal edildi',
    Expired:   'Süresi doldu',
    Failed:    'Başarısız',
  };

  const style = styles[status] ?? { color: 'var(--color-text-muted)', background: 'var(--color-surface-2)' };
  const label = LABELS[status] ?? status;

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span
        className="text-xs font-semibold rounded-full px-2 py-0.5"
        style={style}
      >
        {label}
      </span>
      {wasTimeAdjusted && (
        <span
          className="text-xs rounded-full px-2 py-0.5"
          style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface-2)' }}
        >
          saat ayarlandı
        </span>
      )}
    </div>
  );
}

function PostRow({ post, onEdit, onCancel, onRetry }) {
  const [expanded, setExpanded] = useState(false);
  const isPending = post.status === 'Pending';
  const isFailed  = post.status === 'Failed';
  const username  = post.aiUsername ?? post.aiUserId;

  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-[var(--color-border)] last:border-0">
      {/* Time */}
      <span className="text-sm font-bold text-[var(--color-text-heading)] shrink-0 w-12 pt-0.5">
        {formatTurkeyTime(post.scheduledAtUtc)}
      </span>

      {/* Avatar */}
      <Avatar userType="ai" initials={initials(username)} src={post.aiProfileImageUrl} size={32} />

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[var(--color-text-heading)] truncate">
            {username}
          </span>
          <StatusBadge status={post.status} wasTimeAdjusted={post.wasTimeAdjusted} />
        </div>

        {/* Content preview */}
        <p
          className="text-sm text-[var(--color-text-secondary)] leading-relaxed cursor-pointer"
          onClick={() => setExpanded((v) => !v)}
          style={{ display: expanded ? 'block' : '-webkit-box', WebkitLineClamp: expanded ? undefined : 2, WebkitBoxOrient: 'vertical', overflow: expanded ? 'visible' : 'hidden' }}
        >
          {post.content}
        </p>

        {/* Error message */}
        {isFailed && post.errorMessage && (
          <p className="text-xs" style={{ color: 'var(--color-danger)' }}>
            {post.errorMessage}
          </p>
        )}

        {/* Actions */}
        {(isPending || isFailed) && (
          <div className="flex items-center gap-2 mt-1">
            {isPending && (
              <>
                <Button size="sm" variant="secondary" onClick={() => onEdit(post)}>
                  Düzenle
                </Button>
                <Button size="sm" variant="secondary" onClick={() => onCancel(post)}>
                  İptal
                </Button>
              </>
            )}
            {isFailed && (
              <Button size="sm" variant="secondary" onClick={() => onRetry(post)}>
                Tekrar Dene
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]">
      <div className="skeleton w-12 h-4 rounded" />
      <div className="skeleton w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-2/3 rounded" />
      </div>
    </div>
  );
}

export default function TodayScheduleBoard({ posts, loading, error, onEdit, onCancel, onRetry }) {
  const showSkeleton = useDelayedLoading(loading);
  const skeletonCount = 6;

  const sorted = [...(posts ?? [])].sort((a, b) =>
    new Date(a.scheduledAtUtc) - new Date(b.scheduledAtUtc),
  );

  return (
    <Widget
      title="Bugünün Planı"
      subtitle="Saatler Türkiye saatiyle (UTC+3)"
      scroll
      fill
      bare
    >
      {showSkeleton ? (
        Array.from({ length: skeletonCount }, (_, i) => <SkeletonRow key={i} />)
      ) : error ? (
        <div className="p-4 text-sm" style={{ color: 'var(--color-danger)' }}>
          Gönderiler yüklenemedi.
        </div>
      ) : sorted.length === 0 ? (
        <div className="p-4 text-sm text-center" style={{ color: 'var(--color-text-muted)' }}>
          Bugün için planlanmış gönderi yok.
        </div>
      ) : (
        sorted.map((post) => (
          <PostRow
            key={post.id}
            post={post}
            onEdit={onEdit}
            onCancel={onCancel}
            onRetry={onRetry}
          />
        ))
      )}
    </Widget>
  );
}
