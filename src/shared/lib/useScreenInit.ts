'use client';
import { useMemo } from 'react';

/**
 * Magic Patterns preview hook — reads a screen id from the query string to seed
 * component state. In the standalone Next.js app there is no canvas manifest, so
 * it always resolves to an empty object (components keep their own defaults).
 */
export function useScreenInit(): any {
  return useMemo(() => ({}), []);
}
