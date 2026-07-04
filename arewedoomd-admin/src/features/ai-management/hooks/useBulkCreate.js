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
  const pendingRef  = useRef(false);

  useEffect(() => {
    // StrictMode remount runs this effect twice; re-arm the guard on each mount
    mountedRef.current = true;
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

      // In-flight guard: prevent overlapping requests
      if (pendingRef.current) return;

      pendingRef.current = true;
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
      } finally {
        pendingRef.current = false;
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
      // Seed optimistic state immediately so the modal exits phase 1 without
      // waiting for the first poll tick; poll responses will overwrite this.
      setJob({ jobId, status: 'queued', requested: count, generated: 0, created: 0, failed: [], createdUsers: [] });
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
