import { describe, it, expect } from 'vitest';
import {
  selectBudgetSummary,
  selectSortedSchedule,
} from '@/store/tripSelectors';
import { RootState } from '@/store/reduxStore';
import { mockTripDetail } from './mockTripData';

describe('Redux Toolkit: tripSelectors (Memoized createSelector)', () => {
  const buildMockRootState = (overrideBudget?: number): RootState => ({
    trip: {
      trips: { upcoming: [], ongoing: [], past: [] },
      currentTrip: {
        ...mockTripDetail,
        budget: overrideBudget !== undefined ? overrideBudget : mockTripDetail.budget,
      },
      dndSnapshot: null,
      loading: false,
      reorderLoading: false,
      error: null,
    },
  });

  // ─── TC-05: Test Memoized Selector tính toán ngân sách ─────────────────────
  it('TC-05: selectBudgetSummary tính toán chính xác tổng chi phí ước tính, số tiền đã chi và phân bổ theo từng loại hình', () => {
    const state = buildMockRootState(2000000); // Ngân sách: 2.000.000 VNĐ
    const summary = selectBudgetSummary(state);

    // 1. Phân bổ chi phí:
    // - Khách sạn: 600.000đ * 2 ngày = 1.200.000đ
    // - Vé tham quan: 0đ (p1) + 30.000đ (p5) = 30.000đ
    // - Nhà hàng: 70.000đ (p2)
    // - Quán Cafe: 45.000đ (p4)
    expect(summary.breakdown.hotel).toBe(1200000);
    expect(summary.breakdown.attraction).toBe(30000);
    expect(summary.breakdown.restaurant).toBe(70000);
    expect(summary.breakdown.cafe).toBe(45000);

    // 2. Tổng chi phí dự tính = 1.200.000 + 30.000 + 70.000 + 45.000 = 1.345.000đ
    expect(summary.estimated).toBe(1345000);

    // 3. Số tiền thực tế đã chi (địa điểm visited = true: p1(0đ) + p2(70k)) = 70.000đ
    expect(summary.spent).toBe(70000);

    // 4. Ngân sách còn lại = 2.000.000 - 1.345.000 = 655.000đ
    expect(summary.total).toBe(2000000);
    expect(summary.remaining).toBe(655000);

    // 5. % Ngân sách sử dụng = 67.25%
    expect(summary.percentUsed).toBeCloseTo(67.25, 1);
    expect(summary.isOverBudget).toBe(false);

    // Trường hợp vượt ngân sách: ngân sách chỉ có 1.000.000đ
    const overBudgetState = buildMockRootState(1000000);
    const overSummary = selectBudgetSummary(overBudgetState);
    expect(overSummary.isOverBudget).toBe(true);
    expect(overSummary.remaining).toBe(-345000);
  });

  // ─── TC-06: Test tính chất Memoized của Selector ───────────────────────────
  it('TC-06: selectBudgetSummary được memoized, không tính toán lại khi các trường state không liên quan thay đổi', () => {
    const state1 = buildMockRootState();
    const result1 = selectBudgetSummary(state1);
    const result2 = selectBudgetSummary(state1);

    // Cùng một state, selector phải trả về cùng một instance tham chiếu trong bộ nhớ (===)
    expect(result1).toBe(result2);

    // Thay đổi trường loading trong trip state (không làm thay đổi currentTrip)
    const state2: RootState = {
      ...state1,
      trip: {
        ...state1.trip,
        loading: true,
        reorderLoading: true,
      },
    };

    const result3 = selectBudgetSummary(state2);
    // Nhờ createSelector memoization, kết quả vẫn giữ nguyên tham chiếu cũ
    expect(result1).toBe(result3);

    // Kiểm tra tương tự với selectSortedSchedule
    const schedule1 = selectSortedSchedule(state1);
    const schedule2 = selectSortedSchedule(state2);
    expect(schedule1).toBe(schedule2);
  });
});

