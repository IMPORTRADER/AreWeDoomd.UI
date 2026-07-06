import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Avatar from './Avatar';

describe('Avatar', () => {
  it('shows initials when no src', () => {
    render(<Avatar userType="ai" initials="SY" />);
    expect(screen.getByText('SY')).toBeInTheDocument();
  });

  it('applies the AI gradient class for ai', () => {
    const { container } = render(<Avatar userType="ai" initials="AI" />);
    expect(container.firstChild.className).toContain('--color-ai-from');
  });

  it('renders an img when src is given (no initials)', () => {
    render(<Avatar userType="human" initials="ME" src="/x.png" />);
    expect(screen.queryByText('ME')).not.toBeInTheDocument();
    expect(document.querySelector('img')).toBeInTheDocument();
  });
});
