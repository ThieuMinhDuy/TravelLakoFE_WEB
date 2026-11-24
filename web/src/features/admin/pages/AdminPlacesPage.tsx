import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ImageOff, MapPinOff, MessageSquare, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useDebounce } from '../../../hooks/useDebounce';
import { useLocale } from '../../../contexts/locale/LocaleContext';
import { useToast } from '../../../contexts/toast/ToastContext';
import { Button } from '../../../components/common/Button';
import { RatingStars } from '../../../components/common/RatingStars';
import { Select } from '../../../components/common/Select';
import { StatusView } from '../../../components/common/StatusView';
import { CardImage } from '../../../components/cards/CardImage';
import { ConfirmDialog } from '../../../components/compound/ConfirmDialog';
import { DataTable, type Column } from '../../../components/compound/DataTable';
import { SegmentedControl } from '../../../components/glass';
import type { AdminPlace, PlaceCounts } from '../../../types/admin';
import type { PlaceType } from '../../../types/place';
import { PLACE_TYPE_LABELS, PLACE_TYPES } from '../../../utils/place';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { PlaceFormDrawer } from '../components/places/PlaceFormDrawer';
import { useDeletePlace } from '../hooks/useAdminMutations';
import { useAdminCities, useAdminPlaces, useAdminStats } from '../hooks/useAdminQueries';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { adminErrorMessage } from '../utils/adminErrors';
import { normalizeText } from '../utils/userFilters';
import './css/AdminPages.css';
import './css/AdminPlaces.css';

type PlaceSort = 'name' | 'newest' | 'rating';

const SORT_OPTIONS: { value: PlaceSort; label: string }[] = [
  { value: 'newest', label: 'Mới thêm trước' },
  { value: 'name', label: 'Tên A → Z' },
  { value: 'rating', label: 'Đánh giá cao trước' },
];

/** Khóa số đếm tương ứng trong DashboardStats.places */
const COUNT_KEY: Record<PlaceType, keyof PlaceCounts> = {
  attraction: 'attractions',
  hotel: 'hotels',
  restaurant: 'restaurants',
  cafe: 'cafes',
};

const isPlaceType = (v: string): v is PlaceType => (PLACE_TYPES as readonly string[]).includes(v);

const SORTERS: Record<PlaceSort, (a: AdminPlace, b: AdminPlace) => number> = {
  newest: (a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
  name: (a, b) => a.name.localeCompare(b.name, 'vi'),
  rating: (a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.numReviews ?? 0) - (a.numReviews ?? 0),
};

export const AdminPlacesPage: React.FC = () => {
  useDocumentTitle('Quản lý địa điểm');
  const toast = useToast();
  const { formatCurrency } = useLocale();

  const { filters, setFilters } = useUrlFilters({ type: 'hotel', city: '', q: '', sort: 'newest' });
  const type: PlaceType = isPlaceType(filters.type) ? filters.type : 'hotel';
  const sort = (SORT_OPTIONS.some((o) => o.value === filters.sort) ? filters.sort : 'newest') as PlaceSort;
  const cityId = filters.city;

  const placesQuery = useAdminPlaces(type, cityId);
  const citiesQuery = useAdminCities();
  const statsQuery = useAdminStats();
  const cities = useMemo(() => citiesQuery.data?.cities ?? [], [citiesQuery.data]);

  const [searchInput, setSearchInput] = useState(filters.q);
  const debouncedSearch = useDebounce(searchInput, 250);
  const lastSyncedSearch = useRef(debouncedSearch);
  useEffect(() => {
    if (debouncedSearch === lastSyncedSearch.current) return;
    lastSyncedSearch.current = debouncedSearch;
    setFilters({ q: debouncedSearch });
  }, [debouncedSearch, setFilters]);

  const places = useMemo(() => placesQuery.data?.places ?? [], [placesQuery.data]);
  const visible = useMemo(() => {
    const keyword = normalizeText(debouncedSearch);
    return places
      .filter((p) => !keyword || normalizeText(`${p.name} ${p.address ?? ''}`).includes(keyword))
      .sort(SORTERS[sort]);
  }, [places, debouncedSearch, sort]);

  /* ---------------------------- Form & xóa ---------------------------- */
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPlace | null>(null);
  const [formSession, setFormSession] = useState(0);
  const [deleting, setDeleting] = useState<AdminPlace | null>(null);
  const deletePlace = useDeletePlace();

  const openForm = (place: AdminPlace | null) => {
    setEditing(place);
    setFormSession((n) => n + 1);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deletePlace.mutate(
      { type, id: deleting._id },
      {
        onSuccess: (res) => {
          const trips = res.affectedTrips ?? 0;
          toast.success('Đã xóa địa điểm', {
            description: trips > 0 ? `${deleting.name} được gỡ khỏi ${trips} chuyến đi.` : deleting.name,
          });
          setDeleting(null);
        },
        onError: (error) => toast.error(adminErrorMessage(error, 'Xóa địa điểm thất bại')),
      }
    );
  };

  const cityName = cities.find((c) => c._id === cityId)?.name;
  const cityOptions = useMemo(
    () => [
      { value: '', label: 'Mọi thành phố' },
      ...[...cities].sort((a, b) => a.name.localeCompare(b.name, 'vi')).map((c) => ({ value: c._id, label: c.name })),
    ],
    [cities]
  );

  /* -------------------------------- Cột -------------------------------- */
  const priceCell = (amount: number | undefined, unit: string, freeLabel?: string) =>
    amount === undefined || amount === null ? (
      <span className="admin-muted">—</span>
    ) : amount === 0 && freeLabel ? (
      freeLabel
    ) : (
      <span className="admin-price">
        {formatCurrency(amount)}
        <span className="admin-muted">{unit}</span>
      </span>
    );

  const typeColumns: Record<PlaceType, Column<AdminPlace>[]> = {
    attraction: [{ key: 'fee', header: 'Giá vé', render: (p) => priceCell(p.admissionFee ?? 0, '', 'Miễn phí') }],
    hotel: [
      {
        key: 'stars',
        header: 'Hạng',
        render: (p) => (p.stars ? `${p.stars} sao` : <span className="admin-muted">—</span>),
      },
      { key: 'night', header: 'Giá / đêm', render: (p) => priceCell(p.pricePerNight, '') },
    ],
    restaurant: [
      {
        key: 'cuisine',
        header: 'Ẩm thực',
        className: 'hidden md:table-cell',
        render: (p) => p.cuisineType || <span className="admin-muted">—</span>,
      },
      { key: 'price', header: 'Giá TB', render: (p) => priceCell(p.price, '/người') },
    ],
    cafe: [{ key: 'price', header: 'Giá TB', render: (p) => priceCell(p.price, '/ly') }],
  };

  const columns: Column<AdminPlace>[] = [
    {
      key: 'place',
      header: 'Địa điểm',
      render: (p) => (
        <button type="button" className="admin-place-cell" onClick={() => openForm(p)}>
          <CardImage
            src={p.images?.[0]}
            alt=""
            className="admin-place-cell__thumb"
            fallbackIcon={<ImageOff className="w-4 h-4" />}
          />
          <span className="admin-place-cell__text">
            <span className="admin-place-cell__name">{p.name}</span>
            <span className="admin-place-cell__address">{p.address || 'Chưa có địa chỉ'}</span>
          </span>
        </button>
      ),
    },
    {
      key: 'city',
      header: 'Thành phố',
      className: 'hidden lg:table-cell',
      render: (p) => p.city?.name ?? <span className="admin-muted">—</span>,
    },
    ...typeColumns[type],
    {
      key: 'rating',
      header: 'Đánh giá',
      className: 'hidden md:table-cell',
      render: (p) =>
        p.numReviews ? (
          <RatingStars rating={p.rating} count={p.numReviews} />
        ) : (
          <span className="admin-muted">Chưa có</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'admin-col-actions',
      render: (p) => (
        <div className="admin-row-actions">
          <button type="button" className="admin-icon-btn" onClick={() => openForm(p)} aria-label={`Sửa ${p.name}`} title="Sửa">
            <Pencil />
          </button>
          <Link
            to={`/admin/reviews?itemId=${p._id}`}
            className="admin-icon-btn"
            aria-label={`Đánh giá của ${p.name}`}
            title="Xem đánh giá"
          >
            <MessageSquare />
          </Link>
          <Link
            to={`/places/${type}/${p._id}`}
            target="_blank"
            rel="noreferrer"
            className="admin-icon-btn"
            aria-label={`Mở trang ${p.name} (tab mới)`}
            title="Mở trang địa điểm"
          >
            <ExternalLink />
          </Link>
          <button
            type="button"
            className="admin-icon-btn admin-icon-btn--danger"
            onClick={() => setDeleting(p)}
            aria-label={`Xóa ${p.name}`}
            title="Xóa"
          >
            <Trash2 />
          </button>
        </div>
      ),
    },
  ];

  const stats = statsQuery.data?.places;

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Địa điểm"
        description={
          stats
            ? `${stats.total} địa điểm${cityName ? ` · đang xem ${cityName}` : ''}`
            : 'Điểm tham quan, khách sạn, nhà hàng và quán cafe'
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={placesQuery.isFetching ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />}
              onClick={() => placesQuery.refetch()}
              disabled={placesQuery.isFetching}
            >
              Làm mới
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => openForm(null)}
              disabled={!cities.length}
              title={cities.length ? undefined : 'Cần có ít nhất một thành phố'}
            >
              Thêm {PLACE_TYPE_LABELS[type].toLowerCase()}
            </Button>
          </>
        }
      />

      <div className="glass admin-toolbar">
        <SegmentedControl
          ariaLabel="Loại địa điểm"
          value={type}
          onChange={(value) => setFilters({ type: value })}
          // Số đếm toàn hệ thống (dashboard) — chỉ hiện khi không lọc theo thành phố
          options={PLACE_TYPES.map((t) => ({
            value: t,
            label: PLACE_TYPE_LABELS[t],
            count: stats && !cityId ? stats[COUNT_KEY[t]] : t === type && placesQuery.data ? places.length : undefined,
          }))}
        />
        <label className="admin-search">
          <Search aria-hidden="true" />
          <span className="sr-only">Tìm địa điểm</span>
          <input
            type="search"
            placeholder="Tìm theo tên hoặc địa chỉ…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </label>
        <div className="admin-toolbar__select admin-toolbar__select--half">
          <Select
            aria-label="Lọc theo thành phố"
            value={cityId}
            onChange={(e) => setFilters({ city: e.target.value })}
            options={cityOptions}
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

      {placesQuery.isError ? (
        <div className="glass glass--thick admin-panel">
          <StatusView
            icon={<MapPinOff className="w-7 h-7" />}
            title="Không tải được danh sách địa điểm"
            description={adminErrorMessage(placesQuery.error)}
            actions={<Button onClick={() => placesQuery.refetch()}>Thử lại</Button>}
          />
        </div>
      ) : (
        <DataTable<AdminPlace>
          key={`${type}|${cityId}|${debouncedSearch}|${sort}`}
          columns={columns}
          data={visible}
          isLoading={placesQuery.isLoading}
          searchable={false}
          pageSize={10}
          emptyTitle={
            debouncedSearch ? 'Không tìm thấy địa điểm phù hợp' : `Chưa có ${PLACE_TYPE_LABELS[type].toLowerCase()} nào`
          }
          emptyDescription={
            debouncedSearch ? 'Thử từ khóa khác.' : 'Thêm thủ công hoặc dùng công cụ Import từ OpenStreetMap.'
          }
        />
      )}

      <PlaceFormDrawer
        open={formOpen}
        onClose={() => setFormOpen(false)}
        place={editing}
        type={type}
        defaultCityId={cityId}
        cities={cities}
        sessionKey={formSession}
        onSaved={(savedType) => savedType !== type && setFilters({ type: savedType })}
      />

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => !deletePlace.isPending && setDeleting(null)}
        onConfirm={confirmDelete}
        isLoading={deletePlace.isPending}
        title="Xóa địa điểm?"
        confirmText="Xóa"
        message={
          <>
            <strong>{deleting?.name}</strong> sẽ bị xóa vĩnh viễn.
          </>
        }
      >
        <ul className="admin-consequences">
          <li>Toàn bộ đánh giá của địa điểm này cũng bị xóa.</li>
          <li>Địa điểm bị gỡ khỏi lịch trình của các chuyến đi và danh sách yêu thích của người dùng.</li>
        </ul>
      </ConfirmDialog>
    </div>
  );
};
