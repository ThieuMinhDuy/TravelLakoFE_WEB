import { useCallback, useMemo, useState } from 'react';

export interface UsePaginationOptions {
  /** Số phần tử mỗi trang (mặc định 10) */
  pageSize?: number;
  /** Trang bắt đầu, đánh số từ 1 */
  initialPage?: number;
}

export interface PaginationResult<T> {
  /** Trang hiện tại (từ 1), luôn nằm trong [1, totalPages] */
  page: number;
  totalPages: number;
  /** Tổng số phần tử */
  total: number;
  /** Các phần tử của trang hiện tại */
  pageItems: T[];
  /** Vị trí (từ 1) của phần tử đầu / cuối trang hiện tại — dùng cho "Hiển thị 11 - 20 trên 45" */
  from: number;
  to: number;
  hasPrev: boolean;
  hasNext: boolean;
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  /** Về trang 1 (vd: khi đổi bộ lọc / từ khóa) */
  reset: () => void;
}

/**
 * Phân trang phía client cho một danh sách bất kỳ.
 * Backend trả toàn bộ danh sách (không phân trang) nên FE tự chia trang.
 * Trang hiện tại tự giới hạn khi dữ liệu ít đi (xóa bản ghi, refetch, lọc).
 */
export function usePagination<T>(
  items: readonly T[],
  { pageSize = 10, initialPage = 1 }: UsePaginationOptions = {}
): PaginationResult<T> {
  const [requestedPage, setRequestedPage] = useState(initialPage);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, requestedPage), totalPages);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  const setPage = useCallback(
    (next: number) => setRequestedPage(Math.min(Math.max(1, next), totalPages)),
    [totalPages]
  );

  return {
    page,
    totalPages,
    total,
    pageItems,
    from: total === 0 ? 0 : (page - 1) * pageSize + 1,
    to: Math.min(page * pageSize, total),
    hasPrev: page > 1,
    hasNext: page < totalPages,
    setPage,
    nextPage: () => setPage(page + 1),
    prevPage: () => setPage(page - 1),
    reset: () => setRequestedPage(1),
  };
}
