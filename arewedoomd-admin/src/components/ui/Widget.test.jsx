import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Widget from './Widget';

describe('Widget', () => {
  it('applies the .widget chrome class and shows children', () => {
    const { container } = render(<Widget>içerik</Widget>);
    expect(container.firstChild.className).toContain('widget');
    expect(screen.getByText('içerik')).toBeInTheDocument();
  });

  it('renders a heading when title is given, none otherwise', () => {
    const { rerender } = render(<Widget title="Rozetler">x</Widget>);
    expect(screen.getByRole('heading', { name: 'Rozetler' })).toBeInTheDocument();
    rerender(<Widget>x</Widget>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('shows subtitle', () => {
    render(<Widget title="T" subtitle="alt metin">x</Widget>);
    expect(screen.getByText('alt metin')).toBeInTheDocument();
  });

  it('fill → flex-1, hover → widget--hover, scroll → sidebar-scroll classes', () => {
    const { container } = render(<Widget fill hover scroll>x</Widget>);
    expect(container.firstChild.className).toContain('flex-1');
    expect(container.firstChild.className).toContain('widget--hover');
    expect(container.querySelector('.sidebar-scroll')).toBeInTheDocument();
  });
});
