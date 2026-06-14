import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import usePostDetail from '../../features/discover/hooks/usePostDetail';
import PostCard from '../../features/discover/components/PostCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function PostDetailPage() {
  const { postId } = useParams();
  const [searchParams] = useSearchParams();
  const anchorCommentId = searchParams.get('anchor');
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.userId ?? user?.id ?? null;

  const {
    post, comments, totalCount, hasMoreBefore, hasMoreAfter,
    loading, loadingOlder, loadingNewer, submitting, error,
    loadOlder, loadNewer, addComment, removeComment,
  } = usePostDetail(postId, anchorCommentId);

  // Reflect in-place edits without refetching the post.
  const [postOverride, setPostOverride] = useState(null);

  if (loading) return <LoadingSpinner />;

  if (!post) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-[var(--color-text-secondary)]">{error ?? 'Post not found.'}</p>
        <Link to="/" className="mt-4 inline-block text-[var(--color-link)] hover:underline">
          Back to feed
        </Link>
      </div>
    );
  }

  const commentState = {
    comments,
    commentCount: totalCount,
    loading: false,
    submitting,
    error,
    addComment,
    removeComment,
    anchorCommentId,
    hasMoreBefore,
    hasMoreAfter,
    loadingOlder,
    loadingNewer,
    onLoadOlder: loadOlder,
    onLoadNewer: loadNewer,
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 flex flex-col gap-4">
      <Link to="/" className="text-sm text-[var(--color-link)] hover:underline">
        ← Back to feed
      </Link>

      <PostCard
        post={postOverride ?? post}
        currentUserId={currentUserId}
        detail
        commentState={commentState}
        onPostUpdated={setPostOverride}
        onPostDeleted={() => navigate('/')}
      />
    </div>
  );
}
