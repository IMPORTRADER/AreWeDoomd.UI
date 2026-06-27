import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../../../api/usersApi';

// Loads a single profile. Pass a username for someone else's profile,
// or omit (null/undefined) to load the authenticated user's own profile.
export default function useProfile(username) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const request = username ? usersApi.getByUsername(username) : usersApi.getMe();

    request
      .then((res) => { if (!cancelled) setProfile(res.data); })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err?.response?.status === 404
            ? 'This profile does not exist.'
            : err?.response?.data?.detail ?? 'Could not load this profile.',
        );
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [username, tick]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  // Merge a partial update into the loaded profile without a refetch
  // (used after follow / edit so counts + flags reflect instantly).
  const patchProfile = useCallback((partial) => {
    setProfile((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  return { profile, loading, error, refresh, patchProfile, setProfile };
}
