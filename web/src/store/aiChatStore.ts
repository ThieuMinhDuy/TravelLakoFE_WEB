import { createContext, useContext, useRef, ReactNode, createElement } from 'react';
import { createStore, useStore } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { ChatMessage } from '../types/ai';

// ─── Kiểu dữ liệu UI State cho AI Chat & Assistant ───────────────────────────
export type AITabType = 'chat' | 'optimize';

export interface AIChatState {
  // Trạng thái mở/đóng AI Panel dạng slide-in / FAB
  isAIPanelOpen: boolean;
  // Tab hiện tại trong AI Panel
  activeAITab: AITabType;
  // Danh sách tin nhắn trao đổi với Trợ lý AI
  aiChatMessages: ChatMessage[];
  // AI đang trong trạng thái suy nghĩ / sinh phản hồi
  isAITyping: boolean;

  // ─── Actions ───
  toggleAIPanel: () => void;
  setAIPanelOpen: (open: boolean) => void;
  setActiveAITab: (tab: AITabType) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setChatMessages: (msgs: ChatMessage[]) => void;
  setIsAITyping: (isTyping: boolean) => void;
  clearChatMessages: () => void;
  resetAIChat: () => void;
}

export type AIChatStore = ReturnType<typeof createAIChatStore>;

const DEFAULT_WELCOME_MESSAGES: ChatMessage[] = [
  {
    role: 'model',
    content:
      'Xin chào! Tôi là Trợ lý du lịch ảo của TravelLako. Tôi có thể gợi ý địa điểm, thiết kế lịch trình hoặc tối ưu hóa thứ tự di chuyển cho bạn!',
  },
];

/**
 * Factory tạo Zustand Store riêng cho tính năng AI Chat & Assistant.
 */
export const createAIChatStore = (initialProps?: Partial<AIChatState>) => {
  return createStore<AIChatState>()(
    devtools(
      subscribeWithSelector((set) => ({
        isAIPanelOpen: initialProps?.isAIPanelOpen ?? false,
        activeAITab: initialProps?.activeAITab ?? 'chat',
        aiChatMessages: initialProps?.aiChatMessages ?? DEFAULT_WELCOME_MESSAGES,
        isAITyping: initialProps?.isAITyping ?? false,

        toggleAIPanel: () => set((state) => ({ isAIPanelOpen: !state.isAIPanelOpen })),
        setAIPanelOpen: (open) => set({ isAIPanelOpen: open }),
        setActiveAITab: (tab) => set({ activeAITab: tab }),
        addChatMessage: (msg) =>
          set((state) => ({ aiChatMessages: [...state.aiChatMessages, msg] })),
        setChatMessages: (msgs) => set({ aiChatMessages: msgs }),
        setIsAITyping: (isTyping) => set({ isAITyping: isTyping }),
        clearChatMessages: () => set({ aiChatMessages: [] }),
        resetAIChat: () =>
          set({
            isAIPanelOpen: false,
            activeAITab: 'chat',
            isAITyping: false,
          }),
      })),
      { name: 'AIChatStore' }
    )
  );
};

// ─── Singleton Global Store (dùng khi AIchat gắn toàn cục trên layout) ────────
export const globalAIChatStore = createAIChatStore();

// ─── React Context Integration (Zustand Context Pattern) ─────────────────────
const AIChatContext = createContext<AIChatStore | null>(null);

export interface AIChatProviderProps {
  children: ReactNode;
  initialProps?: Partial<AIChatState>;
}

/**
 * Provider cấp phát scoped store riêng biệt cho AI Chat khi cần cô lập state.
 */
export function AIChatProvider({ children, initialProps }: AIChatProviderProps) {
  const storeRef = useRef<AIChatStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createAIChatStore(initialProps);
  }

  return createElement(
    AIChatContext.Provider,
    { value: storeRef.current },
    children
  );
}

/**
 * Hook truy cập Zustand state của AI Chat qua Context (fallback về globalAIChatStore).
 */
export function useAIChatContext<T>(selector: (state: AIChatState) => T): T {
  const store = useContext(AIChatContext);
  const currentStore = store || globalAIChatStore;
  return useStore(currentStore, selector);
}

/**
 * Hook truy xuất action dispatcher trực tiếp từ AI Chat store.
 */
export function useAIChatStoreApi() {
  const store = useContext(AIChatContext);
  return store || globalAIChatStore;
}

