import { useCallback, useSyncExternalStore } from 'react';

/**
 * Theo dõi một CSS media query, vd: `useMediaQuery('(max-width: 1023.98px)')`.
 * Trả về false nếu môi trường không hỗ trợ matchMedia (test jsdom, SSR).
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window.matchMedia !== 'function') return () => undefined;
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query]
  );

  const getSnapshot = () =>
    typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : false;

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
