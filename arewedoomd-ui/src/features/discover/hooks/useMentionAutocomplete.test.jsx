// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useMentionAutocomplete from './useMentionAutocomplete';

vi.mock('../services/searchApi', () => ({
  searchApi: { searchUsers: vi.fn(() => Promise.resolve({ data: [] })) },
}));

const PARTICIPANTS = [{ id: 1, username: 'selin' }];

// Builds a detached textarea + ref object the hook can read/write, mirroring
// how the composers wire inputRef to a real <textarea>.
function makeInputRef(value, caret) {
  const el = document.createElement('textarea');
  el.value = value;
  document.body.appendChild(el);
  el.selectionStart = caret;
  el.selectionEnd = caret;
  return { current: el };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('useMentionAutocomplete', () => {
  it('opens with a matching participant suggestion while typing a token', () => {
    const inputRef = makeInputRef('@se', 3);
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMentionAutocomplete({ inputRef, onChange, participants: PARTICIPANTS }),
    );

    act(() => {
      result.current.refresh();
    });

    expect(result.current.open).toBe(true);
    expect(result.current.suggestions.map((u) => u.username)).toContain('selin');
  });

  it('Escape dismisses durably (same token keeps it closed) until the token actually changes', () => {
    const inputRef = makeInputRef('@se', 3);
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMentionAutocomplete({ inputRef, onChange, participants: PARTICIPANTS }),
    );

    act(() => {
      result.current.refresh();
    });
    expect(result.current.open).toBe(true);

    // Escape keydown closes the popup.
    act(() => {
      result.current.handleKeyDown({ key: 'Escape', preventDefault() {} });
    });
    expect(result.current.open).toBe(false);

    // The keyup that follows in the same keystroke re-reads the same
    // unchanged token — must NOT reopen (this is the bug Fix 1 addresses).
    act(() => {
      result.current.refresh();
    });
    expect(result.current.open).toBe(false);

    // The user keeps typing — the token's query changes, and the caret
    // moves — suppression must clear and the popup reopens.
    inputRef.current.value = '@sel';
    inputRef.current.selectionStart = 4;
    inputRef.current.selectionEnd = 4;
    act(() => {
      result.current.refresh();
    });
    expect(result.current.open).toBe(true);
    expect(result.current.suggestions.map((u) => u.username)).toContain('selin');
  });

  it('select() replaces the active token with the exact mention string', () => {
    const inputRef = makeInputRef('hi @se', 6);
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useMentionAutocomplete({ inputRef, onChange, participants: PARTICIPANTS }),
    );

    act(() => {
      result.current.refresh();
    });
    expect(result.current.open).toBe(true);

    act(() => {
      result.current.select({ username: 'selin' });
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('hi @selin ');
  });
});
