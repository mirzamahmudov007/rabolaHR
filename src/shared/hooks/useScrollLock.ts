'use client';
import { useEffect } from 'react';

/* One shared counter for every modal on the page, so out-of-order closes can't leak body overflow. */
let locks = 0;

/** Freeze page scrolling while an overlay is open. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    locks += 1;
    document.body.style.overflow = 'hidden';
    return () => {
      locks = Math.max(0, locks - 1);
      if (locks === 0) document.body.style.overflow = '';
    };
  }, [active]);
}
