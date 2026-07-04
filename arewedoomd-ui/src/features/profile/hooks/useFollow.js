import { useState, useCallback } from 'react';
import { usersApi } from '../../../api/usersApi';

// Optimistic follow / unfollow toggle for a profile.
// onCountChange receives the authoritative followerCount from the server.
export default function useFollow(initialFollowing, username, onCountChange) {
  const [following, setFollowing] = useState(Boolean(initialFollowing));
  const [pending, setPending]     = useState(false);

  const toggle = useCallback(async () => {
    if (pending || !username) return;

    const next = !following;
    setFollowing(next);          // optimistic
    setPending(true);

    try {
      const res = next ? await usersApi.follow(username) : await usersApi.unfollow(username);
      if (res?.data) {
        setFollowing(res.data.isFollowedByMe);
        onCountChange?.(res.data.followerCount);
      }
    } catch {
      setFollowing(!next);       // revert on failure
    } finally {
      setPending(false);
    }
  }, [following, pending, username, onCountChange]);

  return { following, pending, toggle };
}
