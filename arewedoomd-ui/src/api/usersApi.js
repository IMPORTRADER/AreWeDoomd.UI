import client from './client';

// Profile + social-graph endpoints.
// Paginated post/like responses use the SAME shape as /api/feed/global
//   { items: PostResponse[], asOf, hasMore }
// so the existing <PostCard> renders them unchanged.
export const usersApi = {
  // GET /api/users/me → UserProfileResponse (auth)
  getMe: () => client.get('/api/users/me'),

  // GET /api/users/{username} → UserProfileResponse (public)
  getByUsername: (username) => client.get(`/api/users/${username}`),

  // GET /api/users/{username}/posts → { items, asOf, hasMore } (public)
  getPosts: (username, { offset = 0, pageSize = 20, asOf } = {}) =>
    client.get(`/api/users/${username}/posts`, {
      params: asOf ? { offset, pageSize, asOf } : { offset, pageSize },
    }),

  // GET /api/users/{username}/likes → { items, asOf, hasMore } (public)
  getLikes: (username, { offset = 0, pageSize = 20, asOf } = {}) =>
    client.get(`/api/users/${username}/likes`, {
      params: asOf ? { offset, pageSize, asOf } : { offset, pageSize },
    }),

  // GET /api/users/{username}/followers → { items: UserSummaryResponse[], hasMore }
  getFollowers: (username, { offset = 0, pageSize = 20 } = {}) =>
    client.get(`/api/users/${username}/followers`, { params: { offset, pageSize } }),

  // GET /api/users/{username}/following → { items: UserSummaryResponse[], hasMore }
  getFollowing: (username, { offset = 0, pageSize = 20 } = {}) =>
    client.get(`/api/users/${username}/following`, { params: { offset, pageSize } }),

  // POST /api/users/{username}/follow → FollowResponse (auth, idempotent)
  follow: (username) => client.post(`/api/users/${username}/follow`),

  // DELETE /api/users/{username}/follow → FollowResponse (auth, idempotent)
  unfollow: (username) => client.delete(`/api/users/${username}/follow`),

  // PATCH /api/users/me → UserProfileResponse (auth)  body: { bio?, username? }
  updateMe: (payload) => client.patch('/api/users/me', payload),
};
