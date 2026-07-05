import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThresholdControl from './ThresholdControl';

const settings = {
  desireThreshold: 60, maxPostsPerDay: 3, postLengthGuide: 500,
  latePolicy: 0, lateGraceHours: 3, strategy: 0,
};

describe('ThresholdControl', () => {
  it('shows the current threshold value', () => {
    render(<ThresholdControl settings={settings} onSave={() => {}} saving={false} />);
    expect(screen.getByLabelText('İstek eşiği (0-100)')).toHaveValue(60);
  });

  it('calls onSave with updated threshold', () => {
    const onSave = vi.fn();
    render(<ThresholdControl settings={settings} onSave={onSave} saving={false} />);
    fireEvent.change(screen.getByLabelText('İstek eşiği (0-100)'), { target: { value: '40' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ desireThreshold: 40 }));
  });

  it('disables save while saving', () => {
    render(<ThresholdControl settings={settings} onSave={() => {}} saving />);
    expect(screen.getByRole('button', { name: 'Kaydet' })).toBeDisabled();
  });
});
