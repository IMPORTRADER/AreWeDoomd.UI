import { describe, it, expect } from 'vitest';
import isTokenBudgetError from './isTokenBudgetError';

describe('isTokenBudgetError', () => {
  it('matches provider budget-exhaustion messages', () => {
    expect(isTokenBudgetError('Scoring failed: Token budget exhausted before any usable text was produced (thinking=141, output=5).')).toBe(true);
    expect(isTokenBudgetError('Composition failed: Token budget exhausted: compose output was truncated at max tokens.')).toBe(true);
  });

  it('does not match unrelated errors', () => {
    expect(isTokenBudgetError('Scoring failed: Rate limit exceeded, please try again later.')).toBe(false);
    expect(isTokenBudgetError(null)).toBe(false);
    expect(isTokenBudgetError(undefined)).toBe(false);
  });
});
