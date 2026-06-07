import { useState } from 'react';
import { postsApi } from '../services/postsApi';

export default function useCreatePost({ onSuccess } = {}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState(null);

  async function submit(content) {
    if (!content.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await postsApi.create(content.trim());
      onSuccess?.(res.data);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Failed to post. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return { submit, submitting, error };
}
