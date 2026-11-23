import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

type StringRecord = Record<string, string>;

/**
 * Bộ lọc của trang admin lưu trên URL (?q=&group=...): F5 hoặc chia sẻ link không mất bộ lọc.
 * Dùng `replace` nên đổi bộ lọc không tạo thêm lịch sử trình duyệt.
 * Giá trị bằng mặc định thì xóa khỏi URL cho gọn.
 */
export function useUrlFilters<T extends { [K in keyof T]: string }>(defaults: T) {
  const [searchParams, setSearchParams] = useSearchParams();

  // `defaults` thường là object literal → so theo nội dung để các memo/callback ổn định
  const defaultsKey = JSON.stringify(defaults);

  const filters = useMemo(() => {
    const base = JSON.parse(defaultsKey) as StringRecord;
    const result: StringRecord = { ...base };
    Object.keys(base).forEach((key) => {
      const value = searchParams.get(key);
      if (value !== null) result[key] = value;
    });
    return result as unknown as T;
  }, [searchParams, defaultsKey]);

  const setFilters = useCallback(
    (patch: Partial<T>) => {
      const base = JSON.parse(defaultsKey) as StringRecord;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(patch as StringRecord).forEach(([key, value]) => {
            if (value === undefined || value === '' || value === base[key]) next.delete(key);
            else next.set(key, value);
          });
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams, defaultsKey]
  );

  const resetFilters = useCallback(
    () => setFilters(JSON.parse(defaultsKey) as Partial<T>),
    [setFilters, defaultsKey]
  );

  const isFiltered = useMemo(() => {
    const base = JSON.parse(defaultsKey) as StringRecord;
    const current = filters as unknown as StringRecord;
    return Object.keys(base).some((key) => current[key] !== base[key]);
  }, [filters, defaultsKey]);

  return { filters, setFilters, resetFilters, isFiltered };
}
