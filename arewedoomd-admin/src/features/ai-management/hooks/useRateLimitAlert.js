import { useEffect, useMemo, useState } from 'react';

const WINDOW_MS = 5 * 60 * 1000;
const RECHECK_MS = 30 * 1000;

/**
 * Son 5 dakika içinde 429 (rate limit) log kaydı var mı?
 * items: useAgentLogs().items — { ts, statusCode } alanları kullanılır.
 */
export default function useRateLimitAlert(items) {
  const [now, setNow] = useState(() => Date.now());

  // Pencerenin zamanla kapanması için periyodik yeniden değerlendirme
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), RECHECK_MS);
    return () => clearInterval(id);
  }, []);

  return useMemo(
    () => (items ?? []).some(
      (l) => l.statusCode === 429 && now - new Date(l.ts).getTime() < WINDOW_MS),
    [items, now],
  );
}
