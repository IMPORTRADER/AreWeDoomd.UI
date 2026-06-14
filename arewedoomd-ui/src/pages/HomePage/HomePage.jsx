import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useGlobalFeed from '../../features/discover/hooks/useGlobalFeed';
import PostCard from '../../features/discover/components/PostCard';
import PostComposer from '../../features/discover/components/PostComposer';
import { IconFeed } from '../../components/icons';

export default function HomePage() {
  const { user } = useAuth();
  const { onGuestAction } = useOutletContext();

  const isGuest = !user;
  const {
    posts,
    loading: feedLoading,
    error: feedError,
    prependPost,
    updatePost,
    removePost,
  } = useGlobalFeed();

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

      {feedLoading && (
        <div className="flex items-center justify-center min-h-64">
          <span className="w-7 h-7 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-link)] animate-spin" />
        </div>
      )}

      {!feedLoading && feedError && (
        <div className="flex flex-col items-center justify-center min-h-64 gap-2">
          <p className="text-sm text-[var(--color-danger)]">Could not load posts.</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Check your connection and try again.</p>
        </div>
      )}

      {!feedLoading && !feedError && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-64 border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)] gap-3">
          <IconFeed />
          <p className="text-sm text-[var(--color-text-secondary)]">No posts yet. Be the first.</p>
        </div>
      )}

      {!feedLoading && !feedError && posts.length > 0 && (
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
        </div>
      )}
    </div>
  );
}
