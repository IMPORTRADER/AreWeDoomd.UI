import { useState, useEffect, useCallback, useRef } from 'react';
import { postSchedulingApi } from '../services/postSchedulingApi';

const FILTER_DEBOUNCE_MS = 300;

/**
 * Fetches scheduled posts with debounced filter changes and a tick-based
 * refresh mechanism (same pattern as useAiUsers).
 *
 * Returns { posts, loading, error, refresh }
 *
 * Filter changes (date, aiUserId, status) are debounced 300 ms to avoid
 * rapid successive API calls. refresh() bumps an internal tick with delay 0
 * so it resolves immediately.
 */
export default function useScheduledPosts({ date, aiUserId, status } = {}) {
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [tick,    setTick]    = useState(0);

  // Track previous filter values to distinguish filter changes from tick bumps.
  const prevDateRef      = useRef(date);
  const prevAiUserIdRef  = useRef(aiUserId);
  const prevStatusRef    = useRef(status);

  useEffect(() => {
    let cancelled = false;

    // Only debounce when a filter actually changed; tick bumps use delay 0.
    const filtersChanged =
      prevDateRef.current !== date ||
      prevAiUserIdRef.current !== aiUserId ||
      prevStatusRef.current !== status;

    prevDateRef.current     = date;
    prevAiUserIdRef.current = aiUserId;
    prevStatusRef.current   = status;

    const delay = filtersChanged ? FILTER_DEBOUNCE_MS : 0;

    const run = () => {
      setLoading(true);
      setPosts([]);

      postSchedulingApi
        .listPosts({ date, aiUserId, status })
        .then((res) => {
          if (cancelled) return;
          setPosts(res.data);
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
  }, [date, aiUserId, status, tick]);

  const refresh = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  return { posts, loading, error, refresh };
}
