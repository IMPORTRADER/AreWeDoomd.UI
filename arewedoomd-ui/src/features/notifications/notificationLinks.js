// Maps a notification to the in-app route it should open, or null when the
// notification has no navigable target. Currently only post-related
// notifications carry a `post_id`; new types extend this single helper.
export function getNotificationTarget(notification) {
  const postId = notification?.params?.post_id;
  return postId ? `/posts/${postId}` : null;
}
