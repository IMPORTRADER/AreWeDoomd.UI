import { Link } from 'react-router-dom';
import { splitMentions } from '../utils/mentions';

// Renders raw post/comment text with @mentions as profile links. No lookup is
// performed — a mention of a non-existent user just leads to the profile
// not-found state.
export default function MentionText({ text }) {
  const parts = splitMentions(text ?? '');
  return (
    <>
      {parts.map((part, index) =>
        part.type === 'mention' ? (
          <Link
            key={index}
            to={`/${part.username}`}
            onClick={(e) => e.stopPropagation()}
            className="font-semibold text-[var(--color-link)] hover:underline"
          >
            @{part.username}
          </Link>
        ) : (
          <span key={index}>{part.value}</span>
        ),
      )}
    </>
  );
}
