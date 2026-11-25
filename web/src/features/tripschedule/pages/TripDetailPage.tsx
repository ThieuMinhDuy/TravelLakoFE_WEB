import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ExternalLink, MapPin, Pencil, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { Spinner } from '../../../components/common/Spinner';
import { StatusView } from '../../../components/common/StatusView';
import { ConfirmDialog } from '../../../components/compound/ConfirmDialog';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { queryKeys } from '../../../lib/queryKeys';
import { deleteTrip, getTripById } from '../../../services/tripService';
import { useAIChatStoreApi } from '../../../store/aiChatStore';
import { useAppDispatch, useAppSelector } from '../../../store/reduxStore';
import { selectCurrentTrip } from '../../../store/tripSelectors';
import { setCurrentTrip } from '../../../store/tripSlice';
import type { City } from '../../../types/city';
import { extractPlaceCost, type PopulatedPlaceInSchedule } from '../../../types/trip';
import { formatCurrencyVND } from '../../../utils/formatters';
import { toPlaceType } from '../../../utils/place';
import { AddPlaceModal } from '../components/AddPlaceModal';
import { EditTripModal } from '../components/EditTripModal';
import { TripSchedule } from '../components/TripSchedule';
import './css/TripsPage.css';

/** Trang chi tiết lịch trình chuyến đi (/trips/:id) */
export const TripDetailPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const chatStore = useAIChatStoreApi();
  const storeTrip = useAppSelector(selectCurrentTrip);

  const [addPlaceDay, setAddPlaceDay] = useState<number | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PopulatedPlaceInSchedule | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const tripQuery = useQuery({
    queryKey: queryKeys.trips.detail(id),
    queryFn: () => getTripById(id),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (tripQuery.data) {
      dispatch(setCurrentTrip(tripQuery.data));
    }
  }, [tripQuery.data, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(setCurrentTrip(null));
    };
  }, [dispatch]);

  const trip = storeTrip && storeTrip._id === id ? storeTrip : tripQuery.data;
  useDocumentTitle(trip?.title ? `${trip.title} · Lịch trình` : 'Chi tiết chuyến đi');

  const deleteMutation = useMutation({
    mutationFn: () => deleteTrip(id),
    onSuccess: async () => {
      dispatch(setCurrentTrip(null));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.trips.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.profile }),
      ]);
      toast.success('Đã xóa chuyến đi!');
      navigate('/trips', { replace: true });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Không thể xóa chuyến đi.');
    },
  });

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết lịch trình!');
    } catch {
      toast.info('Hãy sao chép đường dẫn trên thanh địa chỉ để chia sẻ.');
    }
  };

  const handleOpenAI = () => {
    chatStore.getState().setActiveAITab('optimize');
    chatStore.getState().setAIPanelOpen(true);
  };

  if (tripQuery.isPending && !trip) {
    return (
      <div className="trip-detail-page flex justify-center py-20">
        <Spinner size="lg" className="text-[#FA8B02]" />
      </div>
    );
  }

  if (tripQuery.isError || !trip) {
    return (
      <div className="trip-detail-page">
        <StatusView
          title="Không tìm thấy chuyến đi"
          description={tripQuery.error?.message || 'Chuyến đi không tồn tại hoặc bạn không có quyền xem.'}
          actions={
            <div className="flex flex-wrap gap-2 justify-center">
              <Button variant="primary" size="sm" onClick={() => void tripQuery.refetch()}>
                Thử lại
              </Button>
              <Link to="/trips" className="text-sm font-semibold text-[#9A4E00] underline self-center">
                Quay về danh sách
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const cityObj = typeof trip.city === 'object' && trip.city !== null ? (trip.city as City) : null;
  const selectedPlaceObj =
    selectedPlace && typeof selectedPlace.placeId === 'object' && selectedPlace.placeId !== null
      ? selectedPlace.placeId
      : null;

  return (
    <div className="trip-detail-page">
      <div className="trip-detail-page__topbar">
        <Link to="/trips" className="trip-detail-page__back">
          <ArrowLeft className="w-4 h-4" />
          Tất cả chuyến đi
        </Link>

        <div className="trip-detail-page__actions">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Pencil className="w-3.5 h-3.5" />}
            onClick={() => setIsEditOpen(true)}
          >
            Chỉnh sửa
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => setIsDeleteOpen(true)}
          >
            Xóa
          </Button>
        </div>
      </div>

      <TripSchedule
        trip={trip}
        onPlaceClick={(place) => setSelectedPlace(place)}
        onAddPlaceClick={(dayNumber) => setAddPlaceDay(dayNumber)}
        onShareClick={() => void handleShare()}
        onOpenAI={handleOpenAI}
      />

      <AddPlaceModal
        isOpen={addPlaceDay !== null}
        onClose={() => setAddPlaceDay(null)}
        tripId={trip._id}
        cityId={cityObj?._id}
        cityName={cityObj?.name}
        dayNumber={addPlaceDay ?? 1}
      />

      <EditTripModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        trip={trip}
      />

      <Modal
        isOpen={Boolean(selectedPlace)}
        onClose={() => setSelectedPlace(null)}
        title={selectedPlaceObj?.name || 'Chi tiết địa điểm'}
        maxWidth="md"
      >
        {selectedPlace && (
          <div className="space-y-3 text-sm">
            {selectedPlaceObj?.images?.[0] && (
              <img
                src={selectedPlaceObj.images[0]}
                alt={selectedPlaceObj.name}
                className="w-full h-48 object-cover rounded-xl"
              />
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600">
              <span className="px-2.5 py-1 rounded-full bg-zinc-100 font-semibold text-zinc-800">
                {selectedPlace.placeType}
              </span>
              {typeof selectedPlaceObj?.rating === 'number' && selectedPlaceObj.rating > 0 && (
                <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  {selectedPlaceObj.rating.toFixed(1)}
                </span>
              )}
              <span className="font-semibold text-zinc-800">
                Chi phí ước tính:{' '}
                {formatCurrencyVND(extractPlaceCost(selectedPlace, trip.schedule.length || 1))}
              </span>
            </div>

            {selectedPlaceObj?.address && (
              <p className="text-xs text-zinc-600 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 shrink-0 text-zinc-400" />
                <span>{selectedPlaceObj.address}</span>
              </p>
            )}

            {selectedPlace.note && (
              <p className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                Ghi chú: {selectedPlace.note}
              </p>
            )}

            {selectedPlaceObj?._id && (
              <div className="pt-2 flex justify-end">
                <Link
                  to={`/places/${toPlaceType(selectedPlace.placeType)}/${selectedPlaceObj._id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9A4E00] hover:underline"
                >
                  Xem trang địa điểm
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Xóa chuyến đi"
        message={`Bạn có chắc muốn xóa chuyến đi "${trip.title}"? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa chuyến đi"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

