import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDecisionFeed from './useDecisionFeed';

vi.mock('../services/aiManagementApi', () => ({
  aiManagementApi: {
    getDecisions: vi.fn(),
  },
}));

import { aiManagementApi } from '../services/aiManagementApi';

const PAGE1 = {
  data: {
    items: [{ ts: '2024-01-01T00:00:00Z', aiUserId: 'aaa', activityId: '1', outcome: 'executed', action: 'reply_comment', reasoning: 'test reason' }],
    nextCursor: 'cursor1',
    hasMore: true,
    logAvailable: true,
  },
};

const PAGE2 = {
  data: {
    items: [{ ts: '2024-01-01T00:01:00Z', aiUserId: 'bbb', activityId: '2', outcome: 'ignored', action: 'ignore', reasoning: 'reason2' }],
    nextCursor: 'cursor2',
    hasMore: false,
    logAvailable: true,
  },
};

const POLL_REFRESH = {
  data: {
    items: [{ ts: '2024-01-01T00:02:00Z', aiUserId: 'ccc', activityId: '3', outcome: 'action_failed', action: 'like_comment', reasoning: 'poll reason' }],
    nextCursor: null,
    hasMore: false,
    logAvailable: true,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  // Mock document.visibilityState as 'visible' so polling fires
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => 'visible',
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useDecisionFeed', () => {
  it('fetches initial page on mount', async () => {
    aiManagementApi.getDecisions.mockResolvedValue(PAGE1);

    const { result } = renderHook(() => useDecisionFeed());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(aiManagementApi.getDecisions).toHaveBeenCalledTimes(1);
    expect(aiManagementApi.getDecisions).toHaveBeenCalledWith(
      expect.objectContaining({ cursor: undefined, pageSize: 20 }),
    );
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].activityId).toBe('1');
    expect(result.current.loading).toBe(false);
    expect(result.current.isLive).toBe(true);
  });

  it('poll at 5s replaces items (page-1 snapshot)', async () => {
    aiManagementApi.getDecisions
      .mockResolvedValueOnce(PAGE1)
      .mockResolvedValueOnce(POLL_REFRESH);

    const { result } = renderHook(() => useDecisionFeed());

    // Initial fetch
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.items[0].activityId).toBe('1');

    // Advance 5000ms to trigger poll
    await act(async () => {
      vi.advanceTimersByTime(5000);
      await Promise.resolve();
    });

    expect(aiManagementApi.getDecisions).toHaveBeenCalledTimes(2);
    // items REPLACED (not appended)
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].activityId).toBe('3');
  });

  it('loadMore appends items and stops polling', async () => {
    aiManagementApi.getDecisions
      .mockResolvedValueOnce(PAGE1)
      .mockResolvedValueOnce(PAGE2);

    const { result } = renderHook(() => useDecisionFeed());

    // Initial fetch
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.isLive).toBe(true);

    // Load more
    await act(async () => {
      result.current.loadMore();
      await Promise.resolve();
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items[1].activityId).toBe('2');
    expect(result.current.isLive).toBe(false);

    // Advance 5s — no additional poll call
    await act(async () => {
      vi.advanceTimersByTime(5000);
      await Promise.resolve();
    });

    // Still only 2 calls (initial + loadMore)
    expect(aiManagementApi.getDecisions).toHaveBeenCalledTimes(2);
  });

  it('setFilters resets to page 1 and resumes live polling', async () => {
    aiManagementApi.getDecisions
      .mockResolvedValueOnce(PAGE1)  // initial
      .mockResolvedValueOnce(PAGE2)  // loadMore (pauses live)
      .mockResolvedValueOnce(POLL_REFRESH); // after setFilters

    const { result } = renderHook(() => useDecisionFeed());

    // Initial fetch
    await act(async () => { await Promise.resolve(); });

    // LoadMore → pauses
    await act(async () => {
      result.current.loadMore();
      await Promise.resolve();
    });
    expect(result.current.isLive).toBe(false);

    // setFilters → reset + resume
    await act(async () => {
      result.current.setFilters({ outcome: 'executed' });
      await Promise.resolve();
    });

    expect(result.current.filters).toEqual(expect.objectContaining({ outcome: 'executed' }));
    expect(result.current.isLive).toBe(true);
    // Should have fetched page1 again with new filters
    expect(aiManagementApi.getDecisions).toHaveBeenCalledTimes(3);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].activityId).toBe('3');
  });

  it('backToLive resets to page 1 and resumes polling', async () => {
    aiManagementApi.getDecisions
      .mockResolvedValueOnce(PAGE1)
      .mockResolvedValueOnce(PAGE2)  // loadMore
      .mockResolvedValueOnce(POLL_REFRESH); // backToLive refetch

    const { result } = renderHook(() => useDecisionFeed());

    await act(async () => { await Promise.resolve(); });

    await act(async () => {
      result.current.loadMore();
      await Promise.resolve();
    });
    expect(result.current.isLive).toBe(false);

    await act(async () => {
      result.current.backToLive();
      await Promise.resolve();
    });

    expect(result.current.isLive).toBe(true);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].activityId).toBe('3');
  });

  it('loadMore is blocked while a poll is in-flight; poll response replaces items normally', async () => {
    // Manually control poll promise resolution
    let resolvePoll;
    const pollPromise = new Promise((resolve) => {
      resolvePoll = resolve;
    });

    aiManagementApi.getDecisions
      .mockResolvedValueOnce(PAGE1)    // 1st call: initial fetch
      .mockReturnValueOnce(pollPromise); // 2nd call: poll (unresolved)

    const { result } = renderHook(() => useDecisionFeed());

    // Initial fetch
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].activityId).toBe('1');

    // Trigger poll (5000ms) — poll request initiated but promise unresolved
    await act(async () => {
      vi.advanceTimersByTime(5000);
      await Promise.resolve();
    });

    // loadMore called while poll is in-flight — guard (inFlightRef.current) blocks it
    await act(async () => {
      result.current.loadMore();
      await Promise.resolve();
    });

    // Items unchanged; isLive still true because loadMore was a no-op
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].activityId).toBe('1');
    expect(result.current.isLive).toBe(true);

    // Now resolve the poll promise — items updated normally
    await act(async () => {
      resolvePoll(POLL_REFRESH);
      await Promise.resolve();
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].activityId).toBe('3');
    expect(result.current.isLive).toBe(true);
  });
});
