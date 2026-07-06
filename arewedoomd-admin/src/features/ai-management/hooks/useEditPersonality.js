import { useState } from 'react';
import { aiManagementApi } from '../services/aiManagementApi';

/**
 * Provides a save function for updating an AI user's personality.
 *
 * @returns {{ save: Function, saving: boolean, error: any }}
 *
 * save(userId, { traits, typingStyle, summary }) resolves with the updated
 * detail returned by the API.  Axios errors are captured into the error state
 * and re-thrown so the caller can decide whether to keep the modal open.
 */
export default function useEditPersonality() {
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState(null);

  const save = async (userId, { traits, typingStyle, summary }) => {
    setSaving(true);
    setError(null);

    try {
      const res = await aiManagementApi.updatePersonality(userId, { traits, typingStyle, summary });
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return { save, saving, error };
}
