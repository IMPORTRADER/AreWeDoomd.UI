import { useCallback, useEffect, useState } from 'react';
import { aiManagementApi } from '../services/aiManagementApi';

// Module-level cache: the catalog is static content, one fetch per session
// is enough and every consumer (create modal, edit modal, table) shares it.
let cachedCatalog = null;

/** Test-only escape hatch to reset the module cache between tests. */
export function __clearCatalogCache() {
  cachedCatalog = null;
}

/** Unique traits across all catalog categories, order preserved. */
export function flattenTraits(catalog) {
  if (!catalog?.traitCategories) return [];
  const seen = new Set();
  const out = [];
  for (const category of catalog.traitCategories) {
    for (const trait of category.traits) {
      if (!seen.has(trait)) {
        seen.add(trait);
        out.push(trait);
      }
    }
  }
  return out;
}

/**
 * Loads the persona catalog (archetypes, trait categories, typing-style
 * suggestions, username word pools) from the admin API.
 *
 * @returns {{ catalog: object|null, loading: boolean, error: any, retry: Function }}
 */
export default function usePersonaCatalog() {
  const [catalog, setCatalog] = useState(cachedCatalog);
  const [loading, setLoading] = useState(cachedCatalog == null);
  const [error, setError]     = useState(null);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    if (cachedCatalog != null) {
      return undefined;
    }

    let cancelled = false;

    aiManagementApi
      .getPersonaCatalog()
      .then((res) => {
        if (cancelled) return;
        cachedCatalog = res.data;
        setCatalog(res.data);
      })
      .catch((err) => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [tick]);

  const retry = useCallback(() => {
    cachedCatalog = null;
    setCatalog(null);
    setError(null);
    setLoading(true);
    setTick((t) => t + 1);
  }, []);

  return { catalog, loading, error, retry };
}
