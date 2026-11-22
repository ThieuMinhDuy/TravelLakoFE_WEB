import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  TripDetail,
  MyTripsResponse,
  ReorderScheduleDTO,
  AddPlaceToScheduleDTO,
  PopulatedPlaceInSchedule,
} from '../types/trip';
import * as tripService from '../services/tripService';

// ─── Kiểu dữ liệu State của Trip Slice ───────────────────────────────────────
export interface TripState {
  // Danh sách chuyến đi được gom nhóm
  trips: MyTripsResponse;
  // Chi tiết chuyến đi hiện tại đang thao tác/xem lịch trình
  currentTrip: TripDetail | null;
  // Bản snapshot lưu lại trạng thái trước khi kéo thả để tự rollback khi API lỗi (Optimistic UI)
  dndSnapshot: TripDetail | null;
  // Trạng thái loading và lỗi
  loading: boolean;
  reorderLoading: boolean;
  error: string | null;
}

const initialState: TripState = {
  trips: {
    upcoming: [],
    ongoing: [],
    past: [],
  },
  currentTrip: null,
  dndSnapshot: null,
  loading: false,
  reorderLoading: false,
  error: null,
};

// ─── Async Thunks ────────────────────────────────────────────────────────────

/** Lấy danh sách chuyến đi của người dùng hiện tại */
export const fetchMyTrips = createAsyncThunk(
  'trip/fetchMyTrips',
  async (_, { rejectWithValue }) => {
    try {
      return await tripService.getMyTrips();
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message || 'Lỗi khi tải danh sách chuyến đi');
    }
  }
);

/** Lấy chi tiết một chuyến đi kèm đầy đủ thông tin địa điểm */
export const fetchTripById = createAsyncThunk(
  'trip/fetchTripById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await tripService.getTripById(id);
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message || 'Lỗi khi tải chi tiết chuyến đi');
    }
  }
);

/** Payload gửi yêu cầu sắp xếp lại vị trí địa điểm */
export interface ReorderSchedulePayload {
  tripId: string;
  reorderData: ReorderScheduleDTO;
}

/**
 * Thunk thực hiện đồng bộ vị trí kéo thả lên server.
 * Nếu API trả về lỗi, tự động dispatch rollbackDnd để hoàn tác giao diện về snapshot cũ.
 */
export const reorderScheduleThunk = createAsyncThunk(
  'trip/reorderSchedule',
  async ({ tripId, reorderData }: ReorderSchedulePayload, { dispatch, rejectWithValue }) => {
    try {
      const updatedTrip = await tripService.reorderSchedule(tripId, reorderData);
      dispatch(tripSlice.actions.clearDndSnapshot());
      return updatedTrip;
    } catch (err: unknown) {
      const error = err as Error;
      // Tự động rollback về snapshot trước đó khi server báo lỗi
      dispatch(tripSlice.actions.rollbackDnd());
      return rejectWithValue(error.message || 'Lỗi đồng bộ vị trí lịch trình. Đã tự động hoàn tác!');
    }
  }
);

/** Thunk thêm địa điểm vào một ngày cụ thể */
export const addPlaceThunk = createAsyncThunk(
  'trip/addPlace',
  async (
    { tripId, data }: { tripId: string; data: AddPlaceToScheduleDTO },
    { rejectWithValue }
  ) => {
    try {
      return await tripService.addPlaceToSchedule(tripId, data);
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message || 'Lỗi khi thêm địa điểm vào lịch trình');
    }
  }
);

/** Thunk xóa một địa điểm khỏi ngày trong lịch trình */
export const removePlaceThunk = createAsyncThunk(
  'trip/removePlace',
  async (
    { tripId, subId }: { tripId: string; subId: string },
    { rejectWithValue }
  ) => {
    try {
      return await tripService.removePlaceFromSchedule(tripId, subId);
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message || 'Lỗi khi xóa địa điểm khỏi lịch trình');
    }
  }
);

/** Thunk check-in một địa điểm */
export const checkInPlaceThunk = createAsyncThunk(
  'trip/checkInPlace',
  async (
    { tripId, subId, visited }: { tripId: string; subId: string; visited: boolean },
    { rejectWithValue }
  ) => {
    try {
      return await tripService.checkInPlace(tripId, subId, visited);
    } catch (err: unknown) {
      const error = err as Error;
      return rejectWithValue(error.message || 'Lỗi khi check-in địa điểm');
    }
  }
);

// ─── Payload types cho Optimistic Reducers ───────────────────────────────────
export interface ReorderPlacesOptimisticPayload {
  sourceDayId: string;
  destinationDayId: string;
  sourceIndex: number;
  destinationIndex: number;
}

export interface RemovePlaceOptimisticPayload {
  dayId: string;
  placeId: string;
}

export interface AddPlaceOptimisticPayload {
  dayId: string;
  place: PopulatedPlaceInSchedule;
}

// ─── Slice Definition ────────────────────────────────────────────────────────
export const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    /** Thiết lập chuyến đi đang xem */
    setCurrentTrip: (state, action: PayloadAction<TripDetail | null>) => {
      state.currentTrip = action.payload;
    },

    /**
     * Lưu snapshot của currentTrip trước khi người dùng thực hiện kéo thả.
     * Dùng để hoàn tác nếu sau đó cuộc gọi API thất bại.
     */
    saveDndSnapshot: (state) => {
      if (state.currentTrip) {
        state.dndSnapshot = JSON.parse(JSON.stringify(state.currentTrip));
      }
    },

    /**
     * Tự động phục hồi trạng thái lịch trình về bản snapshot khi API xảy ra lỗi.
     */
    rollbackDnd: (state) => {
      if (state.dndSnapshot) {
        state.currentTrip = state.dndSnapshot;
        state.dndSnapshot = null;
      }
    },

    /** Xóa snapshot sau khi API đồng bộ thành công */
    clearDndSnapshot: (state) => {
      state.dndSnapshot = null;
    },

    /**
     * Cập nhật tức thì thứ tự kéo thả trên giao diện với độ trễ 0ms (Optimistic Update).
     * Hỗ trợ kéo thả trong cùng 1 ngày hoặc di chuyển giữa 2 ngày khác nhau.
     */
    reorderPlacesOptimistic: (
      state,
      action: PayloadAction<ReorderPlacesOptimisticPayload>
    ) => {
      if (!state.currentTrip) return;

      const {
        sourceDayId,
        destinationDayId,
        sourceIndex,
        destinationIndex,
      } = action.payload;

      const sourceDay = state.currentTrip.schedule.find(
        (d) => d._id === sourceDayId || String(d.day) === sourceDayId
      );
      const destDay = state.currentTrip.schedule.find(
        (d) => d._id === destinationDayId || String(d.day) === destinationDayId
      );

      if (!sourceDay || !destDay) return;

      // Kéo thả trong cùng một ngày
      if (sourceDay === destDay) {
        const reordered = Array.from(sourceDay.places);
        const [movedItem] = reordered.splice(sourceIndex, 1);
        if (!movedItem) return;

        reordered.splice(destinationIndex, 0, movedItem);

        // Chuẩn hóa lại thuộc tính order (0, 1, 2...)
        sourceDay.places = reordered.map((item, index) => ({
          ...item,
          order: index,
        }));
      } else {
        // Kéo thả sang ngày khác
        const sourcePlaces = Array.from(sourceDay.places);
        const destPlaces = Array.from(destDay.places);

        const [movedItem] = sourcePlaces.splice(sourceIndex, 1);
        if (!movedItem) return;

        destPlaces.splice(destinationIndex, 0, movedItem);

        // Chuẩn hóa thứ tự cả 2 ngày
        sourceDay.places = sourcePlaces.map((item, index) => ({
          ...item,
          order: index,
        }));
        destDay.places = destPlaces.map((item, index) => ({
          ...item,
          order: index,
        }));
      }
    },

    /** Xóa nhanh địa điểm trên giao diện (Optimistic) */
    removePlaceOptimistic: (
      state,
      action: PayloadAction<RemovePlaceOptimisticPayload>
    ) => {
      if (!state.currentTrip) return;
      const { dayId, placeId } = action.payload;
      const targetDay = state.currentTrip.schedule.find(
        (d) => d._id === dayId || String(d.day) === dayId
      );
      if (!targetDay) return;

      targetDay.places = targetDay.places
        .filter((p) => {
          const id = typeof p.placeId === 'object' ? p.placeId._id : p.placeId;
          return p._id !== placeId && id !== placeId;
        })
        .map((p, idx) => ({ ...p, order: idx }));
    },

    /** Cập nhật check-in nhanh trên giao diện (Optimistic) */
    checkInPlaceOptimistic: (
      state,
      action: PayloadAction<{ dayId: string; placeId: string; visited: boolean }>
    ) => {
      if (!state.currentTrip) return;
      const { dayId, placeId, visited } = action.payload;
      const targetDay = state.currentTrip.schedule.find(
        (d) => d._id === dayId || String(d.day) === dayId
      );
      if (!targetDay) return;

      const place = targetDay.places.find(
        (p) => p._id === placeId || (typeof p.placeId === 'object' && p.placeId._id === placeId)
      );
      if (place) {
        place.visited = visited;
        place.checkInTime = visited ? new Date().toISOString() : undefined;
      }
    },

    /** Reset thông báo lỗi */
    clearTripError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchMyTrips
    builder.addCase(fetchMyTrips.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMyTrips.fulfilled, (state, action) => {
      state.loading = false;
      state.trips = action.payload;
    });
    builder.addCase(fetchMyTrips.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // fetchTripById
    builder.addCase(fetchTripById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTripById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentTrip = action.payload;
    });
    builder.addCase(fetchTripById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // reorderScheduleThunk
    builder.addCase(reorderScheduleThunk.pending, (state) => {
      state.reorderLoading = true;
      state.error = null;
    });
    builder.addCase(reorderScheduleThunk.fulfilled, (state, action) => {
      state.reorderLoading = false;
      // Cập nhật currentTrip từ response đã đồng bộ
      state.currentTrip = action.payload;
    });
    builder.addCase(reorderScheduleThunk.rejected, (state, action) => {
      state.reorderLoading = false;
      state.error = action.payload as string;
    });

    // addPlaceThunk
    builder.addCase(addPlaceThunk.fulfilled, (state, action) => {
      state.currentTrip = action.payload;
    });

    // removePlaceThunk
    builder.addCase(removePlaceThunk.fulfilled, (state, action) => {
      state.currentTrip = action.payload;
    });

    // checkInPlaceThunk
    builder.addCase(checkInPlaceThunk.fulfilled, (state, action) => {
      state.currentTrip = action.payload;
    });
  },
});

export const {
  setCurrentTrip,
  saveDndSnapshot,
  rollbackDnd,
  clearDndSnapshot,
  reorderPlacesOptimistic,
  removePlaceOptimistic,
  checkInPlaceOptimistic,
  clearTripError,
} = tripSlice.actions;

export default tripSlice.reducer;

