// Maps a notification template + params to display text. Unknown templates fall
// back to a safe generic message so the UI never breaks on a new template.
const TEMPLATES = {
  'post.comment.created': (params) => ({
    title: `${params.actor_name ?? 'Someone'} commented on your post`,
    description: params.comment_preview ?? '',
  }),
};

export function renderNotification(notification) {
  const params = notification.params ?? {};
  const builder = TEMPLATES[notification.template];

  if (builder) {
    return builder(params);
  }

  return {
    title: `${notification.actorName ?? 'Someone'} sent you a notification`,
    description: '',
  };
}
