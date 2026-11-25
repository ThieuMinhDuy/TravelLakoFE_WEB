import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bot, Plane, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs } from '../../../components/compound/Tabs';
import { ConfirmDialog } from '../../../components/compound/ConfirmDialog';
import { TripCard } from '../../../components/cards/TripCard';
import { CardGridSkeleton } from '../../../components/cards/CardSkeleton';
import { Button } from '../../../components/common/Button';
import { EmptyState } from '../../../components/common/EmptyState';
import { Pagination } from '../../../components/common/Pagination';
import { StatusView } from '../../../components/common/StatusView';
import { buttonVariants } from '../../../components/common/buttonVariants';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { usePagination } from '../../../hooks/usePagination';
import { queryKeys } from '../../../lib/queryKeys';
import { deleteTrip, getMyTrips } from '../../../services/tripService';
import { useAIChatStoreApi } from '../../../store/aiChatStore';
import { useAuthStore } from '../../../store/useAuthStore';
import type { TripStatus, TripWithCity } from '../../../types/trip';
import { TRIP_STATUSES, TRIP_STATUS_LABELS } from '../../../utils/trip';
import { OpenAuthLink } from '../../auth/components/OpenAuthLink';
import { CreateTripModal } from '../components/CreateTripModal';
import './css/TripsPage.css';

const PAGE_SIZE = 8;

const EMPTY_TEXT: Record<TripStatus, string> = {
  upcoming: 'Bạn chưa có chuyến đi nào sắp tới.',
  ongoing: 'Hiện không có chuyến đi nào đang diễn ra.',
  past: 'Bạn chưa hoàn thành chuyến đi nào.',
};

interface TripListGridProps {
  trips: TripWithCity[];
  status: TripStatus;
  onCreateClick: () => void;
  onDeleteRequest: (trip: TripWithCity) => void;
}

const TripListGrid: React.FC<TripListGridProps> = ({
  trips,
  status,
  onCreateClick,
  onDeleteRequest,
}) => {
  const pagination = usePagination(trips, { pageSize: PAGE_SIZE });

  if (trips.length === 0) {
    return (
      <EmptyState
        icon={<Plane className="w-6 h-6" />}
        title={EMPTY_TEXT[status]}
        description="Tạo chuyến đi mới hoặc nhờ Trợ lý AI thiết kế lịch trình trong vài giây."
        action={
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={onCreateClick}>
            Tạo chuyến đi mới
          </Button>
        }
      />
    );
  }

  return (
    <>
      <div className="card-grid">
        {pagination.pageItems.map((trip) => (
          <div key={trip._id} className="trips-card-wrap">
            <TripCard trip={trip} status={status} />
            <button
              type="button"
              className="trips-card-wrap__delete"
              title="Xóa chuyến đi"
              aria-label={`Xóa chuyến đi ${trip.title}`}
              onClick={() => onDeleteRequest(trip)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <Pagination pagination={pagination} className="trips-page__pagination" />
    </>
  );
};

/** Trang quản lý danh sách chuyến đi (/trips) */
export const TripsPage: React.FC = () => {
  useDocumentTitle('Chuyến đi của tôi');

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const chatStore = useAIChatStoreApi();

  const [status, setStatus] = useState<TripStatus | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<TripWithCity | null>(null);

  const tripsQuery = useQuery({
    queryKey: queryKeys.trips.mine(),
    queryFn: getMyTrips,
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTrip(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
      ]);
      toast.success('Đã xóa chuyến đi!');
      setTripToDelete(null);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Không thể xóa chuyến đi.');
    },
  });

  const handleOpenAISuggest = () => {
    chatStore.getState().setActiveAITab('suggest');
    chatStore.getState().setAIPanelOpen(true);
  };

  const handleOpenCreate = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`, {
        state: { backgroundLocation: location },
      });
      return;
    }
    setIsCreateOpen(true);
  };

  const activeStatus =
    status ??
    (tripsQuery.data ? TRIP_STATUSES.find((s) => tripsQuery.data[s].length > 0) : undefined) ??
    'upcoming';

  return (
    <div className="trips-page">
      <div className="trips-page__header">
        <div>
          <h1 className="trips-page__title">Chuyến đi của tôi</h1>
          <p className="trips-page__subtitle">
            Quản lý danh sách chuyến đi, kéo thả sắp xếp địa điểm theo ngày và theo dõi ngân sách.
          </p>
        </div>

        <div className="trips-page__actions">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Bot className="w-4 h-4" />}
            onClick={handleOpenAISuggest}
          >
            Gợi ý bằng AI
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            Tạo chuyến đi mới
          </Button>
        </div>
      </div>

      {!isAuthenticated ? (
        <EmptyState
          icon={<Plane className="w-7 h-7" />}
          title="Đăng nhập để quản lý chuyến đi của bạn"
          description="Lưu lại lịch trình cá nhân, kéo thả địa điểm theo từng ngày và đồng bộ trên mọi thiết bị."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <OpenAuthLink
                to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                className={buttonVariants({ variant: 'primary', size: 'sm' })}
              >
                Đăng nhập ngay
              </OpenAuthLink>
              <Button variant="outline" size="sm" onClick={handleOpenAISuggest}>
                Xem gợi ý bằng AI
              </Button>
            </div>
          }
        />
      ) : tripsQuery.isPending ? (
        <CardGridSkeleton />
      ) : tripsQuery.isError ? (
        <StatusView
          title="Chưa tải được danh sách chuyến đi"
          description={tripsQuery.error.message}
          actions={
            <Button variant="primary" size="sm" onClick={() => void tripsQuery.refetch()}>
              Thử lại
            </Button>
          }
        />
      ) : (
        <Tabs
          value={activeStatus}
          onValueChange={(v) => setStatus(v as TripStatus)}
          variant="pills"
          className="trips-page__tabs"
        >
          <Tabs.List aria-label="Trạng thái chuyến đi">
            {TRIP_STATUSES.map((s) => (
              <Tabs.Tab key={s} value={s} badge={tripsQuery.data[s].length}>
                {TRIP_STATUS_LABELS[s]}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          {TRIP_STATUSES.map((s) => (
            <Tabs.Panel key={s} value={s}>
              <TripListGrid
                trips={tripsQuery.data[s]}
                status={s}
                onCreateClick={handleOpenCreate}
                onDeleteRequest={setTripToDelete}
              />
            </Tabs.Panel>
          ))}
        </Tabs>
      )}

      <CreateTripModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(id) => navigate(`/trips/${id}`)}
      />

      <ConfirmDialog
        isOpen={Boolean(tripToDelete)}
        onClose={() => setTripToDelete(null)}
        onConfirm={() => tripToDelete && deleteMutation.mutate(tripToDelete._id)}
        title="Xóa chuyến đi"
        message={
          tripToDelete
            ? `Bạn có chắc muốn xóa chuyến đi "${tripToDelete.title}"? Thao tác này không thể hoàn tác.`
            : ''
        }
        confirmText="Xóa chuyến đi"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

