import { useEffect, useRef, useState } from 'react';

/**
 * Smooths a raw loading flag to prevent loader "flash":
 *   - waits `delay` ms before showing a loader, so fast responses never flash one
 *   - once shown, keeps it visible for at least `minDuration` ms
 *
 * Returns whether a loader (spinner or skeleton) should currently be displayed.
 */
export default function useDelayedLoading(loading, { delay = 200, minDuration = 400 } = {}) {
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef(0);

  useEffect(() => {
    if (loading && !visible) {
      const showTimer = setTimeout(() => {
        shownAtRef.current = Date.now();
        setVisible(true);
      }, delay);
      return () => clearTimeout(showTimer);
    }

    if (!loading && visible) {
      const elapsed = Date.now() - shownAtRef.current;
      const hideTimer = setTimeout(() => setVisible(false), Math.max(0, minDuration - elapsed));
      return () => clearTimeout(hideTimer);
    }

    return undefined;
  }, [loading, visible, delay, minDuration]);

  return visible;
}
