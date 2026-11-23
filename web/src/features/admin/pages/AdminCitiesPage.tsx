import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, DownloadCloud, Plus, RefreshCw, Search } from 'lucide-react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Button } from '../../../components/common/Button';
import { buttonVariants } from '../../../components/common/buttonVariants';
import { EmptyState } from '../../../components/common/EmptyState';
import { Select } from '../../../components/common/Select';
import { Skeleton } from '../../../components/common/Skeleton';
import { StatusView } from '../../../components/common/StatusView';
import type { City } from '../../../types/city';
import { AdminPageHeader } from '../components/AdminPageHeader';
import { CityCard } from '../components/cities/CityCard';
import { CityFormDrawer } from '../components/cities/CityFormDrawer';
import { DeleteCityDialog } from '../components/cities/DeleteCityDialog';
import { useAdminCities } from '../hooks/useAdminQueries';
import { useUrlFilters } from '../hooks/useUrlFilters';
import { adminErrorMessage } from '../utils/adminErrors';
import { normalizeText } from '../utils/userFilters';
import './css/AdminPages.css';
import './css/AdminCities.css';

type CitySort = 'name' | 'newest';

const SORT_OPTIONS: { value: CitySort; label: string }[] = [
  { value: 'name', label: 'Tên A → Z' },
  { value: 'newest', label: 'Mới thêm trước' },
];

export const AdminCitiesPage: React.FC = () => {
  useDocumentTitle('Quản lý thành phố');
  const citiesQuery = useAdminCities();
  const { filters, setFilters } = useUrlFilters({ q: '', sort: 'name' });
  const sort: CitySort = filters.sort === 'newest' ? 'newest' : 'name';

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<City | null>(null);
  const [formSession, setFormSession] = useState(0);
  const [deleting, setDeleting] = useState<City | null>(null);

  const cities = useMemo(() => citiesQuery.data?.cities ?? [], [citiesQuery.data]);
  const visible = useMemo(() => {
    const keyword = normalizeText(filters.q);
    return cities
      .filter((c) => !keyword || normalizeText(`${c.name} ${c.description ?? ''}`).includes(keyword))
      .sort((a, b) =>
        sort === 'name' ? a.name.localeCompare(b.name, 'vi') : (b.createdAt ?? '').localeCompare(a.createdAt ?? '')
      );
  }, [cities, filters.q, sort]);

  const openForm = (city: City | null) => {
    setEditing(city);
    setFormSession((n) => n + 1);
    setFormOpen(true);
  };

  return (
    <div className="admin-page">
      <AdminPageHeader
        title="Thành phố"
        description={citiesQuery.data ? `${cities.length} thành phố trong hệ thống` : 'Quản lý các thành phố du lịch'}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={citiesQuery.isFetching ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />}
              onClick={() => citiesQuery.refetch()}
              disabled={citiesQuery.isFetching}
            >
              Làm mới
            </Button>
            <Link to="/admin/import" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              <DownloadCloud className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Import từ OSM
            </Link>
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => openForm(null)}>
              Thêm thành phố
            </Button>
          </>
        }
      />

      <div className="glass admin-toolbar">
        <label className="admin-search">
          <Search aria-hidden="true" />
          <span className="sr-only">Tìm thành phố</span>
          <input
            type="search"
            placeholder="Tìm theo tên hoặc mô tả…"
            value={filters.q}
            onChange={(e) => setFilters({ q: e.target.value })}
          />
        </label>
        <div className="admin-toolbar__select admin-toolbar__select--narrow">
          <Select
            aria-label="Sắp xếp"
            value={sort}
            onChange={(e) => setFilters({ sort: e.target.value })}
            options={SORT_OPTIONS}
          />
        </div>
      </div>

      {citiesQuery.isError ? (
        <div className="glass glass--thick admin-panel">
          <StatusView
            icon={<Building2 className="w-7 h-7" />}
            title="Không tải được danh sách thành phố"
            description={adminErrorMessage(citiesQuery.error)}
            actions={<Button onClick={() => citiesQuery.refetch()}>Thử lại</Button>}
          />
        </div>
      ) : citiesQuery.isLoading ? (
        <div className="admin-city-grid" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="admin-city glass">
              <Skeleton className="admin-city__img" />
              <div className="admin-city__body">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="glass glass--thick admin-panel">
          <EmptyState
            icon={<Building2 className="w-6 h-6" />}
            title={filters.q ? 'Không tìm thấy thành phố' : 'Chưa có thành phố nào'}
            description={filters.q ? 'Thử từ khóa khác.' : 'Thêm thành phố thủ công hoặc import từ OpenStreetMap.'}
            action={
              filters.q ? undefined : (
                <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => openForm(null)}>
                  Thêm thành phố
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="admin-city-grid">
          {visible.map((city) => (
            <CityCard key={city._id} city={city} onEdit={() => openForm(city)} onDelete={() => setDeleting(city)} />
          ))}
        </div>
      )}

      <CityFormDrawer open={formOpen} onClose={() => setFormOpen(false)} city={editing} sessionKey={formSession} />
      <DeleteCityDialog city={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
};
