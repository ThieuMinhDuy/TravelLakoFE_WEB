import React, { useState } from 'react';
import { ConfirmDialog } from '../../../../components/compound/ConfirmDialog';
import { useToast } from '../../../../contexts/toast/ToastContext';
import type { City } from '../../../../types/city';
import { useDeleteCity } from '../../hooks/useAdminMutations';
import { adminErrorMessage, isCascadeConflict, isCityBlockedByTrips } from '../../utils/adminErrors';

interface DeleteCityDialogProps {
  city: City | null;
  onClose: () => void;
}

/** Bước tiếp theo sau lần gọi DELETE đầu tiên, gắn với thành phố đang xóa */
type Stage =
  | { kind: 'cascade'; cityId: string; message: string; totalPlaces: number }
  /** message của backend đã nêu số chuyến đi ("đang có 2 chuyến đi của người dùng") */
  | { kind: 'blocked'; cityId: string; message: string };

/**
 * Xóa thành phố (tài liệu 09, mục 3.1):
 * 1. Xác nhận → DELETE.
 *    - CITY_HAS_TRIPS: còn chuyến đi của người dùng → báo không thể xóa (backend kiểm tra điều này trước).
 *    - CITY_HAS_PLACES: còn địa điểm → bước 2.
 * 2. Hỏi lại kèm số địa điểm → DELETE ?cascade=true. Vẫn có thể gặp CITY_HAS_TRIPS
 *    nếu có người vừa tạo chuyến đi trong lúc admin xác nhận.
 */
export const DeleteCityDialog: React.FC<DeleteCityDialogProps> = ({ city, onClose }) => {
  const toast = useToast();
  const deleteCity = useDeleteCity();
  const [stage, setStage] = useState<Stage | null>(null);

  // Đổi sang thành phố khác → quay về bước 1
  const active = stage && city && stage.cityId === city._id ? stage : null;

  const close = () => {
    if (deleteCity.isPending) return;
    setStage(null);
    onClose();
  };

  const run = (cascade: boolean) => {
    if (!city) return;
    deleteCity.mutate(
      { id: city._id, cascade },
      {
        onSuccess: (res) => {
          toast.success('Đã xóa thành phố', { description: res.message });
          setStage(null);
          onClose();
        },
        onError: (error) => {
          if (isCityBlockedByTrips(error)) {
            setStage({ kind: 'blocked', cityId: city._id, message: error.message });
          } else if (!cascade && isCascadeConflict(error)) {
            setStage({ kind: 'cascade', cityId: city._id, message: error.message, totalPlaces: error.data.totalPlaces });
          } else {
            toast.error(adminErrorMessage(error, 'Xóa thành phố thất bại'));
          }
        },
      }
    );
  };

  if (active?.kind === 'blocked') {
    return (
      <ConfirmDialog
        isOpen
        onClose={close}
        onConfirm={close}
        hideCancel
        variant="accent"
        title="Không thể xóa thành phố"
        message={active.message}
        confirmText="Đã hiểu"
      >
        <p>Chuyến đi của người dùng không bị xóa theo thành phố, nên thành phố chỉ xóa được khi không còn chuyến đi nào.</p>
      </ConfirmDialog>
    );
  }

  if (active?.kind === 'cascade') {
    return (
      <ConfirmDialog
        isOpen
        onClose={close}
        onConfirm={() => run(true)}
        isLoading={deleteCity.isPending}
        title={`Xóa cả ${active.totalPlaces} địa điểm?`}
        message={active.message}
        confirmText={`Xóa thành phố và ${active.totalPlaces} địa điểm`}
      >
        <ul className="admin-consequences">
          <li>Mọi địa điểm của {city?.name} cùng đánh giá của chúng bị xóa vĩnh viễn.</li>
          <li>Các địa điểm này bị gỡ khỏi danh sách yêu thích và lịch trình chuyến đi của người dùng.</li>
        </ul>
      </ConfirmDialog>
    );
  }

  return (
    <ConfirmDialog
      isOpen={!!city}
      onClose={close}
      onConfirm={() => run(false)}
      isLoading={deleteCity.isPending}
      title="Xóa thành phố?"
      message={
        <>
          Thành phố <strong>{city?.name}</strong> sẽ bị xóa khỏi hệ thống. Nếu thành phố còn địa điểm, bạn sẽ được hỏi
          lại trước khi xóa; nếu còn chuyến đi của người dùng thì không xóa được.
        </>
      }
      confirmText="Xóa"
    />
  );
};
