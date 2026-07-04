import { describe, it, expect } from 'vitest';
import { easeOutCubic } from './useCountUp';

describe('easeOutCubic', () => {
  it('returns 0 for input 0', () => {
    expect(easeOutCubic(0)).toBe(0);
  });

  it('returns 1 for input 1', () => {
    expect(easeOutCubic(1)).toBe(1);
  });

  it('returns 0.875 for input 0.5 (1 - 0.5^3)', () => {
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875, 5);
  });

  it('is monotonically increasing', () => {
    expect(easeOutCubic(0.25)).toBeGreaterThan(easeOutCubic(0));
    expect(easeOutCubic(1)).toBeGreaterThan(easeOutCubic(0.75));
  });
});
