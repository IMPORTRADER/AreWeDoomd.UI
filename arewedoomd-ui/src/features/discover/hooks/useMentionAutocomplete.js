import { useEffect, useRef, useState } from 'react';
import { findActiveMention } from '../utils/mentions';
import { searchApi } from '../services/searchApi';

const DEBOUNCE_MS = 300;
const MIN_SERVER_QUERY = 2;
const MAX_SUGGESTIONS = 10;

// Drives an @mention suggestion popup for a textarea. The composer owns the
// draft state; this hook owns which token is active and what to suggest.
// Call refresh() on every change/click/keyup so the caret is re-read.
export default function useMentionAutocomplete({ inputRef, onChange, participants = [] }) {
  const [active, setActive] = useState(null); // { start, query } | null
  const [serverResults, setServerResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const requestSeqRef = useRef(0);

  const refresh = () => {
    const el = inputRef.current;
    if (!el || el.selectionStart !== el.selectionEnd) {
      setActive(null);
      return;
    }
    setActive(findActiveMention(el.value, el.selectionStart));
  };

  const close = () => setActive(null);

  const query = active?.query ?? null;

  // Debounced server search from MIN_SERVER_QUERY chars. Stale responses are
  // discarded via a sequence number; failures fall back to participants only.
  // (Short/absent queries simply aren't included when suggestions are built
  // below, so stale serverResults never need to be cleared out-of-band here.)
  useEffect(() => {
    if (query === null || query.length < MIN_SERVER_QUERY) {
      return undefined;
    }
    const seq = ++requestSeqRef.current;
    const timer = setTimeout(async () => {
      try {
        const res = await searchApi.searchUsers(query);
        if (seq === requestSeqRef.current) {
          setServerResults(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        if (seq === requestSeqRef.current) {
          setServerResults([]);
        }
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // Participants first (already on screen, instant), then server results.
  let suggestions = [];
  if (active) {
    const q = active.query.toLowerCase();
    const seen = new Set();
    for (const user of participants) {
      const name = user.username?.toLowerCase();
      if (name && name.startsWith(q) && !seen.has(name)) {
        seen.add(name);
        suggestions.push(user);
      }
    }
    if (query !== null && query.length >= MIN_SERVER_QUERY) {
      for (const user of serverResults) {
        const name = user.username?.toLowerCase();
        if (name && !seen.has(name)) {
          seen.add(name);
          suggestions.push(user);
        }
      }
    }
    suggestions = suggestions.slice(0, MAX_SUGGESTIONS);
  }

  const open = Boolean(active) && suggestions.length > 0;

  // New token or edited query → selection resets to the top row. Adjusted
  // during render (React's documented pattern for resetting state when a
  // derived key changes) rather than in an effect, so it takes effect before
  // this render commits instead of triggering an extra render pass.
  const mentionKey = active ? `${active.start}:${query}` : null;
  const [lastMentionKey, setLastMentionKey] = useState(mentionKey);
  if (mentionKey !== lastMentionKey) {
    setLastMentionKey(mentionKey);
    setActiveIndex(0);
  }

  const select = (user) => {
    const el = inputRef.current;
    if (!el || !active || !user?.username) return;
    const caret = el.selectionStart;
    const before = el.value.slice(0, active.start);
    const after = el.value.slice(caret);
    const inserted = `@${user.username} `;
    onChange(`${before}${inserted}${after}`);
    setActive(null);
    requestAnimationFrame(() => {
      el.focus();
      const pos = before.length + inserted.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const handleKeyDown = (e) => {
    if (!open) return false;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
      return true;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
      return true;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      select(suggestions[activeIndex]);
      return true;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return true;
    }
    return false;
  };

  return { open, suggestions, activeIndex, refresh, handleKeyDown, select, close, setActiveIndex };
}
