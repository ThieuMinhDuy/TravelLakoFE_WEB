import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquareOff, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useDebounce } from '../../../hooks/useDebounce';
import { usePagination } from '../../../hooks/usePagination';
import { useToast } from '../../../contexts/toast/ToastContext';
import { Button } from '../../../components/common/Button';
import { EmptyState } from '../../../components/common/EmptyState';
import { Pagination } from '../../../components/common/Pagination';
import { Select } from '../../../components/common/Select';
import { Skeleton } from '../../../components/common/Skeleton';
import { StatusView } from '../../../components/common/StatusView';
import { ConfirmDialog } from '../../../components/compound/ConfirmDialog';
import { SegmentedControl } from '../../../components/glass';
import type { AdminReview, AdminReviewFilters } from '../../../types/admin';
import { PLACE_TYPE_LABELS, PLACE_TYPES, toItemType } from '../../../utils/place';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { ReviewCard } from '../components/reviews/ReviewCard';
import { useDeleteReviews } from '../hooks/useAdminMutations';
import { useAdminCities, useAdminReviews } from '../hooks/useAdminQueries';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { adminErrorMessage } from '../utils/adminErrors';
import {
  countReviewTypes,
  filterReviews,
  isLowRating,
  type ReviewRatingFilter,
  type ReviewSort,
  type ReviewTypeFilter,
} from '../utils/reviewFilters';
import './css/AdminPages.css';
import './css/AdminReviews.css';

const PAGE_SIZE = 10;

const DEFAULT_FILTERS = {
  q: '',
  type: 'all',
  city: '',
  rating: 'all',
  sort: 'newest',
  /** Lọc theo một địa điểm — mở từ trang Địa điểm hoặc nút lọc trên thẻ */
  itemId: '',
};

const TYPE_OPTIONS: { value: ReviewTypeFilter; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  ...PLACE_TYPES.map((t) => ({ value: toItemType(t) as ReviewTypeFilter, label: PLACE_TYPE_LABELS[t] })),
];

const RATING_OPTIONS: { value: ReviewRatingFilter; label: string }[] = [
  { value: 'all', label: 'Mọi số sao' },
  { value: 'low', label: '≤ 2 sao (thấp)' },
  { value: '5', label: '5 sao' },
  { value: '4', label: '4 sao' },
  { value: '3', label: '3 sao' },
  { value: '2', label: '2 sao' },
  { value: '1', label: '1 sao' },
];

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'oldest', label: 'Cũ nhất' },
  { value: 'lowest', label: 'Sao thấp trước' },
];

const pick = <T extends string>(value: string, allowed: readonly { value: T }[], fallback: T): T =>
  allowed.some((o) => o.value === value) ? (value as T) : fallback;

export const AdminReviewsPage: React.FC = () => {
  useDocumentTitle('Kiểm duyệt đánh giá');
  const toast = useToast();

  const { filters, setFilters, resetFilters, isFiltered } = useUrlFilters(DEFAULT_FILTERS);
  const type = pick(filters.type, TYPE_OPTIONS, 'all');
  const rating = pick(filters.rating, RATING_OPTIONS, 'all');
  const sort = pick(filters.sort, SORT_OPTIONS, 'newest');
  const { city, itemId } = filters;

  // Có itemId thì backend bỏ qua city → không gửi city để query key phản ánh đúng dữ liệu
  const serverFilters: AdminReviewFilters = itemId ? { itemId } : { city: city || undefined };
  const reviewsQuery = useAdminReviews(serverFilters);
  const citiesQuery = useAdminCities();

  const [searchInput, setSearchInput] = useState(filters.q);
  const debouncedSearch = useDebounce(searchInput, 250);
  const lastSyncedSearch = useRef(debouncedSearch);
  useEffect(() => {
    if (debouncedSearch === lastSyncedSearch.current) return;
    lastSyncedSearch.current = debouncedSearch;
    setFilters({ q: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  const reviews = useMemo(() => reviewsQuery.data?.reviews ?? [], [reviewsQuery.data]);
  const typeCounts = useMemo(() => countReviewTypes(reviews), [reviews]);
  const lowCount = useMemo(() => reviews.filter(isLowRating).length, [reviews]);
  const visible = useMemo(
    () => filterReviews(reviews, { q: debouncedSearch, type, rating, sort }),
    [reviews, debouncedSearch, type, rating, sort]
  );
  const pagination = usePagination(visible, { pageSize: PAGE_SIZE });

  const cityNames = useMemo(
    () => new Map((citiesQuery.data?.cities ?? []).map((c) => [c._id, c.name])),
    [citiesQuery.data]
  );
  const cityOptions = useMemo(
    () => [
      { value: '', label: 'Mọi thành phố' },
      ...(citiesQuery.data?.cities ?? [])
        .map((c) => ({ value: c._id, label: c.name }))
        .sort((a, b) => a.label.localeCompare(b.label, 'vi')),
    ],
    [citiesQuery.data]
  );
  const filteredPlaceName = itemId ? (reviews.find((r) => r.itemId?._id === itemId)?.itemId?.name ?? 'địa điểm đã chọn') : '';

  /* ------------------------------ Chọn nhiều ----------------------------- */
  // Giữ lựa chọn khi chuyển trang; đổi bộ lọc → về trang 1 và bỏ chọn (tránh xóa nhầm đánh giá đang bị ẩn)
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const filterKey = `${JSON.stringify(serverFilters)}|${debouncedSearch}|${type}|${rating}|${sort}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (lastFilterKey !== filterKey) {
    setLastFilterKey(filterKey);
    setSelected(new Set());
    pagination.reset();
  }
  const pageIds = pagination.pageItems.map((r) => r._id);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAllOnPage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      pageIds.forEach((id) => (allOnPageSelected ? next.delete(id) : next.add(id)));
      return next;
    });

  /* --------------------------------- Xóa --------------------------------- */
  const [pendingDelete, setPendingDelete] = useState<AdminReview[] | null>(null);
  const deleteReviews = useDeleteReviews();

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteReviews.mutate(
      pendingDelete.map((r) => r._id),
      {
        onSuccess: ({ deleted, failed }) => {
          if (failed) toast.warning(`Đã xóa ${deleted} đánh giá, ${failed} đánh giá chưa xóa được`);
          else toast.success(deleted === 1 ? 'Đã xóa đánh giá' : `Đã xóa ${deleted} đánh giá`);
          setSelected(new Set());
          setPendingDelete(null);
        },
        onError: (error) => toast.error(adminErrorMessage(error, 'Xóa đánh giá thất bại')),
      }
    );
  };

  const clearAll = () => {
    setSearchInput('');
    resetFilters();
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Kiểm duyệt đánh giá"
        description={
          reviewsQuery.data
            ? `${reviews.length} đánh giá${itemId || city ? ' trong phạm vi lọc' : ''} · ${lowCount} đánh giá thấp`
            : 'Rà soát và xóa đánh giá spam, thô tục hoặc không phù hợp'
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={reviewsQuery.isFetching ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />}
            onClick={() => reviewsQuery.refetch()}
            disabled={reviewsQuery.isFetching}
          >
            Làm mới
          </Button>
        }
      />

      <div className="glass admin-toolbar">
        <SegmentedControl
          ariaLabel="Lọc theo loại địa điểm"
          value={type}
          onChange={(value) => setFilters({ type: value })}
          options={TYPE_OPTIONS.map((o) => ({ ...o, count: reviewsQuery.data ? typeCounts[o.value] : undefined }))}
        />
        <label className="admin-search">
          <Search aria-hidden="true" />
          <span className="sr-only">Tìm đánh giá</span>
          <input
            type="search"
            placeholder="Tìm trong nội dung, người viết, địa điểm…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </label>
        <div className="admin-toolbar__select">
          <Select
            aria-label="Lọc theo thành phố"
            value={itemId ? '' : city}
            disabled={!!itemId}
            title={itemId ? 'Đang xem theo một địa điểm cụ thể' : undefined}
            onChange={(e) => setFilters({ city: e.target.value })}
            options={cityOptions}
          />
        </div>
        <div className="admin-toolbar__select admin-toolbar__select--half">
          <Select
            aria-label="Lọc theo số sao"
            value={rating}
            onChange={(e) => setFilters({ rating: e.target.value })}
            options={RATING_OPTIONS}
          />
        </div>
        <div className="admin-toolbar__select admin-toolbar__select--narrow admin-toolbar__select--half">
          <Select
            aria-label="Sắp xếp"
            value={sort}
            onChange={(e) => setFilters({ sort: e.target.value })}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      {itemId && (
        <div className="admin-chip-row">
          <span className="admin-chip">
            Đánh giá của <strong>{filteredPlaceName}</strong>
            <button type="button" onClick={() => setFilters({ itemId: '' })} aria-label="Bỏ lọc theo địa điểm">
              <X />
            </button>
          </span>
        </div>
      )}

      {reviewsQuery.isError ? (
        <div className="glass glass--thick admin-panel">
          <StatusView
            icon={<MessageSquareOff className="w-7 h-7" />}
            title="Không tải được danh sách đánh giá"
            description={adminErrorMessage(reviewsQuery.error)}
            actions={<Button onClick={() => reviewsQuery.refetch()}>Thử lại</Button>}
          />
        </div>
      ) : reviewsQuery.isLoading ? (
        <div className="admin-review-list" aria-busy="true">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="admin-review glass">
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="glass glass--thick admin-panel">
          <EmptyState
            icon={<MessageSquareOff className="w-6 h-6" />}
            title={isFiltered ? 'Không có đánh giá phù hợp' : 'Chưa có đánh giá nào'}
            description={isFiltered ? 'Thử đổi từ khóa hoặc bộ lọc khác.' : undefined}
            action={
              isFiltered ? (
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Xóa bộ lọc
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <div className="admin-bulk-bar">
            <label className="admin-bulk-bar__check">
              <input type="checkbox" checked={allOnPageSelected} onChange={toggleAllOnPage} />
              {selected.size ? `Đã chọn ${selected.size}` : 'Chọn tất cả trên trang'}
            </label>
            <span className="admin-bulk-bar__count">
              {pagination.from}–{pagination.to} / {visible.length} đánh giá
            </span>
            {selected.size > 0 && (
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => setPendingDelete(visible.filter((r) => selected.has(r._id)))}
              >
                Xóa {selected.size} đánh giá
              </Button>
            )}
          </div>

          <div className="admin-review-list">
            {pagination.pageItems.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                cityName={review.itemId ? cityNames.get(review.itemId.city) : undefined}
                selected={selected.has(review._id)}
                onToggleSelect={() => toggle(review._id)}
                onDelete={() => setPendingDelete([review])}
                onFilterPlace={
                  itemId || !review.itemId ? undefined : () => setFilters({ itemId: review.itemId!._id })
                }
              />
            ))}
          </div>

          {pagination.totalPages > 1 && <Pagination pagination={pagination} className="admin-pagination" />}
        </>
      )}

      <ConfirmDialog
        isOpen={!!pendingDelete}
        onClose={() => !deleteReviews.isPending && setPendingDelete(null)}
        onConfirm={confirmDelete}
        isLoading={deleteReviews.isPending}
        title={pendingDelete && pendingDelete.length > 1 ? `Xóa ${pendingDelete.length} đánh giá?` : 'Xóa đánh giá?'}
        confirmText="Xóa"
        message={
          pendingDelete?.length === 1 ? (
            <>
              Đánh giá của <strong>{pendingDelete[0].user?.name ?? 'người dùng đã xóa'}</strong> sẽ bị xóa vĩnh viễn.
            </>
          ) : (
            'Các đánh giá đã chọn sẽ bị xóa vĩnh viễn.'
          )
        }
      >
        {pendingDelete?.length === 1 && <blockquote className="admin-quote">{pendingDelete[0].comment}</blockquote>}
        <p className="admin-confirm-note">Điểm đánh giá của địa điểm liên quan sẽ được tính lại.</p>
      </ConfirmDialog>
    </div>
  );
};
