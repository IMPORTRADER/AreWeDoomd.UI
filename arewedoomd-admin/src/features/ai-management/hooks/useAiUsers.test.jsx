import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAiUsers from './useAiUsers';

vi.mock('../services/aiManagementApi', () => ({
  aiManagementApi: {
    listAiUsers: vi.fn(),
  },
}));

import { aiManagementApi } from '../services/aiManagementApi';

const MOCK_RESPONSE = {
  data: {
    items: [{ id: '1', username: 'bot1', traits: [] }],
    totalCount: 1,
    hasMore: false,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useAiUsers', () => {
  it('mount fetch fires immediately without 300ms wait', async () => {
    aiManagementApi.listAiUsers.mockResolvedValue(MOCK_RESPONSE);

    renderHook(() => useAiUsers());

    // Advancing just 1ms (well under 300ms) should trigger the call
    // because the mount case uses delay=0.
    act(() => { vi.advanceTimersByTime(1); });

    expect(aiManagementApi.listAiUsers).toHaveBeenCalledTimes(1);
  });

  it('changing search debounces by 300ms', async () => {
    aiManagementApi.listAiUsers.mockResolvedValue(MOCK_RESPONSE);

    const { rerender } = renderHook(
      ({ search }) => useAiUsers({ search }),
      { initialProps: { search: '' } },
    );

    // Initial mount call fires immediately.
    act(() => { vi.advanceTimersByTime(1); });
    expect(aiManagementApi.listAiUsers).toHaveBeenCalledTimes(1);

    // Trigger a filter change.
    rerender({ search: 'bot' });

    // 299ms — still debouncing.
    act(() => { vi.advanceTimersByTime(299); });
    expect(aiManagementApi.listAiUsers).toHaveBeenCalledTimes(1);

    // 1ms more — debounce window elapsed, call fires.
    act(() => { vi.advanceTimersByTime(1); });
    expect(aiManagementApi.listAiUsers).toHaveBeenCalledTimes(2);
  });

  it('refresh() fires immediately without debounce', async () => {
    aiManagementApi.listAiUsers.mockResolvedValue(MOCK_RESPONSE);

    const { result } = renderHook(() => useAiUsers());

    // Initial mount call.
    act(() => { vi.advanceTimersByTime(1); });
    expect(aiManagementApi.listAiUsers).toHaveBeenCalledTimes(1);

    // Trigger refresh — tick bump, no filter change → delay 0.
    act(() => { result.current.refresh(); });
    act(() => { vi.advanceTimersByTime(1); });

    expect(aiManagementApi.listAiUsers).toHaveBeenCalledTimes(2);
  });
});
