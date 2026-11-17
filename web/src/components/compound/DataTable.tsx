import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { Skeleton } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import './css/DataTable.css';

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
    <div className={cn('ui-data-table', className)}>
      {/* Top Bar (Search + Actions) */}
      {(searchable || actions) && (
        <div className="ui-data-table__top-bar">
          {searchable ? (
            <div className="ui-data-table__search-wrapper">
              <Search className="ui-data-table__search-icon" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="ui-data-table__search-input"
              />
            </div>
          ) : (
            <div />
          )}
          {actions && <div className="ui-data-table__actions">{actions}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="ui-data-table__container">
        <div className="ui-data-table__scroll">
          <table className="ui-data-table__table">
            <thead className="ui-data-table__thead">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={cn('ui-data-table__th', col.className)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="ui-data-table__tbody">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="ui-data-table__td">
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
                    <tr key={rowKey}>
                      {columns.map((col) => (
                        <td key={col.key} className={cn('ui-data-table__td', col.className)}>
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
          <div className="ui-data-table__pagination">
            <span>
              Hiển thị {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredData.length)} trên tổng số{' '}
              {filteredData.length} kết quả
            </span>
            <div className="ui-data-table__pagination-controls">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="ui-data-table__pagination-btn"
                type="button"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="ui-data-table__pagination-current">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="ui-data-table__pagination-btn"
                type="button"
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
