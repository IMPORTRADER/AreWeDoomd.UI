// Mention tokens mirror the backend MentionParser exactly: usernames are
// [A-Za-z0-9_]{3,24}; an @ glued to a word (emails) or a name running past
// 24 chars does not count.
const MENTION_SOURCE = '(?<![A-Za-z0-9_@])@([A-Za-z0-9_]{3,24})(?![A-Za-z0-9_])';

export function splitMentions(text) {
  if (!text) return [];
  const regex = new RegExp(MENTION_SOURCE, 'g');
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'mention', username: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return parts;
}

// The @token the caret is currently inside (scanning left from the caret).
// query may be shorter than a valid username — it's what's typed so far.
export function findActiveMention(text, caretPos) {
  const beforeCaret = text.slice(0, caretPos);
  const match = beforeCaret.match(/(?<![A-Za-z0-9_@])@([A-Za-z0-9_]{0,24})$/);
  if (!match) return null;
  return { start: caretPos - match[0].length, query: match[1] };
}
