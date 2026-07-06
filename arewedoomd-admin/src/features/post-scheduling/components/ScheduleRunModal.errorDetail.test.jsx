import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ScheduleRunModal from './ScheduleRunModal';

const FAILED_RUN = {
  status: 'CompletedWithErrors',
  totalCount: 1,
  items: [{
    aiUserId: 'a1',
    username: 'dogaAi',
    status: 'Failed',
    desireScore: null,
    reasoning: null,
    requestedPostCount: 0,
    errorDetail: 'Scoring failed: Token budget exhausted before any usable text was produced (thinking=141, output=5).',
    posts: [],
  }],
};

function renderModal(run) {
  return render(
    <MemoryRouter>
      <ScheduleRunModal
        run={run}
        starting={false}
        polling={false}
        error={null}
        conflict={null}
        onConfirmOverwrite={vi.fn()}
        onClose={vi.fn()}
      />
    </MemoryRouter>,
  );
}

describe('ScheduleRunModal error detail', () => {
  it('shows errorDetail when the failed row is expanded', () => {
    renderModal(FAILED_RUN);

    fireEvent.click(screen.getByRole('button', { name: /Hatayı gör/i }));

    expect(screen.getByText(/Token budget exhausted/i)).toBeInTheDocument();
  });

  it('shows the LLM settings hint for budget errors', () => {
    renderModal(FAILED_RUN);

    fireEvent.click(screen.getByRole('button', { name: /Hatayı gör/i }));

    expect(screen.getByRole('link', { name: /LLM Ayarları/i })).toHaveAttribute('href', '/llm-settings');
  });

  it('does not show the hint for non-budget errors', () => {
    const run = {
      ...FAILED_RUN,
      items: [{ ...FAILED_RUN.items[0], errorDetail: 'Scoring failed: Rate limit exceeded.' }],
    };
    renderModal(run);

    fireEvent.click(screen.getByRole('button', { name: /Hatayı gör/i }));

    expect(screen.queryByRole('link', { name: /LLM Ayarları/i })).not.toBeInTheDocument();
  });
});
