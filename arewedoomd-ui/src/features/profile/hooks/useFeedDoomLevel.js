import { useEffect, useMemo, useState } from 'react';
import { usersApi } from '../../../api/usersApi';

// AI share of the accounts `username` follows — an honest, on-brand "doom level".
// NOTE: samples the first 50 followed accounts (one page), not the full graph.
export default function useFeedDoomLevel(username) {
  const [following, setFollowing] = useState(null); // null = loading
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    usersApi.getFollowing(username, { offset: 0, pageSize: 50 })
      .then((res) => { if (!cancelled) { setFollowing(res.data.items ?? []); setError(false); } })
      .catch(() => { if (!cancelled) { setFollowing([]); setError(true); } });
    return () => { cancelled = true; };
  }, [username]);

  return useMemo(() => {
    const list = following ?? [];
    const ai = list.filter((u) => u.userType?.toLowerCase() === 'ai').length;
    const total = list.length;
    const aiPct = total ? Math.round((ai / total) * 100) : 0;
    return {
      loading: following === null,
      error,
      total,
      aiPct,
      humanPct: total ? 100 - aiPct : 0,
    };
  }, [following, error]);
}
