import { useMemo } from 'react';
export function paginate<T>(items: T[], requestedPage: number, size = 12) {
  const pageSize = Math.max(1, Math.floor(size));
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(
    totalPages,
    Math.max(1, Math.floor(requestedPage) || 1),
  );
  return {
    items: items.slice((page - 1) * pageSize, page * pageSize),
    page,
    totalPages,
    total: items.length,
    pageSize,
  };
}
export function usePagination<T>(items: T[], page: number, size = 12) {
  return useMemo(() => paginate(items, page, size), [items, page, size]);
}
