import { describe, it, expect, vi, beforeEach } from 'vitest';
import tripReducer, {
  saveDndSnapshot,
  rollbackDnd,
  reorderPlacesOptimistic,
  reorderScheduleThunk,
  TripState,
} from '../../src/features/trips/store/tripSlice';
import * as tripService from '../../src/features/trips/services/tripService';
import { mockTripDetail } from './mockTripData';
import { configureStore } from '@reduxjs/toolkit';

// Mock tripService
vi.mock('../../src/features/trips/services/tripService');

describe('Redux Toolkit: tripSlice & Optimistic UI DnD', () => {
  let initialState: TripState;

  beforeEach(() => {
    vi.clearAllMocks();
    initialState = {
      trips: { upcoming: [], ongoing: [], past: [] },
      currentTrip: JSON.parse(JSON.stringify(mockTripDetail)),
      dndSnapshot: null,
      loading: false,
      reorderLoading: false,
      error: null,
    };
  });

  // ─── TC-01: Test DnD Reducer sắp xếp địa điểm trong cùng 1 ngày ───────────
  it('TC-01: reorderPlacesOptimistic sắp xếp lại địa điểm trong cùng 1 ngày với phản hồi 0ms', () => {
    // Ngày 1 ban đầu có [p1 (order 0), p2 (order 1), p3 (order 2)]
    expect(initialState.currentTrip?.schedule[0].places[0]._id).toBe('p1');
    expect(initialState.currentTrip?.schedule[0].places[1]._id).toBe('p2');
    expect(initialState.currentTrip?.schedule[0].places[2]._id).toBe('p3');

    // Di chuyển item index 0 (p1) xuống index 2 (sau p3)
    const nextState = tripReducer(
      initialState,
      reorderPlacesOptimistic({
        sourceDayId: 'day_1',
        destinationDayId: 'day_1',
        sourceIndex: 0,
        destinationIndex: 2,
      })
    );

    const places = nextState.currentTrip!.schedule[0].places;
    // Thứ tự mới phải là: p2, p3, p1
    expect(places[0]._id).toBe('p2');
    expect(places[0].order).toBe(0);

    expect(places[1]._id).toBe('p3');
    expect(places[1].order).toBe(1);

    expect(places[2]._id).toBe('p1');
    expect(places[2].order).toBe(2);
  });

  // ─── TC-02: Test DnD Reducer kéo thả địa điểm di chuyển xuyên ngày ─────────
  it('TC-02: reorderPlacesOptimistic di chuyển địa điểm từ Ngày 1 sang Ngày 2 và chuẩn hóa order cả 2 ngày', () => {
    const day1PlacesBefore = initialState.currentTrip!.schedule[0].places.length; // 3
    const day2PlacesBefore = initialState.currentTrip!.schedule[1].places.length; // 2

    // Kéo item index 0 (p1) của Ngày 1 sang Ngày 2 tại vị trí index 1
    const nextState = tripReducer(
      initialState,
      reorderPlacesOptimistic({
        sourceDayId: 'day_1',
        destinationDayId: 'day_2',
        sourceIndex: 0,
        destinationIndex: 1,
      })
    );

    const day1Places = nextState.currentTrip!.schedule[0].places;
    const day2Places = nextState.currentTrip!.schedule[1].places;

    // Ngày 1 giảm 1 item (còn 2) và order được chuẩn hóa lại từ 0, 1
    expect(day1Places).toHaveLength(day1PlacesBefore - 1);
    expect(day1Places[0]._id).toBe('p2');
    expect(day1Places[0].order).toBe(0);
    expect(day1Places[1]._id).toBe('p3');
    expect(day1Places[1].order).toBe(1);

    // Ngày 2 tăng 1 item (thành 3) và item p1 nằm ở index 1
    expect(day2Places).toHaveLength(day2PlacesBefore + 1);
    expect(day2Places[1]._id).toBe('p1');
    expect(day2Places.map((p) => p.order)).toEqual([0, 1, 2]);
  });

  // ─── TC-03: Test cơ chế lưu Snapshot và Rollback khi có lỗi ───────────────
  it('TC-03: saveDndSnapshot lưu snapshot và rollbackDnd khôi phục chính xác 100% khi lỗi', () => {
    // 1. Lưu snapshot trước khi kéo
    let state = tripReducer(initialState, saveDndSnapshot());
    expect(state.dndSnapshot).not.toBeNull();
    expect(state.dndSnapshot).toEqual(initialState.currentTrip);

    // 2. Kéo thả làm thay đổi currentTrip
    state = tripReducer(
      state,
      reorderPlacesOptimistic({
        sourceDayId: 'day_1',
        destinationDayId: 'day_1',
        sourceIndex: 0,
        destinationIndex: 2,
      })
    );
    expect(state.currentTrip).not.toEqual(state.dndSnapshot);

    // 3. Rollback
    state = tripReducer(state, rollbackDnd());

    // currentTrip phải trở về y hệt ban đầu và dndSnapshot được reset về null
    expect(state.currentTrip).toEqual(initialState.currentTrip);
    expect(state.dndSnapshot).toBeNull();
  });

  // ─── TC-04: Test Async Thunk tự động rollback khi API server gặp sự cố ────
  it('TC-04: reorderScheduleThunk tự động dispatch rollbackDnd khi API trả lỗi thất bại', async () => {
    // Giả lập API BE báo lỗi 500 hoặc mất kết nối mạng
    vi.mocked(tripService.reorderSchedule).mockRejectedValue(
      new Error('Lỗi kết nối máy chủ!')
    );

    const store = configureStore({
      reducer: { trip: tripReducer },
      preloadedState: {
        trip: {
          ...initialState,
          // Giả lập đã lưu snapshot ban đầu
          dndSnapshot: JSON.parse(JSON.stringify(mockTripDetail)),
        },
      },
    });

    // Thay đổi optimistic trên store trước khi thunk chạy xong
    store.dispatch(
      reorderPlacesOptimistic({
        sourceDayId: 'day_1',
        destinationDayId: 'day_1',
        sourceIndex: 0,
        destinationIndex: 2,
      })
    );

    // Dispatch reorderScheduleThunk
    const result = await store.dispatch(
      reorderScheduleThunk({
        tripId: 'trip_123',
        reorderData: { day: 1, placesOrder: ['p2', 'p3', 'p1'] },
      })
    );

    // Thunk bị rejected
    expect(reorderScheduleThunk.rejected.match(result)).toBe(true);

    // Store phải tự động rollback currentTrip về snapshot ban đầu
    const state = store.getState().trip;
    expect(state.currentTrip?.schedule[0].places[0]._id).toBe('p1');
    expect(state.dndSnapshot).toBeNull();
    expect(state.error).toContain('Lỗi kết nối máy chủ!');
  });
});

