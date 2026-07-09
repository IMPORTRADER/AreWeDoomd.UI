import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useRateLimitAlert from './useRateLimitAlert';

describe('useRateLimitAlert', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns true when a 429 log is within the 5 minute window', () => {
    const items = [{ ts: new Date(Date.now() - 60_000).toISOString(), statusCode: 429 }];
    const { result } = renderHook(() => useRateLimitAlert(items));
    expect(result.current).toBe(true);
  });

  it('returns false when the only 429 is older than 5 minutes', () => {
    const items = [{ ts: new Date(Date.now() - 6 * 60_000).toISOString(), statusCode: 429 }];
    const { result } = renderHook(() => useRateLimitAlert(items));
    expect(result.current).toBe(false);
  });

  it('returns false when there is no 429', () => {
    const items = [{ ts: new Date().toISOString(), statusCode: 503 }];
    const { result } = renderHook(() => useRateLimitAlert(items));
    expect(result.current).toBe(false);
  });

  it('expires the alert as time passes', () => {
    const items = [{ ts: new Date(Date.now() - 4.8 * 60_000).toISOString(), statusCode: 429 }];
    const { result } = renderHook(() => useRateLimitAlert(items));
    expect(result.current).toBe(true);
    act(() => { vi.advanceTimersByTime(60_000); });
    expect(result.current).toBe(false);
  });
});
