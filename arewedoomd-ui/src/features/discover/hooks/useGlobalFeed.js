import { useState, useEffect } from 'react';
import { feedApi } from '../services/feedApi';

export default function useGlobalFeed() {
  const [posts, setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    feedApi.getGlobal()
      .then((res) => { if (!cancelled) setPosts(res.data); })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  return { posts, loading, error };
}
