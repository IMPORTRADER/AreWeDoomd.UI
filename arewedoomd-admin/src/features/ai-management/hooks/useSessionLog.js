import { useState, useRef } from 'react';
import { aiManagementApi } from '../services/aiManagementApi';

/**
 * Lazy hook for fetching a session log on demand.
 *
 * Call fetch(ref) to trigger the request.
 * Call reset() to return to idle state.
 *
 * @returns {{ content: string|null, loading: boolean, error: any, fetch: (ref: string) => void, reset: () => void }}
 */
export default function useSessionLog() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const cancelledRef = useRef(false);

  function fetch(ref) {
    cancelledRef.current = false;
    setLoading(true);
    setContent(null);
    setError(null);

    return aiManagementApi
      .getSessionLog(ref)
      .then((res) => {
        if (cancelledRef.current) return;
        setContent(res.data.content);
      })
      .catch((err) => {
        if (cancelledRef.current) return;
        setError(err);
      })
      .finally(() => {
        if (!cancelledRef.current) setLoading(false);
      });
  }

  function reset() {
    cancelledRef.current = true;
    setContent(null);
    setError(null);
    setLoading(false);
  }

  return { content, loading, error, fetch, reset };
}
