import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LogRow from './LogRow';

const baseLog = {
  ts: '2026-07-06T10:00:00Z',
  level: 'error',
  source: 'llm_provider',
  message: 'Gemini call failed on attempt 1 after 1200 ms.',
  aiUserId: 'user-1',
  detail: 'HTTP 503 from provider',
};

describe('LogRow', () => {
  it('renders level, source and message', () => {
    render(<LogRow log={baseLog} users={[{ id: 'user-1', username: 'botty' }]} />);
    expect(screen.getByText('error')).toBeInTheDocument();
    expect(screen.getByText('llm_provider')).toBeInTheDocument();
    expect(screen.getByText(/Gemini call failed/)).toBeInTheDocument();
    expect(screen.getByText('@botty')).toBeInTheDocument();
  });

  it('expands to show detail on click', () => {
    render(<LogRow log={baseLog} users={[]} />);
    expect(screen.queryByText('HTTP 503 from provider')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(/Gemini call failed/));
    expect(screen.getByText('HTTP 503 from provider')).toBeInTheDocument();
  });

  it('shows a rate limit badge when statusCode is 429', () => {
    render(<LogRow log={{ ...baseLog, statusCode: 429 }} />);
    expect(screen.getByText('429 Rate limited')).toBeInTheDocument();
  });

  it('does not show a rate limit badge for other status codes', () => {
    render(<LogRow log={{ ...baseLog, statusCode: 503 }} />);
    expect(screen.queryByText('429 Rate limited')).not.toBeInTheDocument();
  });
});
