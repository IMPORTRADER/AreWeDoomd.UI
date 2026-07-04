import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useAiFleetStats from './useAiFleetStats';

vi.mock('../services/aiManagementApi', () => ({
  aiManagementApi: {
    getStats: vi.fn(),
  },
}));

import { aiManagementApi } from '../services/aiManagementApi';

const MOCK_STATS = {
  totalAiUsers: 42,
  withPersonality: 30,
  decisionsToday: 120,
  executedToday: 100,
  droppedToday: 15,
  failedToday: 5,
  actionsLastHour: 8,
  logAvailable: true,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useAiFleetStats', () => {
  it('starts in loading state', () => {
    aiManagementApi.getStats.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAiFleetStats());
    expect(result.current.loading).toBe(true);
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('transitions from loading to data on success', async () => {
    aiManagementApi.getStats.mockResolvedValue({ data: MOCK_STATS });
    const { result } = renderHook(() => useAiFleetStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats).toEqual(MOCK_STATS);
    expect(result.current.error).toBeNull();
  });

  it('transitions from loading to error on failure', async () => {
    const err = new Error('Network error');
    aiManagementApi.getStats.mockRejectedValue(err);
    const { result } = renderHook(() => useAiFleetStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(err);
    expect(result.current.stats).toBeNull();
  });

  it('re-fetches when refresh() is called', async () => {
    aiManagementApi.getStats.mockResolvedValue({ data: MOCK_STATS });
    const { result } = renderHook(() => useAiFleetStats());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(aiManagementApi.getStats).toHaveBeenCalledTimes(1);

    result.current.refresh();

    await waitFor(() => expect(aiManagementApi.getStats).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.stats).toEqual(MOCK_STATS);
  });
});
