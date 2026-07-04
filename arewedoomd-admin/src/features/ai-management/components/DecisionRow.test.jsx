import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DecisionRow from './DecisionRow';

vi.mock('../hooks/useSessionLog', () => ({
  default: vi.fn(),
}));

import useSessionLog from '../hooks/useSessionLog';

const BASE_DECISION = {
  reasoning: 'decided to post',
  outcome: 'executed',
  action: 'CreatePost',
  aiUserId: 'abc12345-0000-0000-0000-000000000000',
  ts: new Date().toISOString(),
};

function mockHook(overrides = {}) {
  useSessionLog.mockReturnValue({
    content: null,
    loading: false,
    error: null,
    fetch: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  });
}

beforeEach(() => {
  mockHook();
});

describe('DecisionRow – prompt drill-down', () => {
  it('does not render prompt toggle when sessionLogRef is absent', () => {
    render(<DecisionRow decision={BASE_DECISION} />);
    // expand the row
    fireEvent.click(screen.getByText('decided to post'));
    expect(screen.queryByText('Prompt/yanıtı gör')).not.toBeInTheDocument();
  });

  it('renders prompt toggle button when sessionLogRef is present', () => {
    const decision = { ...BASE_DECISION, sessionLogRef: '2024-01-01/test.txt' };
    render(<DecisionRow decision={decision} />);
    fireEvent.click(screen.getByText('decided to post'));
    expect(screen.getByText('Prompt/yanıtı gör')).toBeInTheDocument();
  });

  it('calls fetch with the ref when toggle is clicked the first time', () => {
    const mockFetch = vi.fn();
    mockHook({ fetch: mockFetch });
    const decision = { ...BASE_DECISION, sessionLogRef: '2024-01-01/test.txt' };
    render(<DecisionRow decision={decision} />);
    fireEvent.click(screen.getByText('decided to post'));
    fireEvent.click(screen.getByText('Prompt/yanıtı gör'));
    expect(mockFetch).toHaveBeenCalledWith('2024-01-01/test.txt');
  });

  it('renders content inside pre when hook returns content', () => {
    mockHook({ content: 'Here is the full prompt content' });
    const decision = { ...BASE_DECISION, sessionLogRef: '2024-01-01/test.txt' };
    render(<DecisionRow decision={decision} />);
    fireEvent.click(screen.getByText('decided to post'));
    fireEvent.click(screen.getByText('Prompt/yanıtı gör'));
    expect(screen.getByText('Here is the full prompt content')).toBeInTheDocument();
    const pre = screen.getByText('Here is the full prompt content').closest('pre');
    expect(pre).not.toBeNull();
  });

  it('shows loading indicator while hook loading is true', () => {
    mockHook({ loading: true });
    const decision = { ...BASE_DECISION, sessionLogRef: '2024-01-01/test.txt' };
    render(<DecisionRow decision={decision} />);
    fireEvent.click(screen.getByText('decided to post'));
    fireEvent.click(screen.getByText('Prompt/yanıtı gör'));
    expect(screen.getByTestId('session-log-loading')).toBeInTheDocument();
  });

  it('shows not-found message when hook returns an error', () => {
    mockHook({ error: new Error('not found') });
    const decision = { ...BASE_DECISION, sessionLogRef: '2024-01-01/test.txt' };
    render(<DecisionRow decision={decision} />);
    fireEvent.click(screen.getByText('decided to post'));
    fireEvent.click(screen.getByText('Prompt/yanıtı gör'));
    expect(screen.getByText('Oturum dosyası bulunamadı.')).toBeInTheDocument();
  });
});
