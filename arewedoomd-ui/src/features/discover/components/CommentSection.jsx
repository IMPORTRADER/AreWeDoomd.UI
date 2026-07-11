import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import CommentItem from './CommentItem';
import useMentionAutocomplete from '../hooks/useMentionAutocomplete';
import MentionSuggestions from './MentionSuggestions';
import { applyReplyMention } from '../utils/mentions';

// Composer grows from 1 line up to this many lines, then scrolls internally.
const MAX_COMPOSER_ROWS = 5;

// Up arrow ("publish"), not a paper plane — the plane reads as a DM action.
function SendIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20V4" />
      <path d="M5 11l7-7 7 7" />
    </svg>
  );
}

export default function CommentSection({
  comments,
  commentCount,
  loading,
  submitting,
  error,
  currentUserId,
  onAddComment,
  onDeleteComment,
  onShowMore,
  // Expanded (post-detail) mode — full pagination + infinite scroll
  expanded = false,
  anchorCommentId = null,
  hasMoreBefore = false,
  hasMoreAfter = false,
  loadingOlder = false,
  loadingNewer = false,
  onLoadOlder,
  onLoadNewer,
  mentionParticipants = [],
}) {
  const [draft, setDraft] = useState('');
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const sentinelRef = useRef(null);
  const anchorAppliedRef = useRef(false);
  // Username the last Reply click inserted into the draft — lets a reply to a
  // different user swap the mention instead of stacking a second one.
  const replyMentionRef = useRef(null);
  const [clearedAnchor, setClearedAnchor] = useState(null);

  const mention = useMentionAutocomplete({
    inputRef,
    // Refuse rather than truncate: a mention insertion that would push the
    // draft past 280 chars is dropped whole, mirroring handleReply's cap
    // policy below (a truncated @username could name the wrong user).
    onChange: (next) => {
      if (next.length <= 280) {
        setDraft(next);
      }
    },
    participants: mentionParticipants,
  });

  const MAX_VISIBLE_COMMENTS = 6;
  // Feed mode reveals comments inline in pages, growing the list under the post
  // instead of navigating away; expanded mode shows all loaded comments and
  // relies on pagination buttons / infinite scroll.
  const [feedLimit, setFeedLimit] = useState(MAX_VISIBLE_COMMENTS);
  const visibleComments = expanded ? comments : comments.slice(-feedLimit);
  const hiddenCount = Math.max(0, commentCount - visibleComments.length);

  const hasComments = visibleComments.length > 0;

  // Feed mode "Show more": reveal another page inline and ask the parent to load
  // all the comments if they aren't all here yet — the post stays in the feed.
  function handleShowMore() {
    onShowMore?.(visibleComments[0]?.id);
    setFeedLimit((n) => n + MAX_VISIBLE_COMMENTS);
  }

  // Expanded mode: scroll the anchored comment to the top of the viewport once.
  useEffect(() => {
    anchorAppliedRef.current = false;
  }, [anchorCommentId]);

  useLayoutEffect(() => {
    if (!expanded || anchorAppliedRef.current || !anchorCommentId) return;
    const el = document.getElementById(`comment-${anchorCommentId}`);
    if (el) {
      anchorAppliedRef.current = true;
      el.scrollIntoView({ block: 'start' });
    }
  }, [expanded, anchorCommentId, comments.length]);

  // Expanded mode: auto-load newer comments as the bottom sentinel appears.
  useEffect(() => {
    if (!expanded) return undefined;
    const el = sentinelRef.current;
    if (!el || !hasMoreAfter) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreAfter && !loadingNewer) {
          onLoadNewer?.();
        }
      },
      { rootMargin: '300px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [expanded, hasMoreAfter, loadingNewer, onLoadNewer]);

  // Expanded mode: prepend older comments while preserving scroll position.
  async function handleLoadOlder() {
    if (!onLoadOlder) return;
    const scroller = document.scrollingElement;
    const prevHeight = scroller.scrollHeight;
    const added = await onLoadOlder();
    if (added > 0) {
      requestAnimationFrame(() => {
        scroller.scrollTop += scroller.scrollHeight - prevHeight;
      });
    }
  }

  // Auto-grow the composer: reset to content height, capped at MAX_COMPOSER_ROWS
  // lines, after which the textarea stops growing and scrolls inside itself.
  const resizeComposer = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    const style = window.getComputedStyle(el);
    const lineHeight = parseFloat(style.lineHeight);
    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const borderY = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const maxHeight = lineHeight * MAX_COMPOSER_ROWS + paddingY + borderY;

    el.style.height = 'auto';
    const contentHeight = el.scrollHeight + borderY;
    el.style.height = `${Math.min(contentHeight, maxHeight)}px`;
    el.style.overflowY = contentHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

  // Re-measure on every draft change — covers typing, paste, and reset on submit.
  useLayoutEffect(() => {
    resizeComposer();
  }, [draft, resizeComposer]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!draft.trim() || submitting) return;
    const result = await onAddComment(draft);
    if (result) {
      setDraft('');
      // The reply mention left with the sent comment — a stale ref here could
      // delete an identical mention the user types by hand later.
      replyMentionRef.current = null;
      inputRef.current?.focus();
    }
  }

  // Reply prefill: keep exactly one reply mention in the draft — repeat clicks
  // on the same user are no-ops, a reply to a different user swaps the mention.
  // User-typed text is never touched; the 280 cap refuses the insertion whole.
  // Then focus with caret at end.
  function handleReply(username) {
    const next = applyReplyMention(draft, username, replyMentionRef.current);
    // Only track the mention as "reply-inserted" when it actually made it into
    // the draft (an over-cap refusal leaves the old tracking in place).
    if (next !== draft || draft.includes(`@${username}`)) {
      replyMentionRef.current = username;
    }
    setDraft(next);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }

  function handleDraftKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <div className="bg-[var(--color-panel)] px-5 py-4" onClick={(e) => e.stopPropagation()}>
      {/* Comments list */}
      {/* Full-panel spinner only for the initial load — once comments are on
          screen, fetching more must not blank the list out from under the reader. */}
      {loading && !hasComments && (
        <div className="flex items-center justify-center py-4">
          <span className="w-5 h-5 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-link)] animate-spin" />
        </div>
      )}

      {hasComments && (
        <div
          ref={listRef}
          className={[
            'flex flex-col gap-1.5 mb-4',
            expanded ? '' : 'pr-1',
          ].join(' ')}
        >
          {expanded ? (
            hasMoreBefore && (
              <button
                type="button"
                onClick={handleLoadOlder}
                disabled={loadingOlder}
                className="w-full rounded-2xl border border-dashed border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-link)] hover:bg-[var(--color-link)]/10 transition-colors disabled:opacity-60"
              >
                {loadingOlder ? 'Loading…' : 'Show older comments'}
              </button>
            )
          ) : (
            hiddenCount > 0 && (
              <button
                type="button"
                onClick={handleShowMore}
                disabled={loading}
                className="w-full rounded-2xl border border-dashed border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-link)] hover:bg-[var(--color-link)]/10 transition-colors disabled:opacity-60"
              >
                {loading ? 'Loading…' : `Show more comments (+${hiddenCount})`}
              </button>
            )
          )}

          {visibleComments.map((comment) => {
            // Highlight the anchored comment once on arrival, until its animation
            // ends (tracked by clearedAnchor). Derived during render so a re-render
            // mid-animation keeps the class stable.
            const isHighlighted =
              expanded && comment.id === anchorCommentId && clearedAnchor !== anchorCommentId;
            return (
              <div
                key={comment.id}
                id={`comment-${comment.id}`}
                onAnimationEnd={
                  isHighlighted
                    ? (e) => {
                        // The highlight animation runs on CommentItem and bubbles
                        // up here; only react to that animation, not some other
                        // child animation.
                        if (e.animationName.startsWith('comment-highlight')) {
                          setClearedAnchor(anchorCommentId);
                        }
                      }
                    : undefined
                }
              >
                <CommentItem
                  comment={comment}
                  currentUserId={currentUserId}
                  onDelete={onDeleteComment}
                  onReply={currentUserId ? handleReply : undefined}
                  highlighted={isHighlighted}
                />
              </div>
            );
          })}

          {expanded && hasMoreAfter && (
            <div ref={sentinelRef} className="flex items-center justify-center py-2">
              <span className="w-5 h-5 rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-link)] animate-spin" />
            </div>
          )}
        </div>
      )}

      {!loading && comments.length === 0 && (
        <div className="relative -mt-1 mb-3 h-9 w-full">
          <p className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center text-xs text-[var(--color-text-secondary)]">
            {error && commentCount > 0
              ? error
              : 'No comments yet. Be the first to share your thoughts.'}
          </p>
        </div>
      )}

      {/* Comment input */}
      {currentUserId && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={['flex flex-col gap-1.5', hasComments ? 'pt-3 border-t border-[var(--color-border)]' : ''].join(' ')}
        >
          {/* The send button lives inside the input frame, anchored to the
              bottom-right: centered on a single line (46px input, 34px button,
              6px offsets), staying put as the composer grows. */}
          <div className="relative">
            <MentionSuggestions
              open={mention.open}
              suggestions={mention.suggestions}
              activeIndex={mention.activeIndex}
              onSelect={mention.select}
              onHover={mention.setActiveIndex}
              placement="top"
            />
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                mention.refresh();
              }}
              onKeyDown={(e) => {
                if (mention.handleKeyDown(e)) return;
                handleDraftKeyDown(e);
              }}
              onKeyUp={mention.refresh}
              onClick={mention.refresh}
              onBlur={mention.close}
              placeholder="Write a comment..."
              rows={1}
              disabled={submitting}
              maxLength={280}
              className="composer-scroll block w-full resize-none overflow-y-hidden rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] pl-3.5 pr-16 py-3 text-[15px] leading-5 text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)] outline-none hover:bg-[var(--color-surface-2)] disabled:opacity-60 transition-colors"
            />
            <button
              type="submit"
              disabled={!draft.trim() || submitting}
              className="absolute right-1.5 bottom-1.5 w-13 h-[34px] flex items-center justify-center rounded-2xl bg-[var(--color-btn-primary)] text-white hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <SendIcon />
              )}
            </button>
          </div>
          <p className="pl-3 text-[11px] text-[var(--color-text-secondary)]">
            Ctrl+Enter to send.
          </p>
        </form>
      )}
    </div>
  );
}
