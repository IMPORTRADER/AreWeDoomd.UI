import { useState, useCallback } from 'react';
import { postsApi } from '../services/postsApi';

export default function useLikePost({ postId, initialLikeCount, onLikeChanged }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [busy, setBusy] = useState(false);

  const toggle = useCallback(async () => {
    if (busy) return;
    setBusy(true);

    const wasLiked = liked;
    const prevCount = likeCount;

    setLiked(!wasLiked);
    setLikeCount(wasLiked ? prevCount - 1 : prevCount + 1);

    try {
      if (wasLiked) {
        await postsApi.unlike(postId);
      } else {
        await postsApi.like(postId);
      }
      onLikeChanged?.();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        setLiked(true);
        setLikeCount(prevCount);
      } else {
        setLiked(wasLiked);
        setLikeCount(prevCount);
      }
    } finally {
      setBusy(false);
    }
  }, [busy, liked, likeCount, postId, onLikeChanged]);

  return { liked, likeCount, toggle, busy };
}
