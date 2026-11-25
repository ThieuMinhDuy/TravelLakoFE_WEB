import { createContext, useContext, useRef, ReactNode, createElement } from 'react';
import { createStore, useStore } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { PopulatedPlaceInSchedule } from '../types/trip';

// ─── Kiểu dữ liệu UI State cho Trip Schedule ─────────────────────────────────
export interface TripUIState {
  // Tab ngày đang được chọn (0 = Ngày 1, 1 = Ngày 2...)
  selectedDayIndex: number;
  // Trạng thái người dùng đang kéo thả item
  isDragging: boolean;
  // Địa điểm đang xem chi tiết qua Modal (nếu có)
  activePlaceModal: PopulatedPlaceInSchedule | null;

  // ─── Actions ───
  setSelectedDayIndex: (index: number) => void;
  setIsDragging: (isDragging: boolean) => void;
  setActivePlaceModal: (place: PopulatedPlaceInSchedule | null) => void;
  resetUI: () => void;
}

export type TripUIStore = ReturnType<typeof createTripUIStore>;

/**
 * Factory tạo Zustand Store với 2 Middlewares:
 * 1. devtools: hỗ trợ Redux DevTools extension để debug state time-travel.
 * 2. subscribeWithSelector: cho phép subscribe vào từng phần riêng biệt của state mà không re-render toàn bộ.
 */
export const createTripUIStore = (initialProps?: Partial<TripUIState>) => {
  return createStore<TripUIState>()(
    devtools(
      subscribeWithSelector((set) => ({
        selectedDayIndex: initialProps?.selectedDayIndex ?? 0,
        isDragging: initialProps?.isDragging ?? false,
        activePlaceModal: initialProps?.activePlaceModal ?? null,

        setSelectedDayIndex: (index) => set({ selectedDayIndex: index }),
        setIsDragging: (isDragging) => set({ isDragging }),
        setActivePlaceModal: (place) => set({ activePlaceModal: place }),
        resetUI: () =>
          set({
            selectedDayIndex: 0,
            isDragging: false,
            activePlaceModal: null,
          }),
      })),
      { name: 'TripUIStore' }
    )
  );
};

// ─── Singleton Global Store (dùng trực tiếp khi không cần Context) ────────────
export const globalTripUIStore = createTripUIStore();

// ─── React Context Integration (Zustand_Context_Middleware Pattern) ──────────
const TripUIContext = createContext<TripUIStore | null>(null);

export interface TripUIProviderProps {
  children: ReactNode;
  initialProps?: Partial<TripUIState>;
}

/**
 * Provider cấp phát scoped store riêng biệt cho từng trang hoặc component TripSchedule.
 * Tránh leak state khi chuyển qua lại giữa các chuyến đi khác nhau.
 */
export function TripUIProvider({ children, initialProps }: TripUIProviderProps) {
  const storeRef = useRef<TripUIStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createTripUIStore(initialProps);
  }

  return createElement(
    TripUIContext.Provider,
    { value: storeRef.current },
    children
  );
}

/**
 * Custom Hook truy cập Zustand state qua Context (Zustand Context Pattern).
 * Nhận vào selector để tối ưu hiệu năng re-render.
 */
export function useTripUIContext<T>(selector: (state: TripUIState) => T): T {
  const store = useContext(TripUIContext);
  // Nếu có Provider thì dùng store từ Context, nếu không fallback về globalTripUIStore
  const currentStore = store || globalTripUIStore;
  return useStore(currentStore, selector);
}

/**
 * Hook truy xuất action dispatcher trực tiếp từ store
 */
export function useTripUIStoreApi() {
  const store = useContext(TripUIContext);
  return store || globalTripUIStore;
}
