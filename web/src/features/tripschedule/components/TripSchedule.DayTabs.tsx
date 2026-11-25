import { memo } from 'react';
import { useTripScheduleContext } from './TripScheduleContext';
import { formatDate } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';

export interface TripScheduleDayTabsProps {
  /** Cho phép tùy chọn xem tất cả ngày cùng lúc (-1) */
  allowAllDays?: boolean;
}

/**
 * Sub-component: Thanh chuyển tab ngày lịch trình.
 */
export const TripScheduleDayTabs = memo(function TripScheduleDayTabs({
  allowAllDays = true,
}: TripScheduleDayTabsProps) {
  const { trip, selectedDayIndex, setSelectedDayIndex } = useTripScheduleContext();

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
      {allowAllDays && (
        <button
          type="button"
          onClick={() => setSelectedDayIndex(-1)}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer',
            selectedDayIndex === -1
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
          )}
        >
          Tất cả các ngày ({trip.schedule.length})
        </button>
      )}

      {trip.schedule.map((day, idx) => (
        <button
          key={day._id || day.day}
          type="button"
          onClick={() => setSelectedDayIndex(idx)}
          className={cn(
            'flex flex-col items-center px-4 py-1.5 rounded-xl text-xs shrink-0 transition-all cursor-pointer border',
            selectedDayIndex === idx
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
          )}
        >
          <span className="font-bold">Ngày {day.day}</span>
          <span
            className={cn(
              'text-[10px]',
              selectedDayIndex === idx
                ? 'text-blue-100'
                : 'text-zinc-400 dark:text-zinc-500'
            )}
          >
            {formatDate(day.date, undefined, 'dd/MM')}
          </span>
        </button>
      ))}
    </div>
  );
});

