import { useState, useRef, useCallback, useEffect } from 'react';
import { postSchedulingApi } from '../services/postSchedulingApi';

/**
 * Thin hook that wraps post-level mutation calls so pages never import
 * services directly (per repo convention: hooks manage request lifecycle).
 *
 * Actions never throw — errors are captured in actionError (extracted string).
 */

function extractApiError(err) {
  if (!err) return null;
  const data = err?.response?.data;
  if (!data) return err?.message ?? 'Bir hata oluştu.';
  if (typeof data === 'string') return data;
  if (data.errors) {
    const msgs = Object.values(data.errors).flat();
    return msgs.join(' ');
  }
  return data.detail ?? data.error ?? data.message ?? 'Bir hata oluştu.';
}

export default function usePostActions() {
  const [actionError, setActionError] = useState(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const cancelPost = useCallback(async (id) => {
    setActionError(null);
    try {
      await postSchedulingApi.cancelPost(id);
    } catch (err) {
      if (mountedRef.current) setActionError(extractApiError(err));
    }
  }, []);

  const retryPost = useCallback(async (id) => {
    setActionError(null);
    try {
      await postSchedulingApi.retryPost(id);
    } catch (err) {
      if (mountedRef.current) setActionError(extractApiError(err));
    }
  }, []);

  return { cancelPost, retryPost, actionError };
}
