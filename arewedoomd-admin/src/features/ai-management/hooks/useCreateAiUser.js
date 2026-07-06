import { useState } from 'react';
import { aiManagementApi } from '../services/aiManagementApi';

/**
 * Provides a create function for registering a new AI user.
 *
 * @returns {{ create: Function, creating: boolean, error: any }}
 *
 * create({ username, email, traits, typingStyle, summary }) resolves with the
 * created AiUserDetail returned by the API.  Axios errors are captured into
 * the error state and re-thrown so the caller can keep the modal open.
 */
export default function useCreateAiUser() {
  const [creating, setCreating] = useState(false);
  const [error, setError]       = useState(null);

  const create = async ({ username, email, traits, typingStyle, summary }) => {
    setCreating(true);
    setError(null);

    try {
      const res = await aiManagementApi.createAiUser({ username, email, traits, typingStyle, summary });
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setCreating(false);
    }
  };

  return { create, creating, error };
}
