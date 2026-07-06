import { useMemo } from 'react';

/**
 * Number of list skeletons needed to fill the viewport, so a loading list
 * doesn't leave the lower half of the screen blank.
 *
 * @param {number} itemHeight estimated rendered height of one row incl. gap
 * @param {number} min        floor for very short viewports
 */
export default function useSkeletonCount(itemHeight = 236, min = 5) {
  return useMemo(() => {
    if (typeof window === 'undefined') return min;
    return Math.max(min, Math.ceil(window.innerHeight / itemHeight) + 1);
  }, [itemHeight, min]);
}
