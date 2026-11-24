import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Plane } from 'lucide-react';
import { Tabs } from '../../../../components/compound/Tabs';
import { TripCard } from '../../../../components/cards/TripCard';
import { CardGridSkeleton } from '../../../../components/cards/CardSkeleton';
import { EmptyState } from '../../../../components/common/EmptyState';
import { Pagination } from '../../../../components/common/Pagination';
import { buttonVariants } from '../../../../components/common/buttonVariants';
import { usePagination } from '../../../../hooks/usePagination';
import { TRIP_STATUSES, TRIP_STATUS_LABELS } from '../../../../utils/trip';
import type { Trip, TripStatus } from '../../../../types/trip';
import { useMyTrips } from '../../hooks/useProfileData';
import { TabError } from './TabError';

const PAGE_SIZE = 8;

const EMPTY_TEXT: Record<TripStatus, string> = {
  upcoming: 'Bạn chưa có chuyến đi nào sắp tới.',
  ongoing: 'Hiện không có chuyến đi nào đang diễn ra.',
  past: 'Bạn chưa hoàn thành chuyến đi nào.',
};

const TripGrid: React.FC<{ trips: Trip[]; status: TripStatus }> = ({ trips, status }) => {
  const pagination = usePagination(trips, { pageSize: PAGE_SIZE });

  if (trips.length === 0) {
    return (
      <EmptyState
        icon={<Plane className="w-6 h-6" />}
        title={EMPTY_TEXT[status]}
        description="Lên kế hoạch cho hành trình tiếp theo chỉ trong vài phút."
        action={
          <Link to="/trips" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
            <Plus className="w-4 h-4" />
            Tạo chuyến đi
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="card-grid">
        {pagination.pageItems.map((trip) => (
          <TripCard key={trip._id} trip={trip} status={status} />
        ))}
      </div>
      <Pagination pagination={pagination} className="profile-tab__pagination" />
    </>
  );
};

/** Tab "Chuyến đi": 3 nhóm Sắp đi / Đang đi / Đã đi theo phân loại của backend */
export const TripsTab: React.FC = () => {
  const { data, isPending, isError, error, refetch } = useMyTrips();
  // Mặc định mở nhóm đầu tiên có dữ liệu
  const [status, setStatus] = useState<TripStatus | null>(null);

  if (isPending) return <CardGridSkeleton />;
  if (isError) return <TabError message={error.message} onRetry={() => void refetch()} />;

  const activeStatus = status ?? TRIP_STATUSES.find((s) => data[s].length > 0) ?? 'upcoming';

  return (
    <Tabs value={activeStatus} onValueChange={(v) => setStatus(v as TripStatus)} variant="pills">
      <div className="profile-tab__toolbar">
        <Tabs.List aria-label="Trạng thái chuyến đi">
          {TRIP_STATUSES.map((s) => (
            <Tabs.Tab key={s} value={s} badge={data[s].length}>
              {TRIP_STATUS_LABELS[s]}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        <Link to="/trips" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <Plus className="w-4 h-4" />
          Tạo chuyến đi
        </Link>
      </div>

      {TRIP_STATUSES.map((s) => (
        <Tabs.Panel key={s} value={s}>
          <TripGrid trips={data[s]} status={s} />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
};
