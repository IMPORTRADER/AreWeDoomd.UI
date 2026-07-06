import { useState, useRef, useEffect, useCallback } from 'react';
import { llmSettingsApi } from '../services/llmSettingsApi';

/**
 * LLM ayarlarını mount'ta çeker; save(next) PUT atar ve yanıtla state'i günceller.
 * Returns { settings, loading, error, save, saving }
 */
export default function useLlmSettings() {
  const [settings, setSettings] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [saving,   setSaving]   = useState(false);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    llmSettingsApi
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
      const res = await llmSettingsApi.updateSettings(next);
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
