import { useState } from 'react';
import { postsApi } from '../services/postsApi';

export default function useManagePost({ onUpdateSuccess, onDeleteSuccess } = {}) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  async function updatePost(postId, content) {
    if (!content.trim()) return null;

    setIsUpdating(true);
    setError(null);

    try {
      const res = await postsApi.update(postId, content.trim());
      onUpdateSuccess?.(res.data);
      return res.data;
    } catch (err) {
      setError(err?.response?.data?.detail ?? err?.response?.data?.message ?? 'Failed to update post. Try again.');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }

  async function deletePost(postId) {
    setIsDeleting(true);
    setError(null);

    try {
      await postsApi.remove(postId);
      onDeleteSuccess?.(postId);
      return true;
    } catch (err) {
      setError(err?.response?.data?.detail ?? err?.response?.data?.message ?? 'Failed to delete post. Try again.');
      return false;
    } finally {
      setIsDeleting(false);
    }
  }

  function clearError() {
    setError(null);
  }

  return {
    updatePost,
    deletePost,
    clearError,
    isUpdating,
    isDeleting,
    error,
  };
}
