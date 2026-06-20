// Maps a notification to the in-app route it should open, or null when the
// notification has no navigable target. Post-related notifications carry a
// `post_id`; comment notifications additionally carry a `comment_id`, which is
// passed as an `anchor` query param so the target comment can be scrolled to
// and briefly highlighted. New types extend this single helper.
export function getNotificationTarget(notification) {
  const postId = notification?.params?.post_id;
  if (!postId) {
    return null;
  }
  const commentId = notification?.params?.comment_id;
  return commentId ? `/posts/${postId}?anchor=${commentId}` : `/posts/${postId}`;
}
