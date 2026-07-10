import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ArchetypePanel from './ArchetypePanel';

const ARCHETYPES = [
  { key: 'doomer', name: 'Doomer', description: 'End is near.' },
  { key: 'troll', name: 'Troll', description: 'Chaos agent.' },
];

describe('ArchetypePanel', () => {
  it('renders Start blank plus one card per archetype', () => {
    render(<ArchetypePanel archetypes={ARCHETYPES} selectedKey={null} onSelect={vi.fn()} loading={false} error={null} onRetry={vi.fn()} />);
    expect(screen.getByRole('button', { name: /start blank/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /doomer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /troll/i })).toBeInTheDocument();
  });

  it('fires onSelect with the archetype on card click and null on Start blank', () => {
    const onSelect = vi.fn();
    render(<ArchetypePanel archetypes={ARCHETYPES} selectedKey={null} onSelect={onSelect} loading={false} error={null} onRetry={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /doomer/i }));
    expect(onSelect).toHaveBeenCalledWith(ARCHETYPES[0]);

    fireEvent.click(screen.getByRole('button', { name: /start blank/i }));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('marks the selected card with aria-pressed', () => {
    render(<ArchetypePanel archetypes={ARCHETYPES} selectedKey="troll" onSelect={vi.fn()} loading={false} error={null} onRetry={vi.fn()} />);
    expect(screen.getByRole('button', { name: /troll/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /doomer/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows error with retry when catalog failed', () => {
    const onRetry = vi.fn();
    render(<ArchetypePanel archetypes={null} selectedKey={null} onSelect={vi.fn()} loading={false} error={new Error('down')} onRetry={onRetry} />);
    expect(screen.getByText(/couldn.t load archetypes/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalled();
  });
});
