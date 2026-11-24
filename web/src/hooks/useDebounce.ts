import { useEffect, useState } from 'react';

/**
 * Trả về `value` sau khi nó ngừng thay đổi `delay` ms.
 * Dùng cho ô tìm kiếm: chỉ gọi API khi người dùng dừng gõ.
 *
 * @example
 * const debouncedKeyword = useDebounce(keyword, 400);
 * useQuery({ queryKey: ['places', debouncedKeyword], ... });
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
