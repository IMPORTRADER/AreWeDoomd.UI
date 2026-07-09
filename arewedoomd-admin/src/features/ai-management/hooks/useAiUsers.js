import { useState, useEffect, useCallback, useRef } from 'react';
import { aiManagementApi } from '../services/aiManagementApi';

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

export default function useAiUsers({ trait = '', search = '', status = '' } = {}) {
  const [users, setUsers]             = useState([]);
  const [totalCount, setTotalCount]   = useState(0);
  const [hasMore, setHasMore]         = useState(false);
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState(null);
  const [tick, setTick]               = useState(0);

  // Track previous filter values to distinguish filter changes from tick bumps.
  // Refs are initialised to the current prop values so the very first run
  // (mount) sees filtersChanged === false and uses delay 0 (immediate).
  const prevTraitRef  = useRef(trait);
  const prevSearchRef = useRef(search);
  const prevStatusRef = useRef(status);

  // Mounted flag for loadMore cancellation.
  const mountedRef = useRef(true);
  useEffect(() => {
    // StrictMode remount runs this effect twice; re-arm the guard on each mount
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Only debounce when the user actually changed a trait/search filter;
    // tick bumps from refresh() and status changes use delay 0 (immediate).
    const filtersChanged =
      prevTraitRef.current !== trait || prevSearchRef.current !== search;
    prevTraitRef.current  = trait;
    prevSearchRef.current = search;
    prevStatusRef.current = status;
    const delay = filtersChanged ? SEARCH_DEBOUNCE_MS : 0;

    const run = () => {
      setLoading(true);
      setUsers([]);

      aiManagementApi
        .listAiUsers({ trait, search, status, offset: 0, pageSize: PAGE_SIZE })
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

    const timer = setTimeout(run, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [trait, search, status, tick]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    aiManagementApi
      .listAiUsers({
        trait:    prevTraitRef.current,
        search:   prevSearchRef.current,
        status:   prevStatusRef.current,
        offset:   users.length,
        pageSize: PAGE_SIZE,
      })
      .then((res) => {
        if (!mountedRef.current) return;
        const { items, totalCount: total, hasMore: more } = res.data;
        setUsers((prev) => {
          const seen = new Set(prev.map((u) => u.id));
          return [...prev, ...items.filter((u) => !seen.has(u.id))];
        });
        setTotalCount(total);
        setHasMore(more);
        setError(null);
      })
      .catch((err) => { if (mountedRef.current) setError(err); })
      .finally(() => { if (mountedRef.current) setLoadingMore(false); });
  }, [loadingMore, hasMore, users.length]);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  return { users, totalCount, hasMore, loading, loadingMore, error, loadMore, refresh };
}
