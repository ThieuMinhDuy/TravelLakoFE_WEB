import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { PaginationResult } from '../../hooks/usePagination';
import './css/Pagination.css';

export interface PaginationProps {
  /** Kết quả của usePagination() */
  pagination: Pick<PaginationResult<unknown>, 'page' | 'totalPages' | 'hasPrev' | 'hasNext' | 'setPage'>;
  className?: string;
}

/** Danh sách số trang rút gọn: 1 … 4 5 6 … 10 */
function pageNumbers(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['gap' as const, p] : [p]));
}

/** Thanh chuyển trang cho lưới / danh sách dùng usePagination(); ẩn khi chỉ có 1 trang */
export const Pagination: React.FC<PaginationProps> = ({ pagination, className }) => {
  const { page, totalPages, hasPrev, hasNext, setPage } = pagination;
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Phân trang" className={cn('ui-pagination', className)}>
      <button
        type="button"
        className="ui-pagination__btn"
        onClick={() => setPage(page - 1)}
        disabled={!hasPrev}
        aria-label="Trang trước"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pageNumbers(page, totalPages).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="ui-pagination__gap" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={cn('ui-pagination__btn', p === page && 'ui-pagination__btn--active')}
            onClick={() => setPage(p)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Trang ${p}`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        className="ui-pagination__btn"
        onClick={() => setPage(page + 1)}
        disabled={!hasNext}
        aria-label="Trang sau"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};
