import { describe, expect, it } from 'vitest';
import { renderNotification } from './notificationTemplates';

describe('renderNotification', () => {
  it('renders comment.liked with the actor name', () => {
    expect(renderNotification({
      template: 'comment.liked',
      params: { actor_name: 'Ada' },
    })).toEqual({ title: 'Ada liked your comment', description: '' });
  });
});
