import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AiUserTable from './AiUserTable';

// ── Mock hooks ────────────────────────────────────────────────────────────────
vi.mock('../hooks/useAiUsers', () => ({ default: vi.fn() }));
vi.mock('../hooks/useAiFleetStats', () => ({ default: vi.fn() }));
vi.mock('../hooks/useBulkDeactivate', () => ({ default: vi.fn() }));

import useAiUsers from '../hooks/useAiUsers';
import useAiFleetStats from '../hooks/useAiFleetStats';
import useBulkDeactivate from '../hooks/useBulkDeactivate';

// ── Default mock factories ────────────────────────────────────────────────────
const mockRefresh       = vi.fn();
const mockStatsRefresh  = vi.fn();
const mockBulkDeactivate = vi.fn();

function makeUsers(count = 3) {
  return Array.from({ length: count }, (_, i) => ({
    id:             `u${i + 1}`,
    username:       `dogaAi${i + 1}`,
    profileImageUrl: null,
    createdAt:      '2026-06-01T10:00:00Z',
    hasPersonality: true,
    traits:         ['sarcastic', 'optimist'],
    personaVersion: 1,
    deactivatedAt:  null,
  }));
}

function idleUsers(overrides = {}) {
  return {
    users:       makeUsers(),
    totalCount:  3,
    hasMore:     false,
    loading:     false,
    loadingMore: false,
    error:       null,
    loadMore:    vi.fn(),
    refresh:     mockRefresh,
    ...overrides,
  };
}

function idleStats(overrides = {}) {
  return {
    stats: {
      totalAiUsers:      10,
      withPersonality:   6,
      deactivatedAiUsers: 1,
    },
    loading: false,
    error:   null,
    refresh: mockStatsRefresh,
    ...overrides,
  };
}

function idleBulk(overrides = {}) {
  return {
    deactivate: mockBulkDeactivate,
    busy:       false,
    error:      null,
    reset:      vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  useAiUsers.mockReturnValue(idleUsers());
  useAiFleetStats.mockReturnValue(idleStats());
  useBulkDeactivate.mockReturnValue(idleBulk());
});

// ─────────────────────────────────────────────────────────────────────────────

describe('AiUserTable', () => {
  it('renders status chips with fleet counts', () => {
    render(<AiUserTable onRowClick={vi.fn()} />);

    // "all" chip: totalAiUsers = 10
    expect(screen.getByText('10')).toBeInTheDocument();

    // persona chip: withPersonality = 6
    expect(screen.getByText('6')).toBeInTheDocument();

    // noPersona chip: totalAiUsers - deactivatedAiUsers - withPersonality = 10 - 1 - 6 = 3
    expect(screen.getByText('3')).toBeInTheDocument();

    // deactivated chip: deactivatedAiUsers = 1
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('applies status filter when a chip is clicked', () => {
    render(<AiUserTable onRowClick={vi.fn()} />);

    // Find the deactivated chip by its label text and click it
    const deactivatedBtn = screen.getByRole('button', { name: /deaktive/i });
    fireEvent.click(deactivatedBtn);

    // useAiUsers should have been called with status: 'deactivated'
    // After click the component re-renders; check most recent call
    const calls = useAiUsers.mock.calls;
    const lastCall = calls[calls.length - 1][0];
    expect(lastCall.status).toBe('deactivated');
  });

  it('renders usernames without leading-none clipping class', () => {
    render(<AiUserTable onRowClick={vi.fn()} />);

    // Get all elements with the username text (dogaAi1, dogaAi2, dogaAi3)
    const usernameEl = screen.getByText('dogaAi1');
    expect(usernameEl.className).not.toMatch(/leading-none/);
  });

  it('shows bulk bar when a row is selected and calls bulk API on confirm', async () => {
    mockBulkDeactivate.mockResolvedValue(undefined);

    render(<AiUserTable onRowClick={vi.fn()} />);

    // Find the first row checkbox and click it
    const checkboxes = screen.getAllByRole('checkbox');
    // checkboxes[0] is the "select all" header checkbox; checkboxes[1] is the first row
    const firstRowCheckbox = checkboxes[1];
    fireEvent.click(firstRowCheckbox);

    // Bulk bar should appear with count
    expect(await screen.findByText(/1 seçili/)).toBeInTheDocument();

    // Click Deactivate button
    const deactivateBtn = screen.getByRole('button', { name: /deactivate/i });
    fireEvent.click(deactivateBtn);

    // Confirm modal should appear (body text inside modal)
    expect(await screen.findByText(/deaktive edilecek/i)).toBeInTheDocument();

    // Click confirm button in the modal footer (the danger Button with text "Deactivate")
    // There are multiple "Deactivate" buttons; get all and pick the danger-styled one
    const confirmBtns = screen.getAllByRole('button', { name: /^Deactivate$/i });
    // The modal's confirm button has variant="danger" → bg-[var(--color-danger)]
    const modalConfirmBtn = confirmBtns.find((btn) =>
      btn.className.includes('bg-[var(--color-danger)]'),
    );
    fireEvent.click(modalConfirmBtn);

    // bulkDeactivate should have been called
    await waitFor(() => {
      expect(mockBulkDeactivate).toHaveBeenCalledWith(
        expect.objectContaining({ userIds: ['u1'], deactivate: true }),
      );
    });
  });
});
