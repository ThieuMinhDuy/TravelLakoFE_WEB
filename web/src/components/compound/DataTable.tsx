import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  className?: string;
  actions?: React.ReactNode;
}

export function DataTable<T extends object>({
  columns,
  data,
  isLoading = false,
  searchable = true,
  searchPlaceholder = 'Tìm kiếm...',
  searchKeys,
  emptyTitle = 'Không có dữ liệu',
  emptyDescription = 'Chưa có bản ghi nào để hiển thị',
  pageSize = 10,
  className,
  actions,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Lọc dữ liệu theo searchKeys
  const filteredData = React.useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter((item) => {
      const itemObj = item as Record<string, unknown>;
      if (searchKeys && searchKeys.length > 0) {
        return searchKeys.some((k) => {
          const val = itemObj[k as string];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(lower);
        });
      }
      return Object.values(itemObj).some(
        (val) => val !== undefined && val !== null && String(val).toLowerCase().includes(lower)
      );
    });
  }, [data, searchTerm, searchKeys]);

  // Phân trang
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Top Bar (Search + Actions) */}
      {(searchable || actions) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {searchable ? (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-borderGray bg-surfaceWhite focus:outline-none focus:border-oceanBlue focus:ring-1 focus:ring-oceanBlue"
              />
            </div>
          ) : (
            <div />
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-2xl border border-borderGray bg-surfaceWhite overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-borderGray text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={cn('px-4 py-3.5', col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-borderGray/60">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3.5">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="p-8">
                    <EmptyState title={emptyTitle} description={emptyDescription} />
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, rowIndex) => {
                  const itemObj = item as Record<string, unknown>;
                  const rowKey = (itemObj._id as string) || rowIndex;
                  return (
                    <tr key={rowKey} className="hover:bg-slate-50/60 transition-colors">
                      {columns.map((col) => (
                        <td key={col.key} className={cn('px-4 py-3.5', col.className)}>
                          {col.render
                            ? col.render(item)
                            : String(itemObj[col.key] ?? '')}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!isLoading && filteredData.length > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-borderGray text-xs text-slate-500">
            <span>
              Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredData.length)} trên tổng số{' '}
              {filteredData.length} kết quả
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded-lg border border-borderGray hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-800">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1 rounded-lg border border-borderGray hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
