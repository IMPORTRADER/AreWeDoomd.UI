import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BulkCreateModal from './BulkCreateModal';

vi.mock('../hooks/useBulkCreate', () => ({
  default: vi.fn(),
}));

import useBulkCreate from '../hooks/useBulkCreate';

const mockStart = vi.fn();
const mockReset = vi.fn();

function idle(overrides = {}) {
  return {
    start: mockStart,
    job: null,
    starting: false,
    polling: false,
    error: null,
    reset: mockReset,
    ...overrides,
  };
}

function runningJob(overrides = {}) {
  return idle({
    polling: true,
    job: {
      jobId: 'job-1',
      status: 'creating',
      requested: 10,
      generated: 10,
      created: 3,
      failed: [{ username: 'bad1', reason: 'duplicate username' }],
      createdUsers: ['user1', 'user2', 'user3'],
      startedAt: '2026-07-04T10:00:00Z',
      finishedAt: null,
      rebuilt: false,
    },
    ...overrides,
  });
}

function terminalJob(overrides = {}) {
  return idle({
    polling: false,
    job: {
      jobId: 'job-1',
      status: 'completed',
      requested: 5,
      generated: 5,
      created: 3,
      failed: [
        { username: 'bad1', reason: 'duplicate username' },
        { username: 'bad2', reason: 'invalid traits' },
      ],
      createdUsers: ['user1', 'user2', 'user3'],
      startedAt: '2026-07-04T10:00:00Z',
      finishedAt: '2026-07-04T10:01:00Z',
      rebuilt: false,
    },
    ...overrides,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  useBulkCreate.mockReturnValue(idle());
});

describe('BulkCreateModal', () => {
  // ── Phase 1: idle form ───────────────────────────────────────────────────

  it('renders count input (default 10) and Start button in idle state', () => {
    render(<BulkCreateModal onClose={vi.fn()} onJobTerminal={vi.fn()} />);
    const input = screen.getByRole('spinbutton');
    expect(input).toBeInTheDocument();
    expect(input.value).toBe('10');
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  it('Start button calls start with the current count', () => {
    render(<BulkCreateModal onClose={vi.fn()} onJobTerminal={vi.fn()} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '20' } });
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    expect(mockStart).toHaveBeenCalledWith({ count: 20 });
  });

  it('Start button is disabled when count is out of range (0)', () => {
    render(<BulkCreateModal onClose={vi.fn()} onJobTerminal={vi.fn()} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } });
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
  });

  it('Start button is disabled when count exceeds 50', () => {
    render(<BulkCreateModal onClose={vi.fn()} onJobTerminal={vi.fn()} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '51' } });
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
  });

  it('surfaces unconfigured API error from ProblemDetails detail', () => {
    useBulkCreate.mockReturnValue(idle({
      error: {
        response: {
          status: 400,
          data: { detail: 'Persona generator is not configured. Please set an LLM API key.' },
        },
      },
    }));
    render(<BulkCreateModal onClose={vi.fn()} onJobTerminal={vi.fn()} />);
    expect(screen.getByText(/persona generator.*not configured|not configured.*api key|api key/i)).toBeInTheDocument();
  });

  it('close/cancel button is disabled while starting', () => {
    useBulkCreate.mockReturnValue(idle({ starting: true }));
    render(<BulkCreateModal onClose={vi.fn()} onJobTerminal={vi.fn()} />);
    const closeBtn = screen.getByRole('button', { name: /cancel|close/i });
    expect(closeBtn).toBeDisabled();
  });

  // ── Phase 2: running progress ────────────────────────────────────────────

  it('shows progress counts (created+failed / requested) when job is running', () => {
    useBulkCreate.mockReturnValue(runningJob());
    render(<BulkCreateModal onClose={vi.fn()} onJobTerminal={vi.fn()} />);
    // 3 created + 1 failed = 4 processed out of 10
    expect(screen.getByText(/4.*10/)).toBeInTheDocument();
  });

  it('renders each createdUsers username when polling', () => {
    useBulkCreate.mockReturnValue(runningJob());
    render(<BulkCreateModal onClose={vi.fn()} onJobTerminal={vi.fn()} />);
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('user2')).toBeInTheDocument();
    expect(screen.getByText('user3')).toBeInTheDocument();
  });

  it('renders failure reason when there are failures', () => {
    useBulkCreate.mockReturnValue(runningJob());
    render(<BulkCreateModal onClose={vi.fn()} onJobTerminal={vi.fn()} />);
    expect(screen.getByText(/duplicate username/i)).toBeInTheDocument();
  });

  it('close button is NOT disabled while polling (job continues server-side)', () => {
    useBulkCreate.mockReturnValue(runningJob());
    render(<BulkCreateModal onClose={vi.fn()} onJobTerminal={vi.fn()} />);
    const closeBtn = screen.getByRole('button', { name: /close/i });
    expect(closeBtn).not.toBeDisabled();
  });

  it('shows background-continues notice when closing mid-job', () => {
    useBulkCreate.mockReturnValue(runningJob());
    render(<BulkCreateModal onClose={vi.fn()} onJobTerminal={vi.fn()} />);
    expect(screen.getByText(/arka planda|background/i)).toBeInTheDocument();
  });

  // ── Terminal state ───────────────────────────────────────────────────────

  it('shows Retry failed (N) button with correct failure count', () => {
    useBulkCreate.mockReturnValue(terminalJob());
    render(<BulkCreateModal onClose={vi.fn()} onJobTerminal={vi.fn()} />);
    expect(screen.getByRole('button', { name: /retry.*2/i })).toBeInTheDocument();
  });

  it('retry failed starts a new job with count = failed.length', () => {
    useBulkCreate.mockReturnValue(terminalJob());
    render(<BulkCreateModal onClose={vi.fn()} onJobTerminal={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /retry.*2/i }));
    expect(mockStart).toHaveBeenCalledWith({ count: 2 });
  });

  it('Retry failed button is absent when there are no failures', () => {
    useBulkCreate.mockReturnValue(terminalJob({
      job: {
        jobId: 'job-2',
        status: 'completed',
        requested: 3,
        generated: 3,
        created: 3,
        failed: [],
        createdUsers: ['u1', 'u2', 'u3'],
        startedAt: '2026-07-04T10:00:00Z',
        finishedAt: '2026-07-04T10:01:00Z',
        rebuilt: false,
      },
    }));
    render(<BulkCreateModal onClose={vi.fn()} onJobTerminal={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /retry/i })).toBeNull();
  });

  it('Close button is enabled in terminal state', () => {
    useBulkCreate.mockReturnValue(terminalJob());
    render(<BulkCreateModal onClose={vi.fn()} onJobTerminal={vi.fn()} />);
    const closeBtn = screen.getByRole('button', { name: /close/i });
    expect(closeBtn).not.toBeDisabled();
  });

  it('Close button calls onClose', () => {
    useBulkCreate.mockReturnValue(terminalJob());
    const onClose = vi.fn();
    render(<BulkCreateModal onClose={onClose} onJobTerminal={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  // ── Poll error visibility ────────────────────────────────────────────────

  it('shows error banner when poll fails during Phase 2 (job creating + error set)', () => {
    useBulkCreate.mockReturnValue(runningJob({
      error: {
        response: {
          status: 500,
          data: { detail: 'Server error during poll' },
        },
      },
    }));
    render(<BulkCreateModal onClose={vi.fn()} onJobTerminal={vi.fn()} />);
    // Should show the error banner
    expect(screen.getByText(/server error during poll/i)).toBeInTheDocument();
    // Should also show the muted explanatory line
    expect(screen.getByText(/güncelleme alınamadı.*iş sunucuda|update unavailable.*job/i)).toBeInTheDocument();
  });

  // ── Retry ordering ───────────────────────────────────────────────────────

  it('retry failed calls reset before start (ordering guard)', () => {
    useBulkCreate.mockReturnValue(terminalJob());
    render(<BulkCreateModal onClose={vi.fn()} onJobTerminal={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /retry.*2/i }));
    // Assert reset was called before start
    const resetCallIdx = mockReset.mock.invocationCallOrder?.[0];
    const startCallIdx = mockStart.mock.invocationCallOrder?.[0];
    expect(resetCallIdx).toBeLessThan(startCallIdx);
  });
});
