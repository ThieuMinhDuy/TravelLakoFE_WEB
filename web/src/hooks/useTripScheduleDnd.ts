import { useCallback } from 'react';
import { DropResult, DragStart } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { useAppDispatch } from '../store/reduxStore';
import {
  saveDndSnapshot,
  reorderPlacesOptimistic,
  reorderScheduleThunk,
  removePlaceOptimistic,
  removePlaceThunk,
  checkInPlaceOptimistic,
  checkInPlaceThunk,
} from '../store/tripSlice';
import { useTripUIStoreApi } from '../store/tripUIStore';
import { TripDetail } from '../types/trip';

export interface UseTripScheduleDndProps {
  trip: TripDetail;
}

/**
 * Hook điều phối toàn bộ nghiệp vụ kéo thả lịch trình (DnD) và thao tác địa điểm:
 * 1. Lưu snapshot trước khi kéo để phục vụ rollback.
 * 2. Cập nhật tức thì 0ms trên giao diện (Optimistic UI Update).
 * 3. Đồng bộ bất đồng bộ lên BE qua reorderScheduleThunk.
 * 4. Tự động phục hồi (rollback) và hiển thị thông báo lỗi qua Toast nếu mạng/API thất bại.
 */
export function useTripScheduleDnd({ trip }: UseTripScheduleDndProps) {
  const dispatch = useAppDispatch();
  const uiStore = useTripUIStoreApi();

  /** Bắt đầu kéo card địa điểm */
  const onDragStart = useCallback(
    (_start: DragStart) => {
      dispatch(saveDndSnapshot());
      uiStore.getState().setIsDragging(true);
    },
    [dispatch, uiStore]
  );

  /** Kết thúc thao tác kéo thả */
  const onDragEnd = useCallback(
    async (result: DropResult) => {
      uiStore.getState().setIsDragging(false);

      const { source, destination } = result;

      // Người dùng thả ra ngoài vùng cho phép
      if (!destination) {
        return;
      }

      // Vị trí không thay đổi (thả lại đúng chỗ cũ trong cùng một ngày)
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      const sourceDayId = source.droppableId;
      const destinationDayId = destination.droppableId;

      // 1. Phản hồi tức thì 0ms trên Redux State (Optimistic UI)
      dispatch(
        reorderPlacesOptimistic({
          sourceDayId,
          destinationDayId,
          sourceIndex: source.index,
          destinationIndex: destination.index,
        })
      );

      // 2. Tìm ngày đích để lấy danh sách subdocument IDs sau khi đã kéo thả
      const targetDay = trip.schedule.find(
        (d) => d._id === destinationDayId || String(d.day) === destinationDayId
      );

      if (!targetDay) return;

      // Tạo mảng mới mô phỏng thứ tự các item của ngày đích
      const placesCopy = Array.from(targetDay.places);
      const isSameDay = sourceDayId === destinationDayId;

      let reorderedSubIds: string[] = [];

      if (isSameDay) {
        const [moved] = placesCopy.splice(source.index, 1);
        if (moved) {
          placesCopy.splice(destination.index, 0, moved);
        }
        reorderedSubIds = placesCopy.map((p) => p._id);
      } else {
        // Kéo từ ngày khác sang: tìm item từ ngày nguồn
        const sourceDay = trip.schedule.find(
          (d) => d._id === sourceDayId || String(d.day) === sourceDayId
        );
        const moved = sourceDay?.places[source.index];
        if (moved) {
          placesCopy.splice(destination.index, 0, moved);
        }
        reorderedSubIds = placesCopy.map((p) => p._id);
      }

      // 3. Gửi API đồng bộ lên server. Nếu có lỗi, thunk tự động dispatch rollbackDnd
      try {
        const actionResult = await dispatch(
          reorderScheduleThunk({
            tripId: trip._id,
            reorderData: {
              day: targetDay.day,
              placesOrder: reorderedSubIds,
            },
          })
        );

        if (reorderScheduleThunk.rejected.match(actionResult)) {
          toast.error(
            (actionResult.payload as string) ||
              'Không thể lưu thay đổi thứ tự. Đã tự động hoàn tác lịch trình!'
          );
        }
      } catch (err: unknown) {
        const error = err as Error;
        toast.error(error.message || 'Lỗi kết nối khi đồng bộ lịch trình!');
      }
    },
    [dispatch, trip, uiStore]
  );

  /** Xóa địa điểm khỏi lịch trình kèm Optimistic UI */
  const handleRemovePlace = useCallback(
    async (dayId: string, subId: string) => {
      // 1. Xóa tức thì khỏi UI
      dispatch(removePlaceOptimistic({ dayId, placeId: subId }));

      // 2. Gọi API BE
      try {
        const res = await dispatch(
          removePlaceThunk({ tripId: trip._id, subId })
        );
        if (removePlaceThunk.fulfilled.match(res)) {
          toast.success('Đã xóa địa điểm khỏi lịch trình');
        } else {
          toast.error('Lỗi khi xóa địa điểm. Vui lòng thử lại!');
        }
      } catch {
        toast.error('Lỗi kết nối mạng khi xóa địa điểm!');
      }
    },
    [dispatch, trip._id]
  );

  /** Check-in hoặc bỏ check-in địa điểm kèm Optimistic UI */
  const handleCheckInPlace = useCallback(
    async (dayId: string, subId: string, visited: boolean) => {
      // 1. Cập nhật tức thì UI checkbox
      dispatch(checkInPlaceOptimistic({ dayId, placeId: subId, visited }));

      // 2. Gửi API BE
      try {
        await dispatch(
          checkInPlaceThunk({ tripId: trip._id, subId, visited })
        );
        toast.success(
          visited
            ? 'Đã check-in thành công địa điểm!'
            : 'Đã hủy đánh dấu đã ghé thăm!'
        );
      } catch {
        toast.error('Lỗi khi cập nhật trạng thái ghé thăm!');
      }
    },
    [dispatch, trip._id]
  );

  return {
    onDragStart,
    onDragEnd,
    handleRemovePlace,
    handleCheckInPlace,
  };
}

