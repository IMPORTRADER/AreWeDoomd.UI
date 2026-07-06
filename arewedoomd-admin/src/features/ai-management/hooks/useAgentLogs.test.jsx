import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAgentLogs from './useAgentLogs';

vi.mock('../services/aiManagementApi', () => ({
  aiManagementApi: { getAgentLogs: vi.fn() },
}));

import { aiManagementApi } from '../services/aiManagementApi';

const page = (items, { nextCursor = null, hasMore = false, logAvailable = true } = {}) => ({
  data: { items, nextCursor, hasMore, logAvailable },
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  Object.defineProperty(document, 'visibilityState', {
    configurable: true,
    get: () => 'visible',
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useAgentLogs', () => {
  it('loads the first page on mount', async () => {
    aiManagementApi.getAgentLogs.mockResolvedValue(
      page([{ ts: '2026-07-06T10:00:00Z', level: 'info', source: 'pipeline', message: 'hi' }]),
    );

    const { result } = renderHook(() => useAgentLogs());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.isLive).toBe(true);
    expect(aiManagementApi.getAgentLogs).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: 50, cursor: undefined }),
    );
  });

  it('refetches with merged filters and stays live', async () => {
    aiManagementApi.getAgentLogs.mockResolvedValue(page([]));

    const { result } = renderHook(() => useAgentLogs());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      result.current.setFilters({ level: 'error', source: 'llm_provider' });
      await Promise.resolve();
    });

    expect(result.current.isLive).toBe(true);
    expect(aiManagementApi.getAgentLogs).toHaveBeenLastCalledWith(
      expect.objectContaining({ level: 'error', source: 'llm_provider' }),
    );
  });

  it('loadMore appends and pauses live mode', async () => {
    aiManagementApi.getAgentLogs
      .mockResolvedValueOnce(page(
        [{ ts: '2026-07-06T10:01:00Z', level: 'info', source: 'admin', message: 'a' }],
        { nextCursor: '2026-07-06:1', hasMore: true },
      ))
      .mockResolvedValueOnce(page(
        [{ ts: '2026-07-06T10:00:00Z', level: 'info', source: 'admin', message: 'b' }],
      ));

    const { result } = renderHook(() => useAgentLogs());

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      result.current.loadMore();
      await Promise.resolve();
    });

    expect(result.current.items.map((i) => i.message)).toEqual(['a', 'b']);
    expect(result.current.isLive).toBe(false);

    // Advance 5s — no additional poll call because isLive is false
    await act(async () => {
      vi.advanceTimersByTime(5000);
      await Promise.resolve();
    });

    expect(aiManagementApi.getAgentLogs).toHaveBeenCalledTimes(2);
  });
});
