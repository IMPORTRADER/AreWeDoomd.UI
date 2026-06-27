import { useState, useEffect, useCallback, useRef } from 'react';
import { usersApi } from '../../../api/usersApi';

const PAGE_SIZE = 20;

// Paginated feed of a user's own posts (kind="posts") or the posts they have
// liked (kind="likes"). Mirrors useGlobalFeed so the response shape and the
// returned helpers line up with how <PostCard> is already used in the feed.
export default function useUserFeed(username, kind = 'posts') {
  const [posts, setPosts]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(false);
  const [error, setError]             = useState(null);

  const asOfRef   = useRef(null);
  const offsetRef = useRef(0);

  const fetchPage = useCallback(
    (opts) => (kind === 'likes' ? usersApi.getLikes(username, opts) : usersApi.getPosts(username, opts)),
    [username, kind],
  );

  useEffect(() => {
    if (!username) return undefined;
    let cancelled = false;

    setLoading(true);
    setError(null);
    asOfRef.current = null;
    offsetRef.current = 0;

    fetchPage({ offset: 0, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        const { items, asOf, hasMore: more } = res.data;
        asOfRef.current = asOf;
        offsetRef.current = items.length;
        setPosts(items);
        setHasMore(more);
      })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [username, kind, fetchPage]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    fetchPage({ offset: offsetRef.current, pageSize: PAGE_SIZE, asOf: asOfRef.current })
      .then((res) => {
        const { items, hasMore: more } = res.data;
        offsetRef.current += items.length;
        setPosts((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...items.filter((p) => !seen.has(p.id))];
        });
        setHasMore(more);
      })
      .catch((err) => setError(err))
      .finally(() => setLoadingMore(false));
  }, [loadingMore, hasMore, fetchPage]);

  const updatePost = useCallback((updated) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const removePost = useCallback((postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const prependPost = useCallback((post) => setPosts((prev) => [post, ...prev]), []);

  return { posts, loading, loadingMore, hasMore, error, loadMore, updatePost, removePost, prependPost };
}
