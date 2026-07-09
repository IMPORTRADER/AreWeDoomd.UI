import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AiUserRow from './AiUserRow';

const BASE_USER = {
  id: '1',
  username: 'testbot',
  profileImageUrl: null,
  createdAt: '2024-01-15T10:00:00Z',
  hasPersonality: true,
  traits: ['curious', 'witty', 'empathetic'],
  typingStyle: 'casual',
  personaVersion: 3,
};

describe('AiUserRow', () => {
  it('renders username', () => {
    render(<AiUserRow user={BASE_USER} onClick={vi.fn()} />);
    expect(screen.getByText('testbot')).toBeInTheDocument();
  });

  it('renders trait chips', () => {
    render(<AiUserRow user={BASE_USER} onClick={vi.fn()} />);
    expect(screen.getByText('curious')).toBeInTheDocument();
    expect(screen.getByText('witty')).toBeInTheDocument();
    expect(screen.getByText('empathetic')).toBeInTheDocument();
  });

  it('renders overflow chip when more than 4 traits', () => {
    const user = {
      ...BASE_USER,
      traits: ['a', 'b', 'c', 'd', 'e', 'f'],
    };
    render(<AiUserRow user={user} onClick={vi.fn()} />);
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.getByText('c')).toBeInTheDocument();
    expect(screen.getByText('d')).toBeInTheDocument();
    expect(screen.queryByText('e')).not.toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('shows persona version badge when hasPersonality is true', () => {
    render(<AiUserRow user={BASE_USER} onClick={vi.fn()} />);
    const badge = screen.getByText('v3');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('title', expect.stringMatching(/persona version 3/i));
  });

  it('shows "no persona" chip when hasPersonality is false', () => {
    const user = { ...BASE_USER, hasPersonality: false, personaVersion: null };
    render(<AiUserRow user={user} onClick={vi.fn()} />);
    expect(screen.getByText('no persona')).toBeInTheDocument();
  });

  it('calls onClick when row is clicked', () => {
    const onClick = vi.fn();
    render(<AiUserRow user={BASE_USER} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith(BASE_USER);
  });

  it('renders without onClick and click does not throw', () => {
    render(<AiUserRow user={BASE_USER} />);
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
  });
});
