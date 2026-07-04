import { useState, useRef, useEffect, useCallback } from 'react';
import { aiManagementApi } from '../services/aiManagementApi';

const TERMINAL_STATUSES = ['completed', 'failed'];
const POLL_INTERVAL_MS  = 1500;

/**
 * Manages the lifecycle of a bulk AI-user creation job.
 *
 * Returns { start, job, starting, polling, error, reset }
 *
 * start({ count })  – POSTs to start the job then begins polling every 1500 ms.
 * Polling skips a tick when document.visibilityState is 'hidden' (same pattern
 * as useDecisionFeed) and stops automatically on unmount or when the job reaches
 * a terminal status (completed | failed).
 *
 * reset()  – stops any active poll and clears all state for a fresh run.
 */
export default function useBulkCreate() {
  const [starting, setStarting] = useState(false);
  const [polling,  setPolling]  = useState(false);
  const [job,      setJob]      = useState(null);
  const [error,    setError]    = useState(null);

  const mountedRef  = useRef(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (mountedRef.current) setPolling(false);
  }, []);

  const beginPolling = useCallback((jobId) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (mountedRef.current) setPolling(true);

    intervalRef.current = setInterval(async () => {
      // Visibility-pause: same check pattern as useDecisionFeed
      if (document.visibilityState !== 'visible') return;

      try {
        const res = await aiManagementApi.getBulkJob(jobId);
        if (!mountedRef.current) return;
        const snapshot = res.data;
        setJob(snapshot);
        if (TERMINAL_STATUSES.includes(snapshot.status)) {
          stopPolling();
        }
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err);
        stopPolling();
      }
    }, POLL_INTERVAL_MS);
  }, [stopPolling]);

  const start = useCallback(async ({ count }) => {
    setStarting(true);
    setError(null);
    setJob(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      const res = await aiManagementApi.startBulkCreate({ count });
      if (!mountedRef.current) return;
      const { jobId } = res.data;
      beginPolling(jobId);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err);
    } finally {
      if (mountedRef.current) setStarting(false);
    }
  }, [beginPolling]);

  const reset = useCallback(() => {
    stopPolling();
    if (mountedRef.current) {
      setJob(null);
      setError(null);
      setStarting(false);
    }
  }, [stopPolling]);

  return { start, job, starting, polling, error, reset };
}
