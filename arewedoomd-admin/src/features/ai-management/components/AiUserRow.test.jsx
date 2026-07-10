import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AiUserRow from './AiUserRow';

// AiUserRow now renders a <tr>; wrap in <table><tbody> so the DOM is valid.
function renderRow(props) {
  return render(
    <table>
      <tbody>
        <AiUserRow {...props} />
      </tbody>
    </table>,
  );
}

const BASE_USER = {
  id: '1',
  username: 'testbot',
  profileImageUrl: null,
  createdAt: '2024-01-15T10:00:00Z',
  hasPersonality: true,
  traits: ['curious', 'witty', 'empathetic'],
  typingStyle: 'casual',
  personaVersion: 3,
  deactivatedAt: null,
};

describe('AiUserRow', () => {
  it('renders username', () => {
    renderRow({ user: BASE_USER, onClick: vi.fn() });
    expect(screen.getByText('testbot')).toBeInTheDocument();
  });

  it('renders trait chips (first 2)', () => {
    renderRow({ user: BASE_USER, onClick: vi.fn() });
    expect(screen.getByText('curious')).toBeInTheDocument();
    expect(screen.getByText('witty')).toBeInTheDocument();
    expect(screen.queryByText('empathetic')).not.toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('renders overflow chip when more than 2 traits', () => {
    const user = { ...BASE_USER, traits: ['a', 'b', 'c', 'd', 'e', 'f'] };
    renderRow({ user, onClick: vi.fn() });
    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('b')).toBeInTheDocument();
    expect(screen.queryByText('c')).not.toBeInTheDocument();
    expect(screen.getByText('+4')).toBeInTheDocument();
  });

  it('shows persona version badge when hasPersonality is true', () => {
    renderRow({ user: BASE_USER, onClick: vi.fn() });
    const badge = screen.getByText('v3');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveAttribute('title', expect.stringMatching(/persona version 3/i));
  });

  it('shows "no persona" chip when hasPersonality is false and not deactivated', () => {
    const user = { ...BASE_USER, hasPersonality: false, personaVersion: null };
    renderRow({ user, onClick: vi.fn() });
    expect(screen.getByText('no persona')).toBeInTheDocument();
  });

  it('shows "deactivated" badge when deactivatedAt is set', () => {
    const user = { ...BASE_USER, deactivatedAt: '2026-06-01T00:00:00Z' };
    renderRow({ user, onClick: vi.fn() });
    expect(screen.getByText('deactivated')).toBeInTheDocument();
  });

  it('applies opacity-45 class on the row when deactivated', () => {
    const user = { ...BASE_USER, deactivatedAt: '2026-06-01T00:00:00Z' };
    renderRow({ user, onClick: vi.fn() });
    const row = screen.getByRole('row');
    expect(row.className).toMatch(/opacity-45/);
  });

  it('username span does NOT have leading-none class', () => {
    renderRow({ user: BASE_USER, onClick: vi.fn() });
    const usernameEl = screen.getByText('testbot');
    expect(usernameEl.className).not.toMatch(/leading-none/);
  });

  it('calls onClick when row is clicked', () => {
    const onClick = vi.fn();
    renderRow({ user: BASE_USER, onClick });
    const row = screen.getByRole('row');
    fireEvent.click(row);
    expect(onClick).toHaveBeenCalledWith(BASE_USER);
  });

  it('checkbox click does NOT propagate to row onClick', () => {
    const onClick = vi.fn();
    const onSelect = vi.fn();
    renderRow({ user: BASE_USER, onClick, onSelect });
    const checkbox = screen.getByRole('checkbox');
    // Click the checkbox; stopPropagation should prevent the row's onClick from firing
    fireEvent.click(checkbox);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('calls onSelect when checkbox is clicked', () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();
    renderRow({ user: BASE_USER, onSelect, onClick });
    const checkbox = screen.getByRole('checkbox');
    // Click fires the native onChange (checked toggled) which calls onSelect
    fireEvent.click(checkbox);
    expect(onSelect).toHaveBeenCalledWith(BASE_USER);
  });

  it('renders without onClick and click does not throw', () => {
    renderRow({ user: BASE_USER });
    const row = screen.getByRole('row');
    expect(() => fireEvent.click(row)).not.toThrow();
  });
});
