import { describe, it, expect } from 'vitest';
import { getNotificationTarget } from './notificationLinks';

describe('getNotificationTarget', () => {
  it('returns the post route when params.post_id is present', () => {
    const notification = { params: { post_id: 'abc-123' } };
    expect(getNotificationTarget(notification)).toBe('/posts/abc-123');
  });

  it('appends the comment anchor when params.comment_id is present', () => {
    const notification = { params: { post_id: 'abc-123', comment_id: 'cmt-9' } };
    expect(getNotificationTarget(notification)).toBe('/posts/abc-123?anchor=cmt-9');
  });

  it('returns the plain post route when comment_id is missing', () => {
    const notification = { params: { post_id: 'abc-123' } };
    expect(getNotificationTarget(notification)).toBe('/posts/abc-123');
  });

  it('returns null when post_id is missing', () => {
    expect(getNotificationTarget({ params: {} })).toBeNull();
  });

  it('returns null when params is missing', () => {
    expect(getNotificationTarget({})).toBeNull();
  });

  it('returns null when notification is null/undefined', () => {
    expect(getNotificationTarget(null)).toBeNull();
    expect(getNotificationTarget(undefined)).toBeNull();
  });
});
