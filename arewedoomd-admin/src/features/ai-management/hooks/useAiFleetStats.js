import { useState, useEffect, useCallback } from 'react';
import { aiManagementApi } from '../services/aiManagementApi';

export default function useAiFleetStats() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    let cancelled = false;

    aiManagementApi.getStats()
      .then((res) => {
        if (cancelled) return;
        setStats(res.data);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [tick]);

  // refresh resets loading to true *before* bumping tick so the UI shows skeleton immediately
  const refresh = useCallback(() => {
    setError(null);
    setLoading(true);
    setTick((t) => t + 1);
  }, []);

  return { stats, loading, error, refresh };
}
