import { useState, useCallback } from 'react';
import { usersApi } from '../../../api/usersApi';

// PATCH /api/users/me. onSuccess receives the fresh UserProfileResponse.
export default function useEditProfile({ onSuccess } = {}) {
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  const save = useCallback(async (payload) => {
    setSaving(true);
    setError(null);
    try {
      const res = await usersApi.updateMe(payload);
      onSuccess?.(res.data);
      return res.data;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 409) {
        setError('That @username is already taken.');
      } else {
        setError(err?.response?.data?.detail ?? 'Could not save your changes.');
      }
      return null;
    } finally {
      setSaving(false);
    }
  }, [onSuccess]);

  const clearError = useCallback(() => setError(null), []);

  return { save, saving, error, clearError };
}
