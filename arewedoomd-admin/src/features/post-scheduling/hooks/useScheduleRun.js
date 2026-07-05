import { useState, useRef, useEffect, useCallback } from 'react';
import { postSchedulingApi } from '../services/postSchedulingApi';

const TERMINAL_STATUSES = ['Completed', 'CompletedWithErrors'];
const POLL_INTERVAL_MS  = 2000;

/**
 * Manages the lifecycle of a post-scheduling run job.
 *
 * Returns { start, run, starting, polling, error, conflict, reset }
 *
 * start({ aiUserIds, overwriteExisting }) – POSTs to start the run then begins
 * polling every 2000 ms. A 409 response sets conflict (modal confirmation);
 * other errors set error. Polling skips a tick when document.visibilityState
 * is 'hidden' and stops automatically on unmount or when the run reaches a
 * terminal status (Completed | CompletedWithErrors).
 *
 * reset() – stops any active poll and clears all state for a fresh run.
 */
export default function useScheduleRun() {
  const [starting,  setStarting]  = useState(false);
  const [polling,   setPolling]   = useState(false);
  const [run,       setRun]       = useState(null);
  const [error,     setError]     = useState(null);
  const [conflict,  setConflict]  = useState(null);

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

  const beginPolling = useCallback((runId) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (mountedRef.current) setPolling(true);

    intervalRef.current = setInterval(async () => {
      // Visibility-pause: skip tick when tab is not visible
      if (document.visibilityState !== 'visible') return;

      // In-flight guard: prevent overlapping requests
      if (pendingRef.current) return;

      pendingRef.current = true;
      try {
        const res = await postSchedulingApi.getRun(runId);
        if (!mountedRef.current) return;
        const snapshot = res.data;
        setRun(snapshot);
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

  const start = useCallback(async ({ aiUserIds, overwriteExisting = false }) => {
    setStarting(true);
    setError(null);
    setConflict(null);
    setRun(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      const res = await postSchedulingApi.startRun({ aiUserIds, overwriteExisting });
      if (!mountedRef.current) return;
      const { runId } = res.data;
      setRun({ id: runId, status: 'Running', items: [] }); // optimistic seed
      beginPolling(runId);
    } catch (err) {
      if (!mountedRef.current) return;
      if (err?.response?.status === 409) {
        setConflict(err.response.data?.detail ?? 'Bugün için zaten plan var.');
      } else {
        setError(err);
      }
    } finally {
      if (mountedRef.current) setStarting(false);
    }
  }, [beginPolling]);

  const reset = useCallback(() => {
    stopPolling();
    if (mountedRef.current) {
      setRun(null);
      setError(null);
      setConflict(null);
      setStarting(false);
    }
  }, [stopPolling]);

  return { start, run, starting, polling, error, conflict, reset };
}
