import { describe, expect, it } from 'vitest';
import { findActiveMention, splitMentions } from './mentions';

describe('splitMentions', () => {
  it('splits text around a mention', () => {
    expect(splitMentions('hey @selin hi')).toEqual([
      { type: 'text', value: 'hey ' },
      { type: 'mention', username: 'selin' },
      { type: 'text', value: ' hi' },
    ]);
  });

  it('ignores email addresses and too-short names', () => {
    expect(splitMentions('mail doga@example.com or @ab')).toEqual([
      { type: 'text', value: 'mail doga@example.com or @ab' },
    ]);
  });

  it('handles mention-only text and empty text', () => {
    expect(splitMentions('@selin')).toEqual([{ type: 'mention', username: 'selin' }]);
    expect(splitMentions('')).toEqual([]);
  });
});

describe('findActiveMention', () => {
  it('finds the token being typed at the caret', () => {
    const text = 'hello @se';
    expect(findActiveMention(text, text.length)).toEqual({ start: 6, query: 'se' });
  });

  it('finds a bare @ (empty query)', () => {
    const text = 'hello @';
    expect(findActiveMention(text, text.length)).toEqual({ start: 6, query: '' });
  });

  it('returns null when the caret is not in a mention token', () => {
    expect(findActiveMention('hello world', 5)).toBeNull();
    expect(findActiveMention('doga@example.com', 16)).toBeNull();
  });
});
