import { useState, useCallback } from 'react';
import { aiManagementApi } from '../services/aiManagementApi';

/**
 * Provides a deactivate function for bulk-deactivating/reactivating AI users.
 *
 * @returns {{ deactivate: Function, busy: boolean, error: any, reset: Function }}
 *
 * deactivate({ userIds, deactivate: boolean }) — calls the bulk-deactivate API.
 * Returns a promise that resolves on success or rejects on error.
 * On error the error state is set; callers can display it in the confirm modal.
 */
export default function useBulkDeactivate() {
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState(null);

  const deactivate = useCallback(async ({ userIds, deactivate: shouldDeactivate }) => {
    setBusy(true);
    setError(null);
    try {
      await aiManagementApi.bulkDeactivateAiUsers({ userIds, deactivate: shouldDeactivate });
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setBusy(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return { deactivate, busy, error, reset };
}
