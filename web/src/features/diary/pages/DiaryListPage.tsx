import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Camera, FileText, Map, Search, Sparkles, X } from 'lucide-react';
import { CardGridSkeleton } from '../../../components/cards/CardSkeleton';
import { Button } from '../../../components/common/Button';
import { EmptyState } from '../../../components/common/EmptyState';
import { Input } from '../../../components/common/Input';
import { Pagination } from '../../../components/common/Pagination';
import { StatusView } from '../../../components/common/StatusView';
import { buttonVariants } from '../../../components/common/buttonVariants';
import { Tabs } from '../../../components/compound/Tabs';
import { useLocale } from '../../../contexts/locale/LocaleContext';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { usePagination } from '../../../hooks/usePagination';
import { DiaryTripCard } from '../components/DiaryTripCard';
import { useDiaryTrips } from '../hooks/useTripDiary';
import {
  DIARY_FILTERS,
  DIARY_FILTER_LABELS,
  type DiaryFilter,
  computeDiaryStats,
  filterDiaryTrips,
  getPastTripsForDiary,
  getPastTripsNeedingDiary,
} from '../utils/diaryHelpers';
import './css/DiaryPage.css';

const PAGE_SIZE = 8;

/** Trang danh sách Nhật ký chuyến đi (/diary) — hiển thị các chuyến đã đi */
export const DiaryListPage: React.FC = () => {
  useDocumentTitle('Nhật ký chuyến đi');

  const { formatDate } = useLocale();
  const tripsQuery = useDiaryTrips(true);

  const [filter, setFilter] = useState<DiaryFilter>('all');
  const [search, setSearch] = useState('');

  const pastTrips = useMemo(() => getPastTripsForDiary(tripsQuery.data), [tripsQuery.data]);
  const needingDiary = useMemo(() => getPastTripsNeedingDiary(tripsQuery.data), [tripsQuery.data]);
  const stats = useMemo(() => computeDiaryStats(pastTrips), [pastTrips]);
  const filteredTrips = useMemo(
    () => filterDiaryTrips(pastTrips, { filter, search }),
    [pastTrips, filter, search]
  );

  const pagination = usePagination(filteredTrips, { pageSize: PAGE_SIZE });

  const handleFilterChange = (next: string) => {
    setFilter(next as DiaryFilter);
    pagination.reset();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    pagination.reset();
  };

  const handleClearFilters = () => {
    setFilter('all');
    setSearch('');
    pagination.reset();
  };

  const filterBadges: Record<DiaryFilter, number> = {
    all: stats.totalPastTrips,
    unwritten: stats.unwrittenCount,
    written: stats.writtenCount,
  };

  const latestPending = needingDiary[0];

  return (
    <div className="diary-page">
      <div className="diary-list__header">
        <div>
          <h1 className="diary-list__title">Nhật ký chuyến đi</h1>
          <p className="diary-list__subtitle">
            Lưu giữ cảm xúc, trải nghiệm và những bức ảnh kỷ niệm từ các chuyến đi đã hoàn thành.
          </p>
        </div>

        {pastTrips.length > 0 && (
          <div className="diary-list__stats" aria-label="Thống kê nhật ký">
            <span className="diary-stat-chip">
              <Map className="w-3.5 h-3.5 text-[#FA8B02]" aria-hidden="true" />
              {stats.totalPastTrips} chuyến đã đi
            </span>
            <span className="diary-stat-chip">
              <FileText className="w-3.5 h-3.5 text-[#0D9488]" aria-hidden="true" />
              {stats.writtenCount} đã viết
            </span>
            <span className="diary-stat-chip">
              <Camera className="w-3.5 h-3.5 text-[#FA8B02]" aria-hidden="true" />
              {stats.totalPhotos} ảnh kỷ niệm
            </span>
          </div>
        )}
      </div>

      {tripsQuery.isPending ? (
        <CardGridSkeleton />
      ) : tripsQuery.isError ? (
        <StatusView
          title="Chưa tải được danh sách nhật ký"
          description={tripsQuery.error.message}
          actions={
            <Button variant="primary" size="sm" onClick={() => void tripsQuery.refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : pastTrips.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-7 h-7" />}
          title="Bạn chưa có chuyến đi nào đã hoàn thành"
          description="Khi một chuyến đi kết thúc, chuyến đi sẽ xuất hiện tại đây để bạn viết nhật ký và tải lên tối đa 10 bức ảnh kỷ niệm."
          action={
            <Link to="/trips" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
              Xem lịch trình của tôi
            </Link>
          }
        />
      ) : (
        <>
          {latestPending && (
            <section className="diary-prompt-banner" aria-label="Gợi ý viết nhật ký">
              <div className="diary-prompt-banner__content">
                <div className="diary-prompt-banner__icon" aria-hidden="true">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="diary-prompt-banner__title">
                    Chuyến đi &ldquo;{latestPending.title}&rdquo; đã hoàn thành!
                  </h2>
                  <p className="diary-prompt-banner__desc">
                    Kết thúc ngày {formatDate(latestPending.endDate)} — hãy ghi lại cảm nhận và ảnh
                    kỷ niệm trước khi quên nhé
                    {needingDiary.length > 1
                      ? ` (còn ${needingDiary.length - 1} chuyến khác chưa viết).`
                      : '.'}
                  </p>
                </div>
              </div>

              <Link
                to={`/trips/${latestPending._id}/diary`}
                className={buttonVariants({ variant: 'primary', size: 'sm' })}
              >
                Viết nhật ký ngay
              </Link>
            </section>
          )}

          <div className="diary-list__toolbar">
            <Tabs value={filter} onValueChange={handleFilterChange} variant="pills">
              <Tabs.List aria-label="Trạng thái viết nhật ký">
                {DIARY_FILTERS.map((key) => (
                  <Tabs.Tab key={key} value={key} badge={filterBadges[key]}>
                    {DIARY_FILTER_LABELS[key]}
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs>

            <div className="diary-list__search">
              <Input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Tìm theo tên chuyến đi, thành phố, ghi chú..."
                aria-label="Tìm kiếm nhật ký chuyến đi"
                leftIcon={<Search className="w-4 h-4" />}
                rightIcon={
                  search ? (
                    <button
                      type="button"
                      className="diary-list__clear-btn"
                      onClick={() => handleSearchChange('')}
                      aria-label="Xóa từ khóa tìm kiếm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : undefined
                }
              />
            </div>
          </div>

          {filteredTrips.length === 0 ? (
            <EmptyState
              icon={<Search className="w-6 h-6" />}
              title="Không tìm thấy chuyến đi phù hợp"
              description="Thử đổi từ khóa tìm kiếm hoặc chuyển sang bộ lọc khác."
              action={
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Xóa bộ lọc
                </Button>
              }
            />
          ) : (
            <>
              <div className="card-grid">
                {pagination.pageItems.map((trip) => (
                  <DiaryTripCard key={trip._id} trip={trip} />
                ))}
              </div>
              <Pagination pagination={pagination} className="diary-list__pagination" />
            </>
          )}
        </>
      )}
    </div>
  );
};

