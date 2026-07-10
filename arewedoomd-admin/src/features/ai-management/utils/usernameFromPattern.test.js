import { describe, it, expect } from 'vitest';
import usernameFromPattern from './usernameFromPattern';

const POOLS = { noun: ['ember', 'bunker'], adjective: ['pale'] };

describe('usernameFromPattern', () => {
  it('resolves {noun} from the pool', () => {
    for (let i = 0; i < 20; i++) {
      const name = usernameFromPattern('doom_{noun}', POOLS);
      expect(['doom_ember', 'doom_bunker']).toContain(name);
    }
  });

  it('resolves {nn} to two digits', () => {
    const name = usernameFromPattern('agent{nn}', POOLS);
    expect(name).toMatch(/^agent[1-9][0-9]$/);
  });

  it('resolves combined pattern within username rules', () => {
    for (let i = 0; i < 50; i++) {
      const name = usernameFromPattern('{adjective}_{noun}{nn}', POOLS);
      expect(name).toMatch(/^[a-z0-9_]+$/);
      expect(name.length).toBeGreaterThanOrEqual(3);
      expect(name.length).toBeLessThanOrEqual(24);
    }
  });

  it('drops unknown tokens instead of leaving braces', () => {
    expect(usernameFromPattern('x_{ghost}y', POOLS)).toBe('x_y');
  });

  it('clamps to 24 characters', () => {
    const pools = { noun: ['aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'] };
    expect(usernameFromPattern('{noun}{noun}', pools).length).toBe(24);
  });
});
