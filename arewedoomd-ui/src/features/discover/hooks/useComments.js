import { useState, useCallback, useEffect } from 'react';
import { postsApi } from '../services/postsApi';

export default function useComments(postId, initialComments = [], initialCommentCount = 0) {
  const [comments, setComments] = useState(initialComments);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(true);

  useEffect(() => {
    setComments(initialComments);
    setCommentCount(initialCommentCount);
    setLoaded(true);
  }, [initialComments, initialCommentCount, postId]);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await postsApi.getComments(postId);
      const data = res.data;
      const list = Array.isArray(data) ? data : data?.comments ?? [];
      setComments(list);
      if (!Array.isArray(data) && typeof data?.totalCount === 'number') {
        setCommentCount(data.totalCount);
      }
      setLoaded(true);
    } catch (err) {
      if (err?.response?.status === 401) {
        setError('Sign in to view and post comments.');
      } else {
        setError(err?.response?.data?.detail ?? 'Failed to load comments.');
      }
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
      setCommentCount((prev) => prev + 1);
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
    const prevCount = commentCount;
    setComments((c) => c.filter((comment) => comment.id !== commentId));
    setCommentCount((count) => Math.max(0, count - 1));

    try {
      await postsApi.deleteComment(postId, commentId);
    } catch {
      setComments(prev);
      setCommentCount(prevCount);
    }
  }, [postId, comments, commentCount]);

  return { comments, commentCount, loading, submitting, error, loaded, fetchComments, addComment, removeComment };
}
