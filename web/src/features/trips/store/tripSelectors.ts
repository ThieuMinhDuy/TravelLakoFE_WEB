import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../store/reduxStore';
import { extractPlaceCost } from '../types/trip';

// ─── Input Selectors cơ bản ──────────────────────────────────────────────────
export const selectTripState = (state: RootState) => state.trip;
export const selectCurrentTrip = (state: RootState) => state.trip.currentTrip;
export const selectTripsList = (state: RootState) => state.trip.trips;
export const selectTripLoading = (state: RootState) => state.trip.loading;
export const selectReorderLoading = (state: RootState) => state.trip.reorderLoading;
export const selectTripError = (state: RootState) => state.trip.error;

// ─── Chi tiết phân bổ chi phí ngân sách ──────────────────────────────────────
export interface BudgetCategoryBreakdown {
  hotel: number;
  attraction: number;
  restaurant: number;
  cafe: number;
}

export interface BudgetSummary {
  total: number;             // Tổng ngân sách đã thiết lập (VNĐ)
  estimated: number;         // Tổng chi phí ước tính của tất cả địa điểm trong lịch trình
  spent: number;             // Chi phí thực tế đã chi (những địa điểm đã check-in / visited)
  remaining: number;         // Ngân sách còn lại (total - estimated)
  percentUsed: number;       // % ngân sách dự kiến tiêu thụ (0 - 100%)
  isOverBudget: boolean;      // Đã vượt ngân sách cho phép hay chưa
  breakdown: BudgetCategoryBreakdown; // Chi tiết chi phí từng loại hình
}

/**
 * Memoized Selector tính toán toàn bộ tổng quan ngân sách của chuyến đi.
 * Tự động trích xuất chi phí dựa theo từng loại hình:
 * - Hotel: pricePerNight * số ngày
 * - Attraction: admissionFee
 * - Restaurant / Cafe: price
 * Chỉ chạy lại tính toán khi currentTrip thay đổi (memoized bằng createSelector).
 */
export const selectBudgetSummary = createSelector(
  [selectCurrentTrip],
  (trip): BudgetSummary => {
    if (!trip) {
      return {
        total: 0,
        estimated: 0,
        spent: 0,
        remaining: 0,
        percentUsed: 0,
        isOverBudget: false,
        breakdown: { hotel: 0, attraction: 0, restaurant: 0, cafe: 0 },
      };
    }

    const totalDays = trip.schedule.length || 1;
    let estimated = 0;
    let spent = 0;
    const breakdown: BudgetCategoryBreakdown = {
      hotel: 0,
      attraction: 0,
      restaurant: 0,
      cafe: 0,
    };

    for (const day of trip.schedule) {
      for (const place of day.places) {
        const cost = extractPlaceCost(place, totalDays);
        estimated += cost;

        if (place.visited) {
          spent += cost;
        }

        switch (place.placeType) {
          case 'Hotel':
            breakdown.hotel += cost;
            break;
          case 'Attraction':
            breakdown.attraction += cost;
            break;
          case 'Restaurant':
            breakdown.restaurant += cost;
            break;
          case 'Cafe':
            breakdown.cafe += cost;
            break;
        }
      }
    }

    const total = trip.budget || 0;
    const remaining = total - estimated;
    const percentUsed = total > 0 ? Math.min((estimated / total) * 100, 100) : 0;
    const isOverBudget = total > 0 && estimated > total;

    return {
      total,
      estimated,
      spent,
      remaining,
      percentUsed,
      isOverBudget,
      breakdown,
    };
  }
);

/**
 * Memoized Selector trả về danh sách các ngày trong lịch trình,
 * với danh sách địa điểm trong mỗi ngày luôn được sắp xếp tăng dần theo thuộc tính `order`.
 */
export const selectSortedSchedule = createSelector(
  [selectCurrentTrip],
  (trip) => {
    if (!trip || !trip.schedule) return [];

    return trip.schedule.map((day) => ({
      ...day,
      places: [...day.places].sort((a, b) => a.order - b.order),
    }));
  }
);

/**
 * Memoized Selector tính toán thống kê tiến độ chuyến đi (số điểm đã ghé thăm).
 */
export const selectTripProgress = createSelector(
  [selectCurrentTrip],
  (trip) => {
    if (!trip || !trip.schedule) {
      return { totalPlaces: 0, visitedPlaces: 0, progressPercent: 0 };
    }

    const allPlaces = trip.schedule.flatMap((d) => d.places);
    const totalPlaces = allPlaces.length;
    const visitedPlaces = allPlaces.filter((p) => p.visited).length;
    const progressPercent =
      totalPlaces > 0 ? Math.round((visitedPlaces / totalPlaces) * 100) : 0;

    return {
      totalPlaces,
      visitedPlaces,
      progressPercent,
    };
  }
);

