import { useState, useEffect, useCallback, useRef } from 'react';
import { feedApi } from '../services/feedApi';

const PAGE_SIZE = 20;

export default function useGlobalFeed() {
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(false);
  const [error, setError]             = useState(null);
  // tick increments trigger a re-fetch; loading is reset to true by refresh() before bumping tick
  const [tick, setTick]               = useState(0);

  const asOfRef   = useRef(null);
  const offsetRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    asOfRef.current = null;
    offsetRef.current = 0;

    feedApi.getGlobal({ offset: 0, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        const { items, asOf, hasMore: more } = res.data;
        asOfRef.current = asOf;
        offsetRef.current = items.length;
        setPosts(items);
        setHasMore(more);
        setError(null);
      })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    feedApi.getGlobal({ offset: offsetRef.current, pageSize: PAGE_SIZE, asOf: asOfRef.current })
      .then((res) => {
        const { items, hasMore: more } = res.data;
        offsetRef.current += items.length;
        setPosts((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...items.filter((p) => !seen.has(p.id))];
        });
        setHasMore(more);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoadingMore(false));
  }, [loadingMore, hasMore]);

  // refresh resets loading to true *before* bumping tick so the UI shows a spinner immediately
  const refresh = useCallback(() => {
    setLoading(true);
    setTick((t) => t + 1);
  }, []);

  const prependPost = useCallback((post) => setPosts((prev) => [post, ...prev]), []);

  const updatePost = useCallback((updatedPost) => {
    setPosts((prev) => prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
  }, []);

  const removePost = useCallback((postId) => {
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  }, []);

  return {
    posts, loading, loadingMore, hasMore, error,
    refresh, loadMore, prependPost, updatePost, removePost,
  };
}
