import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

vi.mock('../services/aiManagementApi', () => ({
  aiManagementApi: { getPersonaCatalog: vi.fn() },
}));

import { aiManagementApi } from '../services/aiManagementApi';
import usePersonaCatalog, { flattenTraits, __clearCatalogCache } from './usePersonaCatalog';

const CATALOG = {
  archetypes: [
    {
      key: 'doomer', name: 'Doomer', description: 'desc',
      usernamePatterns: ['doom_{noun}{nn}'],
      traits: ['pessimistic', 'sarcastic', 'dry'],
      typingStyles: ['style one'], summaries: ['summary one'],
    },
  ],
  traitCategories: [
    { name: 'Tone', traits: ['dry', 'warm'] },
    { name: 'Outlook', traits: ['pessimistic', 'dry'] },
  ],
  typingStyleSuggestions: ['short sentences'],
  usernameWordPools: { noun: ['ember'], adjective: ['pale'] },
};

beforeEach(() => {
  vi.clearAllMocks();
  __clearCatalogCache();
});

describe('usePersonaCatalog', () => {
  it('fetches and exposes the catalog', async () => {
    aiManagementApi.getPersonaCatalog.mockResolvedValue({ data: CATALOG });

    const { result } = renderHook(() => usePersonaCatalog());
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.catalog).toEqual(CATALOG);
    expect(result.current.error).toBeNull();
  });

  it('serves the module cache on second mount without refetching', async () => {
    aiManagementApi.getPersonaCatalog.mockResolvedValue({ data: CATALOG });

    const first = renderHook(() => usePersonaCatalog());
    await waitFor(() => expect(first.result.current.loading).toBe(false));

    const second = renderHook(() => usePersonaCatalog());
    await waitFor(() => expect(second.result.current.catalog).toEqual(CATALOG));
    expect(aiManagementApi.getPersonaCatalog).toHaveBeenCalledTimes(1);
  });

  it('captures the error and retry() refetches', async () => {
    aiManagementApi.getPersonaCatalog.mockRejectedValueOnce(new Error('down'));
    aiManagementApi.getPersonaCatalog.mockResolvedValueOnce({ data: CATALOG });

    const { result } = renderHook(() => usePersonaCatalog());
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.catalog).toBeNull();

    await act(async () => { result.current.retry(); });
    await waitFor(() => expect(result.current.catalog).toEqual(CATALOG));
    expect(result.current.error).toBeNull();
  });
});

describe('flattenTraits', () => {
  it('returns unique traits across categories preserving order', () => {
    expect(flattenTraits(CATALOG)).toEqual(['dry', 'warm', 'pessimistic']);
  });

  it('returns empty array for null catalog', () => {
    expect(flattenTraits(null)).toEqual([]);
  });
});
