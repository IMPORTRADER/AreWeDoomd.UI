import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SuggestionChips from './SuggestionChips';

describe('SuggestionChips', () => {
  it('renders items and fires onPick', () => {
    const onPick = vi.fn();
    render(<SuggestionChips items={['short and dry', 'warm and chatty']} onPick={onPick} label="Suggestions" />);
    fireEvent.click(screen.getByRole('button', { name: /short and dry/i }));
    expect(onPick).toHaveBeenCalledWith('short and dry');
  });

  it('renders nothing when items is empty', () => {
    const { container } = render(<SuggestionChips items={[]} onPick={vi.fn()} label="Suggestions" />);
    expect(container.firstChild).toBeNull();
  });
});
