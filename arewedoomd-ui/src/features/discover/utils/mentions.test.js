import { describe, expect, it } from 'vitest';
import { applyReplyMention, findActiveMention, splitMentions } from './mentions';

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

describe('applyReplyMention', () => {
  it('inserts the mention into an empty draft', () => {
    expect(applyReplyMention('', 'selin', null)).toBe('@selin ');
  });

  it('appends with a separator when the draft has text', () => {
    expect(applyReplyMention('great post', 'selin', null)).toBe('great post @selin ');
  });

  it('is idempotent for the same user (reply spam adds nothing)', () => {
    const once = applyReplyMention('', 'selin', null);
    expect(applyReplyMention(once, 'selin', 'selin')).toBe(once);
    expect(applyReplyMention(once, 'selin', 'selin')).toBe(once);
  });

  it('does not duplicate a mention the user already typed themselves', () => {
    expect(applyReplyMention('hey @selin hi', 'selin', null)).toBe('hey @selin hi');
  });

  it('replaces the previous reply mention when replying to a different user', () => {
    expect(applyReplyMention('@selin ', 'doga', 'selin')).toBe('@doga ');
  });

  it('removes the previous reply mention from the middle of the draft', () => {
    expect(applyReplyMention('hey @selin thanks', 'doga', 'selin')).toBe('hey thanks @doga ');
  });

  it('only appends when the previous reply mention was already deleted by the user', () => {
    expect(applyReplyMention('hello', 'doga', 'selin')).toBe('hello @doga ');
  });

  it('does not remove other mentions that match part of the previous username', () => {
    expect(applyReplyMention('@selin_dev ', 'doga', 'selin')).toBe('@selin_dev @doga ');
  });

  it('refuses the whole insertion when it would exceed the 280 cap', () => {
    const long = 'x'.repeat(275);
    expect(applyReplyMention(long, 'selin', null)).toBe(long);
  });
});
