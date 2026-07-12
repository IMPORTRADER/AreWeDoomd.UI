// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useLikeComment from './useLikeComment';
import { postsApi } from '../services/postsApi';

vi.mock('../services/postsApi', () => ({
  postsApi: {
    likeComment: vi.fn(),
    unlikeComment: vi.fn(),
  },
}));

describe('useLikeComment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('optimistically likes a comment and rolls back when the request fails', async () => {
    const request = Promise.withResolvers();
    postsApi.likeComment.mockReturnValueOnce(request.promise);
    const { result } = renderHook(() =>
      useLikeComment({ postId: 'post-1', commentId: 'comment-1', initialLikeCount: 4 }),
    );

    expect(result.current).toMatchObject({ liked: false, likeCount: 4, busy: false });

    act(() => {
      result.current.toggle();
    });

    expect(result.current).toMatchObject({ liked: true, likeCount: 5, busy: true });
    expect(postsApi.likeComment).toHaveBeenCalledWith('post-1', 'comment-1');

    await act(async () => {
      request.reject(new Error('Request failed'));
      await request.promise.catch(() => {});
    });

    await waitFor(() => {
      expect(result.current).toMatchObject({ liked: false, likeCount: 4, busy: false });
    });
  });

  it('optimistically unlikes a previously liked comment', async () => {
    postsApi.likeComment.mockResolvedValueOnce({});
    postsApi.unlikeComment.mockResolvedValueOnce({});
    const { result } = renderHook(() =>
      useLikeComment({ postId: 'post-1', commentId: 'comment-1', initialLikeCount: 4 }),
    );

    await act(async () => {
      await result.current.toggle();
    });

    expect(result.current).toMatchObject({ liked: true, likeCount: 5, busy: false });

    await act(async () => {
      await result.current.toggle();
    });

    expect(result.current).toMatchObject({ liked: false, likeCount: 4, busy: false });
    expect(postsApi.unlikeComment).toHaveBeenCalledWith('post-1', 'comment-1');
  });

  it('keeps the comment liked when the server reports it was already liked', async () => {
    postsApi.likeComment.mockRejectedValueOnce({ response: { status: 409 } });
    const { result } = renderHook(() =>
      useLikeComment({ postId: 'post-1', commentId: 'comment-1', initialLikeCount: 4 }),
    );

    await act(async () => {
      await result.current.toggle();
    });

    expect(result.current).toMatchObject({ liked: true, likeCount: 4, busy: false });
  });
});
