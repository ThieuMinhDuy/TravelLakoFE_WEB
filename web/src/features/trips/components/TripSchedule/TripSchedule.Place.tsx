import { memo } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import {
  GripVertical,
  CheckCircle2,
  Trash2,
  MapPin,
  Star,
  Building2,
  Ticket,
  Utensils,
  Coffee,
} from 'lucide-react';
import { PopulatedPlaceInSchedule } from '../../types/trip';
import { formatCurrencyVND } from '../../../../utils/formatters';
import { extractPlaceCost } from '../../types/trip';
import { cn } from '../../../../utils/cn';
import { useTripScheduleContext } from './TripScheduleContext';

export interface TripSchedulePlaceProps {
  place: PopulatedPlaceInSchedule;
  index: number;
  dayId: string;
}

/** Badge hiển thị loại địa điểm */
function PlaceTypeBadge({ type }: { type: string }) {
  switch (type) {
    case 'Hotel':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
          <Building2 className="w-3 h-3" /> Khách sạn
        </span>
      );
    case 'Attraction':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          <Ticket className="w-3 h-3" /> Tham quan
        </span>
      );
    case 'Restaurant':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
          <Utensils className="w-3 h-3" /> Nhà hàng
        </span>
      );
    case 'Cafe':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
          <Coffee className="w-3 h-3" /> Quán Cafe
        </span>
      );
    default:
      return null;
  }
}

/**
 * Sub-component: Card địa điểm có thể kéo thả (Draggable).
 * Được bọc React.memo để tối ưu hiệu năng render (không render lại khi kéo item khác).
 */
export const TripSchedulePlace = memo(function TripSchedulePlace({
  place,
  index,
  dayId,
}: TripSchedulePlaceProps) {
  const { onRemovePlace, onCheckInPlace, onPlaceClick, trip } = useTripScheduleContext();

  const rawPlace = place.placeId;
  const placeData = typeof rawPlace === 'object' && rawPlace !== null ? rawPlace : null;
  const placeName = placeData?.name || 'Địa điểm chưa xác định';
  const placeAddress = placeData?.address || '';
  const placeImage =
    placeData?.images && placeData.images.length > 0
      ? placeData.images[0]
      : 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=500&q=80';
  const placeRating = placeData?.rating || 0;

  // Tính chi phí tương ứng
  const totalDays = trip.schedule.length || 1;
  const cost = extractPlaceCost(place, totalDays);

  return (
    <Draggable draggableId={place._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          data-testid="place-card"
          className={cn(
            'group relative flex items-center gap-3 p-3.5 mb-2.5 rounded-xl border bg-white dark:bg-zinc-900 transition-all duration-200 select-none shadow-xs',
            snapshot.isDragging
              ? 'border-blue-500 shadow-xl ring-2 ring-blue-500/20 rotate-1 scale-[1.02] z-50'
              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm',
            place.visited && 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
          )}
        >
          {/* Nút nắm kéo Drag Handle */}
          <div
            {...provided.dragHandleProps}
            aria-label="Kéo để đổi thứ tự"
            className="flex items-center justify-center p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-grab active:cursor-grabbing transition-colors"
          >
            <GripVertical className="w-4 h-4" />
          </div>

          {/* Huy hiệu số thứ tự */}
          <div
            className={cn(
              'flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0',
              place.visited
                ? 'bg-emerald-500 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
            )}
          >
            {index + 1}
          </div>

          {/* Ảnh thumbnail */}
          <div
            onClick={() => onPlaceClick?.(place)}
            className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 cursor-pointer"
          >
            <img
              src={placeImage}
              alt={placeName}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Thông tin chính */}
          <div className="flex-1 min-w-0" onClick={() => onPlaceClick?.(place)}>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <PlaceTypeBadge type={place.placeType} />
              {placeRating > 0 && (
                <span className="flex items-center gap-0.5 text-xs font-medium text-amber-500">
                  <Star className="w-3 h-3 fill-amber-500" />
                  {placeRating.toFixed(1)}
                </span>
              )}
            </div>

            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400">
              {placeName}
            </h4>

            {placeAddress && (
              <p className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{placeAddress}</span>
              </p>
            )}

            {place.note && (
              <p className="text-xs italic text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                Ghi chú: {place.note}
              </p>
            )}
          </div>

          {/* Chi phí ước tính & Check-in / Delete actions */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {cost > 0 && (
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                {formatCurrencyVND(cost)}
              </span>
            )}

            <div className="flex items-center gap-1">
              {/* Nút check-in */}
              <button
                type="button"
                onClick={() => onCheckInPlace(dayId, place._id, !place.visited)}
                title={place.visited ? 'Hủy check-in' : 'Đánh dấu đã ghé thăm'}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  place.visited
                    ? 'text-emerald-600 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                )}
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>

              {/* Nút xóa */}
              <button
                type="button"
                onClick={() => onRemovePlace(dayId, place._id)}
                title="Xóa địa điểm khỏi lịch trình"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
});

