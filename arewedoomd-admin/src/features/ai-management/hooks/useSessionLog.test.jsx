import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useSessionLog from './useSessionLog';

vi.mock('../services/aiManagementApi', () => ({
  aiManagementApi: {
    getSessionLog: vi.fn(),
  },
}));

import { aiManagementApi } from '../services/aiManagementApi';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useSessionLog', () => {
  it('starts in idle state', () => {
    const { result } = renderHook(() => useSessionLog());
    expect(result.current.content).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.fetch).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('fetch(ref) sets content on success', async () => {
    aiManagementApi.getSessionLog.mockResolvedValue({ data: { content: 'prompt text here' } });

    const { result } = renderHook(() => useSessionLog());

    await act(async () => {
      await result.current.fetch('2024-01-01/abc.txt');
    });

    expect(aiManagementApi.getSessionLog).toHaveBeenCalledWith('2024-01-01/abc.txt');
    expect(result.current.content).toBe('prompt text here');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetch(ref) sets error on failure', async () => {
    const err = new Error('Not found');
    aiManagementApi.getSessionLog.mockRejectedValue(err);

    const { result } = renderHook(() => useSessionLog());

    await act(async () => {
      await result.current.fetch('2024-01-01/abc.txt');
    });

    expect(result.current.content).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(err);
  });

  it('reset() clears content and error', async () => {
    aiManagementApi.getSessionLog.mockResolvedValue({ data: { content: 'hello' } });

    const { result } = renderHook(() => useSessionLog());

    await act(async () => {
      await result.current.fetch('2024-01-01/abc.txt');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.content).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
