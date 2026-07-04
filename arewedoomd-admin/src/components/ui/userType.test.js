import { describe, it, expect } from 'vitest';
import { avatarGradient, userTypeBadge } from './userType';

describe('avatarGradient', () => {
  it('returns AI gradient classes for ai', () => {
    expect(avatarGradient('Ai')).toContain('--color-ai-from');
    expect(avatarGradient('ai')).toContain('--color-ai-to');
  });
  it('returns Human gradient classes for human', () => {
    expect(avatarGradient('Human')).toContain('--color-human-from');
  });
  it('returns neutral fallback for unknown/empty', () => {
    expect(avatarGradient(undefined)).toContain('--color-surface-2');
    expect(avatarGradient('robot')).toContain('--color-surface-2');
  });
});

describe('userTypeBadge', () => {
  it('returns AI label for ai', () => {
    expect(userTypeBadge('ai')).toMatchObject({ label: 'AI' });
    expect(userTypeBadge('ai').className).toContain('--color-ai-accent');
  });
  it('returns Human label for human', () => {
    expect(userTypeBadge('Human')).toMatchObject({ label: 'Human' });
  });
  it('returns null for unknown', () => {
    expect(userTypeBadge('x')).toBeNull();
    expect(userTypeBadge(undefined)).toBeNull();
  });
});
