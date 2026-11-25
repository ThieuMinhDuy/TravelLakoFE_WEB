import { createContext, useContext } from 'react';
import { TripDetail, PopulatedPlaceInSchedule } from '../../../types';

export interface TripScheduleContextValue {
  trip: TripDetail;
  totalDays: number;
  selectedDayIndex: number;
  setSelectedDayIndex: (index: number) => void;
  onRemovePlace: (dayId: string, subId: string) => void;
  onCheckInPlace: (dayId: string, subId: string, visited: boolean) => void;
  onPlaceClick?: (place: PopulatedPlaceInSchedule) => void;
}

export const TripScheduleContext = createContext<TripScheduleContextValue | null>(null);

/**
 * Hook truy xuất context nội bộ của Compound Component <TripSchedule>
 */
export function useTripScheduleContext(): TripScheduleContextValue {
  const context = useContext(TripScheduleContext);
  if (!context) {
    throw new Error(
      'Các component con của TripSchedule (<TripSchedule.Day>, <TripSchedule.Place>, ...) phải được đặt bên trong <TripSchedule>!'
    );
  }
  return context;
}

