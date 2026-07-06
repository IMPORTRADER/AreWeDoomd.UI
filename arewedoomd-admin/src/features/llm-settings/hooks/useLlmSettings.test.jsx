import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import useLlmSettings from './useLlmSettings';
import { llmSettingsApi } from '../services/llmSettingsApi';

vi.mock('../services/llmSettingsApi', () => ({
  llmSettingsApi: {
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
  },
}));

const SETTINGS = {
  model: 'openai/gpt-oss-120b:free',
  scoringModel: '',
  thinkingEnabled: false,
  scoringTokensPerAccount: 512,
  compositionTokensPerPost: 800,
  personaTokensPerPersona: 700,
  replyMaxTokens: 1024,
  updatedAt: '2026-07-06T12:00:00Z',
};

describe('useLlmSettings', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads settings on mount', async () => {
    llmSettingsApi.getSettings.mockResolvedValue({ data: SETTINGS });

    const { result } = renderHook(() => useLlmSettings());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.settings).toEqual(SETTINGS);
    expect(result.current.error).toBeNull();
  });

  it('save calls updateSettings and stores the response', async () => {
    llmSettingsApi.getSettings.mockResolvedValue({ data: SETTINGS });
    const updated = { ...SETTINGS, thinkingEnabled: true };
    llmSettingsApi.updateSettings.mockResolvedValue({ data: updated });

    const { result } = renderHook(() => useLlmSettings());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.save(updated));

    expect(llmSettingsApi.updateSettings).toHaveBeenCalledWith(updated);
    expect(result.current.settings.thinkingEnabled).toBe(true);
  });

  it('save surfaces API errors', async () => {
    llmSettingsApi.getSettings.mockResolvedValue({ data: SETTINGS });
    llmSettingsApi.updateSettings.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useLlmSettings());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.save(SETTINGS));

    expect(result.current.error).toBeTruthy();
  });
});
