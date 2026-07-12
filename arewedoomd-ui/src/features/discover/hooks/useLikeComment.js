import { useCallback, useState } from 'react';
import { postsApi } from '../services/postsApi';

export default function useLikeComment({ postId, commentId, initialLikeCount }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [busy, setBusy] = useState(false);

  const toggle = useCallback(async () => {
    if (busy) return;

    setBusy(true);

    const wasLiked = liked;
    const previousLikeCount = likeCount;

    setLiked(!wasLiked);
    setLikeCount(wasLiked ? previousLikeCount - 1 : previousLikeCount + 1);

    try {
      if (wasLiked) {
        await postsApi.unlikeComment(postId, commentId);
      } else {
        await postsApi.likeComment(postId, commentId);
      }
    } catch (error) {
      if (error?.response?.status === 409) {
        setLiked(true);
        setLikeCount(previousLikeCount);
      } else {
        setLiked(wasLiked);
        setLikeCount(previousLikeCount);
      }
    } finally {
      setBusy(false);
    }
  }, [busy, commentId, liked, likeCount, postId]);

  return { liked, likeCount, toggle, busy };
}
