import { useState, useCallback, useEffect } from 'react';
import { postsApi } from '../services/postsApi';

const PAGE_SIZE = 30;

export default function usePostDetail(postId, anchorCommentId) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMoreBefore, setHasMoreBefore] = useState(false);
  const [hasMoreAfter, setHasMoreAfter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadingNewer, setLoadingNewer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [postRes, commentsRes] = await Promise.all([
          postsApi.getById(postId),
          postsApi.getComments(
            postId,
            anchorCommentId
              ? { anchor: anchorCommentId, around: 2, limit: PAGE_SIZE }
              : { sort: 'asc', limit: PAGE_SIZE },
          ),
        ]);
        if (cancelled) return;

        setPost(postRes.data);
        const data = commentsRes.data;
        setComments(data?.comments ?? []);
        setTotalCount(data?.totalCount ?? 0);
        setHasMoreBefore(Boolean(data?.hasMoreBefore));
        setHasMoreAfter(Boolean(data?.hasMoreAfter));
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.status === 404
              ? 'Post not found.'
              : err?.response?.data?.detail ?? 'Failed to load post.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [postId, anchorCommentId]);

  const loadOlder = useCallback(async () => {
    if (loadingOlder || !hasMoreBefore || comments.length === 0) return 0;
    setLoadingOlder(true);

    try {
      const res = await postsApi.getComments(postId, { before: comments[0].id, limit: PAGE_SIZE });
      const page = res.data?.comments ?? [];
      setComments((prev) => [...page, ...prev]);
      setHasMoreBefore(Boolean(res.data?.hasMoreBefore));
      return page.length;
    } catch {
      return 0;
    } finally {
      setLoadingOlder(false);
    }
  }, [postId, comments, hasMoreBefore, loadingOlder]);

  const loadNewer = useCallback(async () => {
    if (loadingNewer || !hasMoreAfter || comments.length === 0) return 0;
    setLoadingNewer(true);

    try {
      const res = await postsApi.getComments(postId, {
        after: comments[comments.length - 1].id,
        limit: PAGE_SIZE,
      });
      const page = res.data?.comments ?? [];
      setComments((prev) => [...prev, ...page]);
      setHasMoreAfter(Boolean(res.data?.hasMoreAfter));
      return page.length;
    } catch {
      return 0;
    } finally {
      setLoadingNewer(false);
    }
  }, [postId, comments, hasMoreAfter, loadingNewer]);

  const addComment = useCallback(async (content) => {
    if (!content.trim()) return null;
    setSubmitting(true);

    try {
      const res = await postsApi.createComment(postId, content.trim());
      setComments((prev) => [...prev, res.data]);
      setTotalCount((prev) => prev + 1);
      return res.data;
    } catch (err) {
      setError(err?.response?.data?.detail ?? 'Failed to post comment.');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [postId]);

  const removeComment = useCallback(async (commentId) => {
    const prev = comments;
    const prevCount = totalCount;
    setComments((c) => c.filter((comment) => comment.id !== commentId));
    setTotalCount((count) => Math.max(0, count - 1));

    try {
      await postsApi.deleteComment(postId, commentId);
    } catch {
      setComments(prev);
      setTotalCount(prevCount);
    }
  }, [postId, comments, totalCount]);

  return {
    post,
    comments,
    totalCount,
    hasMoreBefore,
    hasMoreAfter,
    loading,
    loadingOlder,
    loadingNewer,
    submitting,
    error,
    loadOlder,
    loadNewer,
    addComment,
    removeComment,
  };
}
