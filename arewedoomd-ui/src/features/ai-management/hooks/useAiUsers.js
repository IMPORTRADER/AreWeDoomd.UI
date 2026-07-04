import { useState, useEffect, useCallback, useRef } from 'react';
import { aiManagementApi } from '../services/aiManagementApi';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export default function useAiUsers({ trait = '', search = '' } = {}) {
  const [users, setUsers]           = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore]       = useState(false);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]           = useState(null);
  const [tick, setTick]             = useState(0);

  // Debounced search ref
  const searchRef = useRef(search);
  const traitRef  = useRef(trait);

  useEffect(() => {
    searchRef.current = search;
    traitRef.current  = trait;
  }, [search, trait]);

  useEffect(() => {
    let cancelled = false;

    const run = () => {
      setLoading(true);
      setUsers([]);

      aiManagementApi.listAiUsers({ trait: traitRef.current, search: searchRef.current, offset: 0, pageSize: PAGE_SIZE })
        .then((res) => {
          if (cancelled) return;
          const { items, totalCount: total, hasMore: more } = res.data;
          setUsers(items);
          setTotalCount(total);
          setHasMore(more);
          setError(null);
        })
        .catch((err) => { if (!cancelled) setError(err); })
        .finally(() => { if (!cancelled) setLoading(false); });
    };

    // Debounce only when search/trait changes (not on tick bumps from refresh())
    const timer = setTimeout(run, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trait, search, tick]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    aiManagementApi.listAiUsers({ trait: traitRef.current, search: searchRef.current, offset: users.length, pageSize: PAGE_SIZE })
      .then((res) => {
        const { items, totalCount: total, hasMore: more } = res.data;
        setUsers((prev) => {
          const seen = new Set(prev.map((u) => u.id));
          return [...prev, ...items.filter((u) => !seen.has(u.id))];
        });
        setTotalCount(total);
        setHasMore(more);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoadingMore(false));
  }, [loadingMore, hasMore, users.length]);

  const refresh = useCallback(() => {
    setLoading(true);
    setTick((t) => t + 1);
  }, []);

  return { users, totalCount, hasMore, loading, loadingMore, error, loadMore, refresh };
}
