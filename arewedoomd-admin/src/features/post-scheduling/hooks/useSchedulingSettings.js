import { useState, useRef, useEffect, useCallback } from 'react';
import { postSchedulingApi } from '../services/postSchedulingApi';

/**
 * Fetches scheduling settings on mount and exposes a save function that
 * calls updateSettings and updates local state from the response.
 *
 * Returns { settings, loading, error, save(next), saving }
 */
export default function useSchedulingSettings() {
  const [settings, setSettings] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [saving,   setSaving]   = useState(false);

  const mountedRef = useRef(true);

  useEffect(() => {
    // StrictMode remount runs this effect twice; re-arm the guard on each mount
    mountedRef.current = true;

    let cancelled = false;

    postSchedulingApi
      .getSettings()
      .then((res) => {
        if (cancelled) return;
        setSettings(res.data);
        setError(null);
      })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, []);

  const save = useCallback(async (next) => {
    setSaving(true);
    setError(null);

    try {
      const res = await postSchedulingApi.updateSettings(next);
      if (!mountedRef.current) return;
      setSettings(res.data);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err);
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  }, []);

  return { settings, loading, error, save, saving };
}
