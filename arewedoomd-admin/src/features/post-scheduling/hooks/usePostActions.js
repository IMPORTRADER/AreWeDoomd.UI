import { postSchedulingApi } from '../services/postSchedulingApi';

/**
 * Thin hook that wraps post-level mutation calls so pages never import
 * services directly (per repo convention: hooks manage request lifecycle).
 */
export default function usePostActions() {
  const cancelPost = (id) => postSchedulingApi.cancelPost(id);
  const retryPost  = (id) => postSchedulingApi.retryPost(id);
  return { cancelPost, retryPost };
}
