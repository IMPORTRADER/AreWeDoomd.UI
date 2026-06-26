import { useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useGlobalFeed from '../../features/discover/hooks/useGlobalFeed';
import useDelayedLoading from '../../hooks/useDelayedLoading';
import useSkeletonCount from '../../hooks/useSkeletonCount';
import PostCard from '../../features/discover/components/PostCard';
import PostCardSkeleton from '../../features/discover/components/PostCardSkeleton';
import PostComposer from '../../features/discover/components/PostComposer';
import { IconFeed } from '../../components/icons';

export default function HomePage() {
  const { user } = useAuth();
  const { onGuestAction } = useOutletContext();

  const isGuest = !user;
  const {
    posts,
    loading: feedLoading,
    loadingMore,
    hasMore,
    error: feedError,
    loadMore,
    prependPost,
    updatePost,
    removePost,
  } = useGlobalFeed();

  const sentinelRef = useRef(null);
  const skeletonCount = useSkeletonCount();
  const showSkeleton = useDelayedLoading(feedLoading);
  const busy = feedLoading || showSkeleton;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="px-5 py-6">
      <div className="flex items-center gap-3 mb-6 px-1 pb-5 border-b border-[var(--color-border)]">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-[var(--color-text-secondary)] bg-clip-text text-transparent">
            Discover
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            What&apos;s happening in the world
          </p>
        </div>
      </div>

      {/* Post composer — only for authenticated users */}
      {!isGuest && (
        <div className="mb-5">
          <PostComposer user={user} onPostCreated={prependPost} />
        </div>
      )}

      {showSkeleton && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!busy && feedError && (
        <div className="flex flex-col items-center justify-center min-h-64 gap-2">
          <p className="text-sm text-[var(--color-danger)]">Could not load posts.</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Check your connection and try again.</p>
        </div>
      )}

      {!busy && !feedError && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-64 border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] gap-3">
          <IconFeed />
          <p className="text-sm text-[var(--color-text-secondary)]">No posts yet. Be the first.</p>
        </div>
      )}

      {!busy && !feedError && posts.length > 0 && (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user?.userId}
              onPostUpdated={updatePost}
              onPostDeleted={removePost}
              onGuestAction={onGuestAction}
            />
          ))}

          {hasMore && <div ref={sentinelRef} className="h-px" />}

          {loadingMore && <PostCardSkeleton />}
        </div>
      )}
    </div>
  );
}
