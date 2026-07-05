import { useState, useEffect, useRef } from 'react';
import { postSchedulingApi } from '../services/postSchedulingApi';

const DEBOUNCE_MS = 300;

/**
 * Fetches the AI user list for the AccountPickerPanel search input.
 * Debounces the search term by 300 ms to avoid rapid successive API calls.
 *
 * Returns { users, loading, error }
 */
export default function useAiUserOptions(search = '') {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const prevSearchRef = useRef(search);

  useEffect(() => {
    let cancelled = false;

    const filtersChanged = prevSearchRef.current !== search;
    prevSearchRef.current = search;
    const delay = filtersChanged ? DEBOUNCE_MS : 0;

    const run = () => {
      setLoading(true);

      postSchedulingApi
        .listAiUsers({ search, offset: 0, pageSize: 100 })
        .then((res) => {
          if (cancelled) return;
          // API returns { items, totalCount, hasMore } or a plain array
          const items = Array.isArray(res.data) ? res.data : (res.data?.items ?? []);
          setUsers(items);
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
  }, [search]);

  return { users, loading, error };
}
