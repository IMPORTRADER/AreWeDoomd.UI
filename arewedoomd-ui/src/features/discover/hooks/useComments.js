import { useState, useCallback } from 'react';
import { postsApi } from '../services/postsApi';

export default function useComments(postId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await postsApi.getComments(postId);
      setComments(res.data);
      setLoaded(true);
    } catch (err) {
      setError(err?.response?.data?.detail ?? 'Failed to load comments.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const addComment = useCallback(async (content) => {
    if (!content.trim()) return null;

    setSubmitting(true);
    setError(null);

    try {
      const res = await postsApi.createComment(postId, content.trim());
      setComments((prev) => [...prev, res.data]);
      return res.data;
    } catch (err) {
      setError(err?.response?.data?.detail ?? err?.response?.data?.message ?? 'Failed to post comment.');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [postId]);

  const removeComment = useCallback(async (commentId) => {
    const prev = comments;
    setComments((c) => c.filter((comment) => comment.id !== commentId));

    try {
      await postsApi.deleteComment(postId, commentId);
    } catch {
      setComments(prev);
    }
  }, [postId, comments]);

  return { comments, loading, submitting, error, loaded, fetchComments, addComment, removeComment };
}
