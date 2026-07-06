import '@testing-library/jest-dom';

// Node 22.4+ ships a native Web Storage global that shadows jsdom's
// window.localStorage in the test worker, leaving the bare `localStorage`
// reference undefined. Rebind it to jsdom's implementation so code that
// calls `localStorage.*` (e.g. AuthContext) works under vitest, regardless
// of Node version.

// Create a mock storage implementation as fallback
class MockStorage {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  get length() {
    return Object.keys(this.store).length;
  }
}

// Ensure localStorage and sessionStorage are available
if (typeof globalThis.localStorage === 'undefined') {
  if (typeof window !== 'undefined' && typeof window.localStorage === 'object') {
    // Use jsdom's localStorage if available
    globalThis.localStorage = window.localStorage;
    globalThis.sessionStorage = window.sessionStorage;
  } else {
    // Fallback to mock storage
    globalThis.localStorage = new MockStorage();
    globalThis.sessionStorage = new MockStorage();
  }
}
