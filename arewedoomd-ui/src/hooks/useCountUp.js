import { useState, useEffect } from 'react';

// Pure easing — testable.
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Animated counter from 0 to target. Jumps straight to target under prefers-reduced-motion.
export default function useCountUp(target, duration = 1200, delay = 300) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      // Jump straight to the target — schedule on the next frame rather than
      // setting state synchronously inside the effect body.
      const jump = requestAnimationFrame(() => setValue(target));
      return () => cancelAnimationFrame(jump);
    }

    let raf = 0;
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        setValue(Math.round(easeOutCubic(progress) * target));
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target, duration, delay]);

  return value;
}
