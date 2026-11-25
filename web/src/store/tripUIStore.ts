import { createContext, useContext, useRef, ReactNode, createElement } from 'react';
import { createStore, useStore } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { ChatMessage } from '../types/ai';
import { PopulatedPlaceInSchedule } from '../types/trip';

// ─── Kiểu dữ liệu UI State cho Trips ─────────────────────────────────────────
export type AITabType = 'chat' | 'suggest' | 'optimize';

export interface TripUIState {
  // Tab ngày đang được chọn (0 = Ngày 1, 1 = Ngày 2...)
  selectedDayIndex: number;
  // Trạng thái mở/đóng AI Panel dạng slide-in / FAB
  isAIPanelOpen: boolean;
  // Tab hiện tại trong AI Panel
  activeAITab: AITabType;
  // Trạng thái người dùng đang kéo thả item
  isDragging: boolean;
  // Địa điểm đang xem chi tiết qua Modal (nếu có)
  activePlaceModal: PopulatedPlaceInSchedule | null;
  // Danh sách tin nhắn trao đổi với Trợ lý AI
  aiChatMessages: ChatMessage[];
  // AI đang trong trạng thái suy nghĩ / sinh phản hồi
  isAITyping: boolean;

  // ─── Actions ───
  setSelectedDayIndex: (index: number) => void;
  toggleAIPanel: () => void;
  setAIPanelOpen: (open: boolean) => void;
  setActiveAITab: (tab: AITabType) => void;
  setIsDragging: (isDragging: boolean) => void;
  setActivePlaceModal: (place: PopulatedPlaceInSchedule | null) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setChatMessages: (msgs: ChatMessage[]) => void;
  setIsAITyping: (isTyping: boolean) => void;
  clearChatMessages: () => void;
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
        isAIPanelOpen: initialProps?.isAIPanelOpen ?? false,
        activeAITab: initialProps?.activeAITab ?? 'chat',
        isDragging: initialProps?.isDragging ?? false,
        activePlaceModal: initialProps?.activePlaceModal ?? null,
        aiChatMessages: initialProps?.aiChatMessages ?? [
          {
            role: 'model',
            content:
              'Xin chào! Tôi là Trợ lý du lịch ảo của TravelLako. Tôi có thể gợi ý địa điểm, thiết kế lịch trình hoặc tối ưu hóa thứ tự di chuyển cho bạn!',
          },
        ],
        isAITyping: false,

        setSelectedDayIndex: (index) => set({ selectedDayIndex: index }),
        toggleAIPanel: () => set((state) => ({ isAIPanelOpen: !state.isAIPanelOpen })),
        setAIPanelOpen: (open) => set({ isAIPanelOpen: open }),
        setActiveAITab: (tab) => set({ activeAITab: tab }),
        setIsDragging: (isDragging) => set({ isDragging }),
        setActivePlaceModal: (place) => set({ activePlaceModal: place }),
        addChatMessage: (msg) =>
          set((state) => ({ aiChatMessages: [...state.aiChatMessages, msg] })),
        setChatMessages: (msgs) => set({ aiChatMessages: msgs }),
        setIsAITyping: (isTyping) => set({ isAITyping: isTyping }),
        clearChatMessages: () => set({ aiChatMessages: [] }),
        resetUI: () =>
          set({
            selectedDayIndex: 0,
            isAIPanelOpen: false,
            activeAITab: 'chat',
            isDragging: false,
            activePlaceModal: null,
            isAITyping: false,
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

