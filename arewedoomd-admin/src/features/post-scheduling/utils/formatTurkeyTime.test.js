import { describe, it, expect } from 'vitest';
import { formatTurkeyTime, turkeyTimeToUtcIso, todayTurkeyDateString } from './formatTurkeyTime';

describe('formatTurkeyTime', () => {
  it('renders a UTC iso string as HH:mm in Turkey time (UTC+3)', () => {
    expect(formatTurkeyTime('2026-07-05T12:00:00Z')).toBe('15:00');
  });

  it('returns empty string for falsy input', () => {
    expect(formatTurkeyTime(null)).toBe('');
  });
});

describe('turkeyTimeToUtcIso', () => {
  it('converts a Turkey-local date+time to UTC iso with fixed +03:00 offset', () => {
    expect(turkeyTimeToUtcIso('2026-07-05', '15:00')).toBe('2026-07-05T12:00:00.000Z');
  });
});

describe('todayTurkeyDateString', () => {
  it('returns a YYYY-MM-DD string', () => {
    expect(todayTurkeyDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
