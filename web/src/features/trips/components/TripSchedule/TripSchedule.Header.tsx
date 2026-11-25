import { memo } from 'react';
import { Calendar, MapPin, Sparkles, Share2 } from 'lucide-react';
import { useTripScheduleContext } from './TripScheduleContext';
import { formatDate } from '../../../../utils/formatters';
import { useTripUIStoreApi } from '../../../../store/tripUIStore';
import { City } from '../../../../types/city';

export interface TripScheduleHeaderProps {
  onShareClick?: () => void;
}

/**
 * Sub-component: Header chuyến đi (Tên, thành phố, ngày bắt đầu - kết thúc, nút mở AI).
 */
export const TripScheduleHeader = memo(function TripScheduleHeader({
  onShareClick,
}: TripScheduleHeaderProps) {
  const { trip } = useTripScheduleContext();
  const uiStore = useTripUIStoreApi();

  const city = typeof trip.city === 'object' && trip.city !== null ? (trip.city as City) : null;
  const cityName = city?.name || 'Điểm đến du lịch';

  return (
    <div className="relative mb-6 p-6 rounded-3xl bg-linear-to-r from-blue-600 to-indigo-700 text-white shadow-md overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Badge địa danh */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2">
            <MapPin className="w-3.5 h-3.5" />
            {cityName}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2">
            {trip.title}
          </h1>

          <div className="flex items-center gap-4 text-xs md:text-sm text-blue-100 flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(trip.startDate, 'dd/MM/yyyy')} — {formatDate(trip.endDate, 'dd/MM/yyyy')}
            </span>
            <span>•</span>
            <span>{trip.schedule.length} ngày khám phá</span>
          </div>
        </div>

        {/* Nút hành động: Mở Trợ lý AI & Chia sẻ */}
        <div className="flex items-center gap-2">
          {onShareClick && (
            <button
              type="button"
              onClick={onShareClick}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-xs font-semibold transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Chia sẻ
            </button>
          )}

          <button
            type="button"
            onClick={() => uiStore.getState().toggleAIPanel()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-900 text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-zinc-900" />
            Trợ lý AI gợi ý
          </button>
        </div>
      </div>
    </div>
  );
});

