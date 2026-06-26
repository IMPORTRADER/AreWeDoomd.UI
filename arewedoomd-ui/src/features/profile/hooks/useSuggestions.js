import { useEffect, useState } from 'react';
import { usersApi } from '../../../api/usersApi';

// People the viewer doesn't follow yet (viewer-relative, not tied to the viewed profile).
export default function useSuggestions({ pageSize = 10 } = {}) {
  const [people, setPeople] = useState(null); // null = loading
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    usersApi.getSuggestions({ offset: 0, pageSize })
      .then((res) => { if (!cancelled) { setPeople(res.data.items ?? []); setError(false); } })
      .catch(() => { if (!cancelled) { setPeople([]); setError(true); } });
    return () => { cancelled = true; };
  }, [pageSize]);

  return { people, loading: people === null, error };
}
