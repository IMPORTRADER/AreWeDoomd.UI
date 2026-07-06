import { useState, useEffect, useCallback, useRef } from 'react';
import { aiManagementApi } from '../services/aiManagementApi';

const PAGE_SIZE = 50;
const POLL_INTERVAL = 5000;

const DEFAULT_FILTERS = { level: undefined, source: undefined, aiUserId: undefined };

export default function useAgentLogs() {
  const [items, setItems]               = useState([]);
  const [nextCursor, setNextCursor]     = useState(undefined);
  const [hasMore, setHasMore]           = useState(false);
  const [logAvailable, setLogAvailable] = useState(null);
  const [loading, setLoading]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [error, setError]               = useState(null);
  const [filters, setFiltersState]      = useState(DEFAULT_FILTERS);
  const [isLive, setIsLive]             = useState(true);

  // Refs to avoid stale closures in interval
  const filtersRef   = useRef(DEFAULT_FILTERS);
  const isLiveRef    = useRef(true);
  const inFlightRef  = useRef(false);
  const mountedRef   = useRef(true);

  useEffect(() => {
    // StrictMode remount runs this effect twice; re-arm the guard on each mount
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Core page-1 fetch — replaces items
  const fetchPage1 = useCallback((currentFilters) => {
    let cancelled = false;
    inFlightRef.current = true;
    setLoading(true);
    setError(null);

    aiManagementApi
      .getAgentLogs({ ...currentFilters, cursor: undefined, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled || !mountedRef.current) return;
        const { items: newItems, nextCursor: nc, hasMore: more, logAvailable: la } = res.data;
        setItems(newItems);
        setNextCursor(nc);
        setHasMore(more);
        if (la !== undefined) setLogAvailable(la);
      })
      .catch((err) => { if (!cancelled && mountedRef.current) setError(err); })
      .finally(() => {
        if (!cancelled && mountedRef.current) {
          setLoading(false);
          inFlightRef.current = false;
        }
      });

    return () => { cancelled = true; };
  }, []);

  // Trigger: on mount (once via internal effect with tick)
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const cleanup = fetchPage1(filtersRef.current);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  // Polling interval
  useEffect(() => {
    const id = setInterval(() => {
      if (
        document.visibilityState !== 'visible' ||
        !isLiveRef.current ||
        inFlightRef.current
      ) return;

      inFlightRef.current = true;
      aiManagementApi
        .getAgentLogs({ ...filtersRef.current, cursor: undefined, pageSize: PAGE_SIZE })
        .then((res) => {
          if (!mountedRef.current || !isLiveRef.current) return;
          const { items: newItems, nextCursor: nc, hasMore: more, logAvailable: la } = res.data;
          setItems(newItems);
          setNextCursor(nc);
          setHasMore(more);
          if (la !== undefined) setLogAvailable(la);
          setError(null);
        })
        .catch((err) => { if (mountedRef.current) setError(err); })
        .finally(() => { if (mountedRef.current) inFlightRef.current = false; });
    }, POLL_INTERVAL);

    return () => clearInterval(id);
  }, []);

  const setFilters = useCallback((newFilters) => {
    const merged = { ...DEFAULT_FILTERS, ...newFilters };
    filtersRef.current = merged;
    isLiveRef.current  = true;
    setFiltersState(merged);
    setIsLive(true);
    setNextCursor(undefined);
    setTick((t) => t + 1);
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || inFlightRef.current || !hasMore || !nextCursor) return;

    setLoadingMore(true);
    setIsLive(false);
    isLiveRef.current = false;

    aiManagementApi
      .getAgentLogs({ ...filtersRef.current, cursor: nextCursor, pageSize: PAGE_SIZE })
      .then((res) => {
        if (!mountedRef.current) return;
        const { items: moreItems, nextCursor: nc, hasMore: more, logAvailable: la } = res.data;
        setItems((prev) => {
          const seen = new Set(prev.map((l) => `${l.ts}|${l.source}|${l.message}`));
          return [...prev, ...moreItems.filter((l) => !seen.has(`${l.ts}|${l.source}|${l.message}`))];
        });
        setNextCursor(nc);
        setHasMore(more);
        if (la !== undefined) setLogAvailable(la);
        setError(null);
      })
      .catch((err) => { if (mountedRef.current) setError(err); })
      .finally(() => { if (mountedRef.current) setLoadingMore(false); });
  }, [loadingMore, hasMore, nextCursor]);

  const backToLive = useCallback(() => {
    isLiveRef.current = true;
    setIsLive(true);
    setNextCursor(undefined);
    setTick((t) => t + 1);
  }, []);

  const [clearing, setClearing] = useState(false);

  const clearLogs = useCallback(async () => {
    setClearing(true);
    try {
      await aiManagementApi.clearAgentLogs();
      if (!mountedRef.current) return;
      setItems([]);
      setError(null);
      isLiveRef.current = true;
      setIsLive(true);
      setNextCursor(undefined);
      setTick((t) => t + 1);
    } catch (err) {
      if (mountedRef.current) setError(err);
    } finally {
      if (mountedRef.current) setClearing(false);
    }
  }, []);

  return {
    items,
    nextCursor,
    hasMore,
    logAvailable,
    loading,
    loadingMore,
    error,
    filters,
    isLive,
    clearing,
    setFilters,
    loadMore,
    backToLive,
    clearLogs,
  };
}
