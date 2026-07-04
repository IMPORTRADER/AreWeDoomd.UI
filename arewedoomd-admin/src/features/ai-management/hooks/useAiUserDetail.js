import { useState, useEffect } from 'react';
import { aiManagementApi } from '../services/aiManagementApi';

/**
 * Fetches the full detail of a single AI user.
 *
 * @param {string|null} userId  – null means idle (no fetch).
 * @returns {{ detail: object|null, loading: boolean, error: any }}
 */
export default function useAiUserDetail(userId) {
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    // Use a short delay (even 0ms) so that setState calls happen inside the
    // async callback rather than synchronously in the effect body — matching
    // the pattern used by useAiUsers (setTimeout wrap).
    const run = () => {
      setLoading(true);
      setDetail(null);
      setError(null);

      aiManagementApi
        .getAiUser(userId)
        .then((res) => {
          if (cancelled) return;
          setDetail(res.data);
          setError(null);
        })
        .catch((err) => {
          if (!cancelled) setError(err);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    const timer = setTimeout(run, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [userId]);

  return { detail, loading, error };
}
