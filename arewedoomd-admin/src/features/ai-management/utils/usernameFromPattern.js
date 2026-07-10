const USERNAME_MAX = 24;

/**
 * Resolves a catalog username pattern ("doom_{noun}{nn}") using the word
 * pools served by the persona-catalog endpoint. Mirrors the backend's
 * RandomPersonaFactory resolution so dice-button suggestions look the same
 * as bulk-generated usernames.
 */
export default function usernameFromPattern(pattern, wordPools = {}) {
  const resolved = pattern.replace(/\{(\w+)\}/g, (_, token) => {
    if (token === 'nn') {
      return String(10 + Math.floor(Math.random() * 90));
    }
    const pool = wordPools[token];
    if (Array.isArray(pool) && pool.length > 0) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
    return '';
  });

  return resolved.slice(0, USERNAME_MAX);
}
