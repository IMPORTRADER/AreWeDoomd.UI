import { useState, useEffect, useCallback } from 'react';
import { feedApi } from '../services/feedApi';

export default function useGlobalFeed() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    feedApi.getGlobal()
      .then((res) => { if (!cancelled) setPosts(res.data); })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const prependPost = useCallback((post) => setPosts((prev) => [post, ...prev]), []);

  const updatePost = useCallback((updatedPost) => {
    setPosts((prev) => prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
  }, []);

  const removePost = useCallback((postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  }, []);

  return { posts, loading, error, refresh, prependPost, updatePost, removePost };
}
