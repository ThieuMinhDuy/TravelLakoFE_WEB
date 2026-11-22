import { ReactNode, useState, useMemo } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { TripDetail, PopulatedPlaceInSchedule } from '../../types/trip';
import { useTripScheduleDnd } from '../../hooks/useTripScheduleDnd';
import { TripScheduleContext, TripScheduleContextValue } from './TripScheduleContext';
import { TripScheduleHeader } from './TripSchedule.Header';
import { TripScheduleBudget } from './TripSchedule.Budget';
import { TripScheduleDayTabs } from './TripSchedule.DayTabs';
import { TripScheduleDay } from './TripSchedule.Day';
import { TripSchedulePlace } from './TripSchedule.Place';

export interface TripScheduleProps {
  trip: TripDetail;
  children?: ReactNode;
  onPlaceClick?: (place: PopulatedPlaceInSchedule) => void;
  onAddPlaceClick?: (dayNumber: number) => void;
}

/**
 * Root Compound Component: <TripSchedule>
 * Quản lý DragDropContext (@hello-pangea/dnd), kết nối với Redux Optimistic Thunks
 * và cung cấp TripScheduleContext cho toàn bộ các sub-component con.
 */
export function TripScheduleRoot({
  trip,
  children,
  onPlaceClick,
  onAddPlaceClick,
}: TripScheduleProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(-1); // -1: hiển thị tất cả các ngày
  const { onDragStart, onDragEnd, handleRemovePlace, handleCheckInPlace } =
    useTripScheduleDnd({ trip });

  const contextValue: TripScheduleContextValue = useMemo(
    () => ({
      trip,
      selectedDayIndex,
      setSelectedDayIndex,
      onRemovePlace: handleRemovePlace,
      onCheckInPlace: handleCheckInPlace,
      onPlaceClick,
    }),
    [
      trip,
      selectedDayIndex,
      handleRemovePlace,
      handleCheckInPlace,
      onPlaceClick,
    ]
  );

  // Lọc danh sách ngày hiển thị theo tab đang chọn
  const displayedDays = useMemo(() => {
    if (selectedDayIndex === -1) {
      return trip.schedule;
    }
    const day = trip.schedule[selectedDayIndex];
    return day ? [day] : trip.schedule;
  }, [trip.schedule, selectedDayIndex]);

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <TripScheduleContext.Provider value={contextValue}>
        <div className="w-full max-w-5xl mx-auto">
          {children ? (
            children
          ) : (
            <>
              {/* Layout mặc định nếu không truyền children thủ công */}
              <TripScheduleHeader />
              <TripScheduleBudget />
              <TripScheduleDayTabs />
              <div className="space-y-4">
                {displayedDays.map((day) => (
                  <TripScheduleDay
                    key={day._id || day.day}
                    day={day}
                    onAddPlaceClick={onAddPlaceClick}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </TripScheduleContext.Provider>
    </DragDropContext>
  );
}

// ─── Compound Component Pattern Export ───────────────────────────────────────
export const TripSchedule = Object.assign(TripScheduleRoot, {
  Header: TripScheduleHeader,
  Budget: TripScheduleBudget,
  DayTabs: TripScheduleDayTabs,
  Day: TripScheduleDay,
  Place: TripSchedulePlace,
});

export default TripSchedule;

