import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Compass,
  DownloadCloud,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Plus,
  RefreshCw,
  Users,
} from 'lucide-react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useLocale } from '../../../contexts/locale/LocaleContext';
import { Avatar } from '../../../components/common/Avatar';
import { Button } from '../../../components/common/Button';
import { RatingStars } from '../../../components/common/RatingStars';
import { Skeleton } from '../../../components/common/Skeleton';
import { StatusView } from '../../../components/common/StatusView';
import { SegmentedControl } from '../../../components/glass';
import { useAuthStore } from '../../../store/useAuthStore';
import { PLACE_TYPE_LABELS } from '../../../utils/place';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { ColumnChart } from '../components/dashboard/ColumnChart';
import { RankedBars } from '../components/dashboard/RankedBars';
import { useAdminCities, useAdminReviews, useAdminStats, useAdminUsers } from '../hooks/useAdminQueries';
import { adminErrorMessage } from '../utils/adminErrors';
import {
  countByMonth,
  countThisMonth,
  ratingDistribution,
  topCitiesByReviews,
  type RankedItem,
} from '../utils/dashboardStats';
import { isLowRating } from '../utils/reviewFilters';
import './css/AdminPages.css';
import './css/AdminDashboard.css';

type Range = '6' | '12';

const RANGE_OPTIONS = [
  { value: '6' as Range, label: '6 tháng' },
  { value: '12' as Range, label: '12 tháng' },
];

export const AdminDashboardPage: React.FC = () => {
  useDocumentTitle('Bảng điều khiển');
  const { formatNumber, formatDateTime } = useLocale();
  const adminName = useAuthStore((s) => s.user?.name);
  const [range, setRange] = useState<Range>('6');

  const statsQuery = useAdminStats();
  // Tận dụng cùng cache với trang Người dùng / Đánh giá — mở các trang đó sau sẽ không tải lại
  const usersQuery = useAdminUsers();
  const reviewsQuery = useAdminReviews();
  const citiesQuery = useAdminCities();

  const stats = statsQuery.data;
  const users = useMemo(() => usersQuery.data?.users ?? [], [usersQuery.data]);
  const reviews = useMemo(() => reviewsQuery.data?.reviews ?? [], [reviewsQuery.data]);
  const cities = useMemo(() => citiesQuery.data?.cities ?? [], [citiesQuery.data]);

  const months = Number(range);
  const userSeries = useMemo(() => countByMonth(users.map((u) => u.createdAt), months), [users, months]);
  const reviewSeries = useMemo(() => countByMonth(reviews.map((r) => r.createdAt), months), [reviews, months]);
  const newUsers = useMemo(() => countThisMonth(users.map((u) => u.createdAt)), [users]);
  const newReviews = useMemo(() => countThisMonth(reviews.map((r) => r.createdAt)), [reviews]);
  const topCities = useMemo(() => topCitiesByReviews(reviews, cities), [reviews, cities]);
  const ratings = useMemo(() => ratingDistribution(reviews), [reviews]);
  const latestReviews = useMemo(
    () => [...reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [reviews]
  );
  const lowCount = useMemo(() => reviews.filter(isLowRating).length, [reviews]);

  const placeTypes: RankedItem[] = stats
    ? (
        [
          ['hotel', stats.places.hotels],
          ['attraction', stats.places.attractions],
          ['restaurant', stats.places.restaurants],
          ['cafe', stats.places.cafes],
        ] as const
      )
        .map(([type, value]) => ({ key: type, label: PLACE_TYPE_LABELS[type], value, href: `/admin/places?type=${type}` }))
        .sort((a, b) => b.value - a.value)
    : [];

  const refetchAll = () => {
    void statsQuery.refetch();
    void usersQuery.refetch();
    void reviewsQuery.refetch();
    void citiesQuery.refetch();
  };
  const fetching = statsQuery.isFetching || usersQuery.isFetching || reviewsQuery.isFetching;

  if (statsQuery.isError) {
    return (
      <div className="admin-page">
        <AdminPageHeader title="Bảng điều khiển" />
        <div className="glass glass--thick admin-panel">
          <StatusView
            icon={<LayoutDashboard className="w-7 h-7" />}
            title="Không tải được số liệu"
            description={adminErrorMessage(statsQuery.error)}
            actions={<Button onClick={refetchAll}>Thử lại</Button>}
          />
        </div>
      </div>
    );
  }

  const tiles = [
    {
      label: 'Người dùng',
      value: stats?.users,
      icon: Users,
      href: '/admin/users',
      delta: usersQuery.data ? `+${newUsers} trong tháng này` : undefined,
    },
    { label: 'Chuyến đi', value: stats?.trips, icon: Compass, delta: 'Do người dùng lên kế hoạch' },
    {
      label: 'Địa điểm',
      value: stats?.places.total,
      icon: MapPin,
      href: '/admin/places',
      delta: citiesQuery.data ? `Tại ${cities.length} thành phố` : undefined,
    },
    {
      label: 'Đánh giá',
      value: stats?.reviews,
      icon: MessageSquare,
      href: '/admin/reviews',
      delta: reviewsQuery.data ? `+${newReviews} trong tháng này` : undefined,
    },
  ];

  return (
    <div className="admin-page">
      <AdminPageHeader
        title={adminName ? `Xin chào, ${adminName}` : 'Bảng điều khiển'}
        description="Tổng quan hoạt động của TripMate"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={fetching ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />}
              onClick={refetchAll}
              disabled={fetching}
            >
              Làm mới
            </Button>
            <Link to="/admin/import" className="admin-quick-link">
              <DownloadCloud aria-hidden="true" />
              Import dữ liệu
            </Link>
          </>
        }
      />

      {/* Hàng số liệu */}
      <div className="admin-stats-grid">
        {tiles.map(({ label, value, icon: Icon, href, delta }) => {
          const body = (
            <>
              <span className="admin-stat-card__icon">
                <Icon />
              </span>
              <span className="admin-stat-card__text">
                <span className="admin-stat-card__label">{label}</span>
                {value === undefined ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <span className="admin-stat-card__value">{formatNumber(value)}</span>
                )}
                {delta && <span className="admin-stat-card__delta">{delta}</span>}
              </span>
            </>
          );
          return href ? (
            <Link key={label} to={href} className="admin-stat-card glass glass--interactive">
              {body}
            </Link>
          ) : (
            <div key={label} className="admin-stat-card glass">
              {body}
            </div>
          );
        })}
      </div>

      {/* Biểu đồ theo tháng — bộ chọn khoảng thời gian nằm trên, áp cho cả hai biểu đồ */}
      <section className="admin-dash-section" aria-labelledby="dash-trend">
        <div className="admin-dash-section__head">
          <h2 id="dash-trend">Hoạt động theo tháng</h2>
          <SegmentedControl ariaLabel="Khoảng thời gian" value={range} onChange={setRange} options={RANGE_OPTIONS} />
        </div>
        <div className="admin-dash-grid admin-dash-grid--2">
          <article className="admin-dash-card glass">
            <header>
              <h3>Người dùng mới</h3>
              <p>{range} tháng gần nhất</p>
            </header>
            {usersQuery.isLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <ColumnChart data={userSeries} unit="người dùng mới" ariaLabel={`Người dùng mới, ${range} tháng gần nhất`} />
            )}
          </article>
          <article className="admin-dash-card glass">
            <header>
              <h3>Đánh giá mới</h3>
              <p>{range} tháng gần nhất</p>
            </header>
            {reviewsQuery.isLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <ColumnChart data={reviewSeries} unit="đánh giá mới" ariaLabel={`Đánh giá mới, ${range} tháng gần nhất`} />
            )}
          </article>
        </div>
      </section>

      {/* Phân bố */}
      <div className="admin-dash-grid admin-dash-grid--3">
        <article className="admin-dash-card glass">
          <header>
            <h3>Địa điểm theo loại</h3>
            <p>{stats ? `${formatNumber(stats.places.total)} địa điểm` : ' '}</p>
          </header>
          {stats ? <RankedBars items={placeTypes} unit="địa điểm" /> : <Skeleton className="h-36 w-full" />}
        </article>
        <article className="admin-dash-card glass">
          <header>
            <h3>Thành phố nhiều đánh giá nhất</h3>
            <p>Top 5</p>
          </header>
          {reviewsQuery.isLoading || citiesQuery.isLoading ? (
            <Skeleton className="h-36 w-full" />
          ) : (
            <RankedBars items={topCities} unit="đánh giá" emptyText="Chưa có đánh giá nào" />
          )}
        </article>
        <article className="admin-dash-card glass">
          <header>
            <h3>Phân bố số sao</h3>
            <p>{lowCount ? `${lowCount} đánh giá ≤ 2 sao cần xem` : 'Không có đánh giá thấp'}</p>
          </header>
          {reviewsQuery.isLoading ? (
            <Skeleton className="h-36 w-full" />
          ) : (
            <RankedBars items={ratings} unit="đánh giá" emptyText="Chưa có đánh giá nào" />
          )}
        </article>
      </div>

      {/* Đánh giá mới nhất + lối tắt */}
      <div className="admin-dash-grid admin-dash-grid--wide">
        <article className="admin-dash-card glass">
          <header className="admin-dash-card__head-row">
            <div>
              <h3>Đánh giá mới nhất</h3>
              <p>Rà soát nhanh nội dung vừa đăng</p>
            </div>
            <Link to="/admin/reviews" className="admin-link-btn admin-dash-more">
              Xem tất cả <ArrowRight aria-hidden="true" />
            </Link>
          </header>
          {reviewsQuery.isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : latestReviews.length ? (
            <ul className="admin-latest">
              {latestReviews.map((r) => (
                <li key={r._id}>
                  <Avatar src={r.user?.avatar} name={r.user?.name ?? '?'} size="sm" />
                  <div className="admin-latest__body">
                    <div className="admin-latest__meta">
                      <strong>{r.user?.name ?? 'Người dùng đã xóa'}</strong>
                      <RatingStars rating={r.rating} />
                      <time dateTime={r.createdAt}>{formatDateTime(r.createdAt)}</time>
                    </div>
                    <p className="admin-latest__comment">{r.comment}</p>
                    <span className="admin-latest__place">{r.itemId?.name ?? 'Địa điểm đã xóa'}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-ranked__empty">Chưa có đánh giá nào</p>
          )}
        </article>

        <article className="admin-dash-card glass">
          <header>
            <h3>Thao tác nhanh</h3>
          </header>
          <nav className="admin-shortcuts" aria-label="Thao tác nhanh">
            <Link to="/admin/places">
              <Plus aria-hidden="true" />
              Thêm địa điểm
            </Link>
            <Link to="/admin/cities">
              <Building2 aria-hidden="true" />
              Quản lý thành phố
            </Link>
            <Link to="/admin/reviews?rating=low">
              <MessageSquare aria-hidden="true" />
              Đánh giá thấp
              {lowCount > 0 && <span className="admin-shortcuts__count">{lowCount}</span>}
            </Link>
            <Link to="/admin/users?group=blocked">
              <Users aria-hidden="true" />
              Tài khoản bị khóa
            </Link>
            <Link to="/admin/import">
              <DownloadCloud aria-hidden="true" />
              Import từ OpenStreetMap
            </Link>
          </nav>
        </article>
      </div>
    </div>
  );
};
