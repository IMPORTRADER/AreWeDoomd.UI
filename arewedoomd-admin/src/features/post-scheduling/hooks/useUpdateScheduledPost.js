import { useState, useRef, useCallback, useEffect } from 'react';
import { postSchedulingApi } from '../services/postSchedulingApi';

/**
 * Handles the updatePost API call for EditScheduledPostModal.
 * Mirrors the useEditPersonality pattern: exposes { update, updating, error }.
 */
export default function useUpdateScheduledPost() {
  const [updating, setUpdating] = useState(false);
  const [error,    setError]    = useState(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const update = useCallback(async (id, payload) => {
    setUpdating(true);
    setError(null);
    try {
      const res = await postSchedulingApi.updatePost(id, payload);
      return res.data;
    } catch (err) {
      if (mountedRef.current) setError(err);
      throw err;
    } finally {
      if (mountedRef.current) setUpdating(false);
    }
  }, []);

  return { update, updating, error };
}
