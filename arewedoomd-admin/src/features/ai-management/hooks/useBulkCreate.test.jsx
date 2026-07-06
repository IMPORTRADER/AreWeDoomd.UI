import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useBulkCreate from './useBulkCreate';

vi.mock('../services/aiManagementApi', () => ({
  aiManagementApi: {
    startBulkCreate: vi.fn(),
    getBulkJob: vi.fn(),
  },
}));

import { aiManagementApi } from '../services/aiManagementApi';

const JOB_ID = 'job-abc-123';
const queued    = { jobId: JOB_ID, status: 'queued',    requested: 5, generated: 0, created: 0, failed: [], createdUsers: [], startedAt: null, finishedAt: null, rebuilt: false };
const creating  = { jobId: JOB_ID, status: 'creating',  requested: 5, generated: 5, created: 2, failed: [], createdUsers: ['u1', 'u2'], startedAt: 'now', finishedAt: null, rebuilt: false };
const completed = { jobId: JOB_ID, status: 'completed', requested: 5, generated: 5, created: 5, failed: [], createdUsers: ['u1', 'u2', 'u3', 'u4', 'u5'], startedAt: 'now', finishedAt: 'now', rebuilt: false };

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

describe('useBulkCreate', () => {
  it('initialises with idle state', () => {
    const { result } = renderHook(() => useBulkCreate());
    expect(result.current.starting).toBe(false);
    expect(result.current.polling).toBe(false);
    expect(result.current.job).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('seeds optimistic job state immediately after 202, before first poll tick', async () => {
    aiManagementApi.startBulkCreate.mockResolvedValue({ data: { jobId: JOB_ID } });
    aiManagementApi.getBulkJob.mockResolvedValue({ data: queued });

    const { result } = renderHook(() => useBulkCreate());

    await act(async () => {
      result.current.start({ count: 5 });
      await Promise.resolve();
    });

    // job is set immediately — no poll tick needed
    expect(result.current.job).not.toBeNull();
    expect(result.current.job.jobId).toBe(JOB_ID);
    expect(result.current.job.status).toBe('queued');
    expect(result.current.job.requested).toBe(5);
    expect(result.current.job.generated).toBe(0);
    expect(result.current.job.created).toBe(0);
    expect(result.current.job.failed).toEqual([]);
    expect(result.current.job.createdUsers).toEqual([]);
    // getBulkJob has not been called yet (no timer advance)
    expect(aiManagementApi.getBulkJob).not.toHaveBeenCalled();
  });

  it('start → POSTs then polls every 1500 ms until terminal state stops polling', async () => {
    aiManagementApi.startBulkCreate.mockResolvedValue({ data: { jobId: JOB_ID } });
    aiManagementApi.getBulkJob
      .mockResolvedValueOnce({ data: queued })
      .mockResolvedValueOnce({ data: creating })
      .mockResolvedValueOnce({ data: completed });

    const { result } = renderHook(() => useBulkCreate());

    // Trigger start
    await act(async () => {
      result.current.start({ count: 5 });
      await Promise.resolve();
    });

    expect(aiManagementApi.startBulkCreate).toHaveBeenCalledWith({ count: 5 });
    expect(result.current.starting).toBe(false);
    expect(result.current.polling).toBe(true);

    // 1st tick → queued
    await act(async () => {
      vi.advanceTimersByTime(1500);
      await Promise.resolve();
    });
    expect(aiManagementApi.getBulkJob).toHaveBeenCalledTimes(1);
    expect(result.current.job.status).toBe('queued');
    expect(result.current.polling).toBe(true);

    // 2nd tick → creating
    await act(async () => {
      vi.advanceTimersByTime(1500);
      await Promise.resolve();
    });
    expect(result.current.job.status).toBe('creating');
    expect(result.current.polling).toBe(true);

    // 3rd tick → completed (terminal) → polling stops
    await act(async () => {
      vi.advanceTimersByTime(1500);
      await Promise.resolve();
    });
    expect(result.current.job.status).toBe('completed');
    expect(result.current.polling).toBe(false);

    // Extra tick — no more calls
    await act(async () => {
      vi.advanceTimersByTime(1500);
      await Promise.resolve();
    });
    expect(aiManagementApi.getBulkJob).toHaveBeenCalledTimes(3);
  });

  it('visibility hidden → poll ticks are skipped', async () => {
    aiManagementApi.startBulkCreate.mockResolvedValue({ data: { jobId: JOB_ID } });
    aiManagementApi.getBulkJob.mockResolvedValue({ data: queued });

    const { result } = renderHook(() => useBulkCreate());

    await act(async () => {
      result.current.start({ count: 5 });
      await Promise.resolve();
    });

    // Hide document
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });

    // Advance 2 full poll intervals — both skipped
    await act(async () => {
      vi.advanceTimersByTime(3000);
      await Promise.resolve();
    });

    expect(aiManagementApi.getBulkJob).toHaveBeenCalledTimes(0);
    expect(result.current.polling).toBe(true); // still polling (not terminated)
  });

  it('visibility visible again → resumes polling after being hidden', async () => {
    aiManagementApi.startBulkCreate.mockResolvedValue({ data: { jobId: JOB_ID } });
    aiManagementApi.getBulkJob
      .mockResolvedValueOnce({ data: queued })
      .mockResolvedValueOnce({ data: completed });

    const { result } = renderHook(() => useBulkCreate());

    await act(async () => {
      result.current.start({ count: 5 });
      await Promise.resolve();
    });

    // Hide and skip first tick
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'hidden',
    });
    await act(async () => {
      vi.advanceTimersByTime(1500);
      await Promise.resolve();
    });
    expect(aiManagementApi.getBulkJob).toHaveBeenCalledTimes(0);

    // Restore visibility → next tick fires
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
    await act(async () => {
      vi.advanceTimersByTime(1500);
      await Promise.resolve();
    });
    expect(aiManagementApi.getBulkJob).toHaveBeenCalledTimes(1);
    expect(result.current.job.status).toBe('queued');
  });

  it('POST failure sets error and does not start polling', async () => {
    const err = { response: { status: 400, data: { detail: 'Persona generator is not configured.' } } };
    aiManagementApi.startBulkCreate.mockRejectedValue(err);

    const { result } = renderHook(() => useBulkCreate());

    await act(async () => {
      result.current.start({ count: 5 });
      await Promise.resolve();
    });

    expect(result.current.error).toBe(err);
    expect(result.current.polling).toBe(false);
    expect(aiManagementApi.getBulkJob).not.toHaveBeenCalled();
  });

  it('reset clears state and stops polling', async () => {
    aiManagementApi.startBulkCreate.mockResolvedValue({ data: { jobId: JOB_ID } });
    aiManagementApi.getBulkJob.mockResolvedValue({ data: queued });

    const { result } = renderHook(() => useBulkCreate());

    await act(async () => {
      result.current.start({ count: 5 });
      await Promise.resolve();
    });
    expect(result.current.polling).toBe(true);

    act(() => { result.current.reset(); });

    expect(result.current.polling).toBe(false);
    expect(result.current.job).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.starting).toBe(false);

    // No further polls after reset
    await act(async () => {
      vi.advanceTimersByTime(3000);
      await Promise.resolve();
    });
    expect(aiManagementApi.getBulkJob).toHaveBeenCalledTimes(0);
  });

  it('unmount stops polling and does not cause state updates', async () => {
    aiManagementApi.startBulkCreate.mockResolvedValue({ data: { jobId: JOB_ID } });
    aiManagementApi.getBulkJob.mockResolvedValue({ data: queued });

    const { result, unmount } = renderHook(() => useBulkCreate());

    await act(async () => {
      result.current.start({ count: 5 });
      await Promise.resolve();
    });
    expect(result.current.polling).toBe(true);

    unmount();

    // Advance timers — interval should be cleared, no errors thrown
    await act(async () => {
      vi.advanceTimersByTime(3000);
      await Promise.resolve();
    });
    // No assertion needed beyond no thrown errors; getBulkJob count = 0 confirms no post-unmount polls
    expect(aiManagementApi.getBulkJob).toHaveBeenCalledTimes(0);
  });
});
