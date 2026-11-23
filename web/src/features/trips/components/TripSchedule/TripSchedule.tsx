import { ReactNode, useState, useMemo, lazy, Suspense } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { TripDetail, PopulatedPlaceInSchedule } from '../../types/trip';
import { useTripScheduleDnd } from '../../hooks/useTripScheduleDnd';
import { TripScheduleContext, TripScheduleContextValue } from './TripScheduleContext';
import { TripScheduleHeader } from './TripSchedule.Header';
import { TripScheduleBudget } from './TripSchedule.Budget';
import { TripScheduleDayTabs } from './TripSchedule.DayTabs';
import { TripScheduleDay } from './TripSchedule.Day';
import { TripSchedulePlace } from './TripSchedule.Place';
import { AIAssistantFAB } from '../AIAssistant/AIAssistantFAB';
import { useTripUIContext } from '../../store/tripUIStore';

// ─── Code Splitting (Tối ưu hiệu năng tải trang ban đầu) ─────────────────────
// Lazy load AIAssistantPanel — chỉ tải JS chunk của AI khi người dùng mở panel
const LazyAIAssistantPanel = lazy(() =>
  import('../AIAssistant/AIAssistantPanel').then((module) => ({
    default: module.AIAssistantPanel,
  }))
);

export interface TripScheduleProps {
  trip: TripDetail;
  children?: ReactNode;
  onPlaceClick?: (place: PopulatedPlaceInSchedule) => void;
  onAddPlaceClick?: (dayNumber: number) => void;
  showAIAssistant?: boolean;
}

/**
 * Root Compound Component: <TripSchedule>
 * Quản lý DragDropContext (@hello-pangea/dnd), kết nối với Redux Optimistic Thunks,
 * áp dụng Memoization và Code Splitting để đạt hiệu năng phản hồi 0ms.
 */
export function TripScheduleRoot({
  trip,
  children,
  onPlaceClick,
  onAddPlaceClick,
  showAIAssistant = true,
}: TripScheduleProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(-1); // -1: hiển thị tất cả các ngày
  const isAIPanelOpen = useTripUIContext((s) => s.isAIPanelOpen);

  const { onDragStart, onDragEnd, handleRemovePlace, handleCheckInPlace } =
    useTripScheduleDnd({ trip });

  // Tối ưu Memoized Context Value: chỉ khởi tạo lại khi các dependency thực sự thay đổi
  const totalDays = trip.schedule.length || 1;
  const contextValue: TripScheduleContextValue = useMemo(
    () => ({
      trip,
      totalDays,
      selectedDayIndex,
      setSelectedDayIndex,
      onRemovePlace: handleRemovePlace,
      onCheckInPlace: handleCheckInPlace,
      onPlaceClick,
    }),
    [
      trip,
      totalDays,
      selectedDayIndex,
      handleRemovePlace,
      handleCheckInPlace,
      onPlaceClick,
    ]
  );

  // Lọc danh sách ngày hiển thị theo tab đang chọn (memoized)
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
        <div className="w-full max-w-5xl mx-auto relative">
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

          {/* Trợ lý ảo AI: Tối ưu lazy loading chỉ tải khi người dùng kích hoạt */}
          {showAIAssistant && (
            <>
              {isAIPanelOpen && (
                <Suspense
                  fallback={
                    <div className="fixed top-0 right-0 h-full w-[420px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-50 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                  }
                >
                  <LazyAIAssistantPanel currentTrip={trip} />
                </Suspense>
              )}
              <AIAssistantFAB />
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
  AIPanel: LazyAIAssistantPanel,
  AIFAB: AIAssistantFAB,
});

export default TripSchedule;
