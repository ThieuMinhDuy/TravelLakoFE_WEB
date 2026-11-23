import { memo, useMemo } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Calendar, Plus, MapPinOff } from 'lucide-react';
import { PopulatedDaySchedule, extractPlaceCost } from '../../../../types';
import { formatDate, formatCurrencyVND } from '../../../../utils/formatters';
import { TripSchedulePlace } from './TripSchedule.Place';
import { useTripScheduleContext } from './TripScheduleContext';
import { cn } from '../../../../utils/cn';

export interface TripScheduleDayProps {
  day: PopulatedDaySchedule;
  onAddPlaceClick?: (dayNumber: number) => void;
}

/**
 * Sub-component: Cột lịch trình theo ngày (Droppable Column).
 * Đóng gói logic sắp xếp địa điểm theo thứ tự order và hiển thị tổng chi phí trong ngày.
 */
export const TripScheduleDay = memo(function TripScheduleDay({
  day,
  onAddPlaceClick,
}: TripScheduleDayProps) {
  const { trip } = useTripScheduleContext();

  // Đảm bảo địa điểm hiển thị luôn được sắp xếp theo order
  const sortedPlaces = useMemo(() => {
    return [...day.places].sort((a, b) => a.order - b.order);
  }, [day.places]);

  // Tổng chi phí ước tính các địa điểm trong ngày này
  const totalDayCost = useMemo(() => {
    const totalDays = trip.schedule.length || 1;
    return day.places.reduce(
      (sum, p) => sum + extractPlaceCost(p, totalDays),
      0
    );
  }, [day.places, trip.schedule.length]);

  const droppableId = day._id || String(day.day);

  return (
    <div
      data-testid="day-column"
      className="flex flex-col rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-4 mb-4 transition-all"
    >
      {/* Header của Ngày */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">
            {day.day}
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              Ngày {day.day}
              <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400 flex items-center gap-1 ml-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(day.date, 'EEEE, dd/MM/yyyy')}
              </span>
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {day.places.length} địa điểm
              {totalDayCost > 0 && ` • Dự tính: ${formatCurrencyVND(totalDayCost)}`}
            </p>
          </div>
        </div>

        {/* Nút thêm địa điểm nhanh vào ngày */}
        {onAddPlaceClick && (
          <button
            type="button"
            onClick={() => onAddPlaceClick(day.day)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm điểm
          </button>
        )}
      </div>

      {/* Vùng thả Droppable cho DnD */}
      <Droppable droppableId={droppableId} type="PLACE">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'min-h-[90px] rounded-xl p-1 transition-colors duration-200',
              snapshot.isDraggingOver
                ? 'bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-dashed ring-blue-400'
                : ''
            )}
          >
            {sortedPlaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-zinc-400 dark:text-zinc-600">
                <MapPinOff className="w-8 h-8 mb-1.5 stroke-[1.5]" />
                <p className="text-xs">Chưa có địa điểm nào trong ngày này</p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Kéo thả địa điểm từ ngày khác hoặc nhấn Thêm điểm
                </p>
              </div>
            ) : (
              sortedPlaces.map((place, index) => (
                <TripSchedulePlace
                  key={place._id}
                  place={place}
                  index={index}
                  dayId={droppableId}
                  totalDays={trip.schedule.length || 1}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
});

