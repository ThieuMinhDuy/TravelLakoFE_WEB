import { useCallback, useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ReactReduxContext } from 'react-redux';
import { toast } from 'sonner';
import * as aiService from '../../../services/aiService';
import { ApiError } from '../../../services/apiError';
import { queryKeys } from '../../../lib/queryKeys';
import {
  AISuggestRequestDTO,
  AISuggestionResponse,
  AIOptimizeRequestDTO,
  AIOptimizeResponse,
} from '../../../types/ai';
import { useAIChatStoreApi } from '../../../store/aiChatStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { setCurrentTrip } from '../../../store/tripSlice';
import { TripDetail } from '../../../types/trip';

export interface UseAISuggestionProps {
  tripId?: string;
  currentTrip?: TripDetail | null;
  onApplySchedule?: (suggestedTrip: AIOptimizeResponse | AISuggestionResponse) => void;
}

function getAIErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.status === 401) {
    return 'Vui lòng đăng nhập để sử dụng Trợ lý AI!';
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * Hook kết nối các tính năng AI Assistant của Gemini qua TanStack Query & Zustand:
 * 1. Chat với Trợ lý AI (hỏi đáp du lịch, địa điểm, thời tiết).
 * 2. Sinh lịch trình tự động hoàn chỉnh từ thông tin đầu vào.
 * 3. Tối ưu hóa tuyến đường di chuyển ngắn nhất cho lịch trình hiện tại.
 * 4. Quản lý lịch sử hội thoại.
 */
export function useAISuggestion({
  tripId,
  currentTrip,
  onApplySchedule,
}: UseAISuggestionProps = {}) {
  const queryClient = useQueryClient();
  const chatStore = useAIChatStoreApi();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // Truy cập Redux store tùy chọn để không crash khi AIchat dùng độc lập ngoài Redux Provider
  const reduxContext = useContext(ReactReduxContext);
  const resolvedTripId = tripId || currentTrip?._id;

  // ─── 1. Query lấy lịch sử chat (chỉ gọi khi đã đăng nhập) ────────────────
  const chatHistoryQuery = useQuery({
    queryKey: ['ai-chat-history'],
    queryFn: async () => {
      const data = await aiService.getChatHistory();
      if (data && data.messages && data.messages.length > 0) {
        chatStore.getState().setChatMessages(data.messages);
      }
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // ─── 2. Mutation gửi tin nhắn Chat ─────────────────────────────────────────
  const sendChatMutation = useMutation({
    mutationFn: (message: string) => aiService.sendChatMessage({ message }),
    onMutate: (message: string) => {
      chatStore.getState().addChatMessage({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      });
      chatStore.getState().setIsAITyping(true);
    },
    onSuccess: (data) => {
      chatStore.getState().addChatMessage({
        role: 'model',
        content: data.reply,
        timestamp: data.timestamp || new Date().toISOString(),
      });
      chatStore.getState().setIsAITyping(false);
    },
    onError: (error: unknown) => {
      const msg = getAIErrorMessage(error, 'Lỗi khi gửi tin nhắn tới AI');
      chatStore.getState().setIsAITyping(false);
      chatStore.getState().addChatMessage({
        role: 'model',
        content:
          error instanceof ApiError && error.status === 401
            ? 'Bạn cần đăng nhập để trò chuyện với Trợ lý AI.'
            : 'Rất tiếc, đã có sự cố kết nối tới Trợ lý AI. Vui lòng thử lại sau ít phút!',
        timestamp: new Date().toISOString(),
      });
      toast.error(msg);
    },
  });

  // ─── 3. Mutation sinh gợi ý lịch trình (chỉ preview, user bấm Áp dụng mới lưu) ─
  const suggestTripMutation = useMutation({
    mutationFn: (data: AISuggestRequestDTO) => aiService.generateAISuggestion(data),
    onSuccess: () => {
      toast.success('AI đã thiết kế xong lịch trình gợi ý!');
    },
    onError: (error: unknown) => {
      toast.error(getAIErrorMessage(error, 'Lỗi khi yêu cầu AI tạo lịch trình'));
    },
  });

  // ─── 4. Mutation tối ưu hóa thứ tự di chuyển ──────────────────────────────
  const optimizeTripMutation = useMutation({
    mutationFn: (data: AIOptimizeRequestDTO) => {
      if (!resolvedTripId) throw new Error('Không tìm thấy ID của chuyến đi để tối ưu!');
      return aiService.optimizeTrip(resolvedTripId, data);
    },
    onSuccess: (data) => {
      if (data.preview) {
        toast.info('Đã tạo bản xem trước lộ trình tối ưu!');
      } else {
        toast.success('Đã lưu lộ trình di chuyển tối ưu vào chuyến đi!');
        const firstPlace = data.schedule?.[0]?.places?.[0];
        const isPopulated =
          !firstPlace || (typeof firstPlace.placeId === 'object' && firstPlace.placeId !== null);

        if (currentTrip && reduxContext?.store && isPopulated) {
          const updated: TripDetail = {
            ...currentTrip,
            schedule: data.schedule as unknown as TripDetail['schedule'],
          };
          reduxContext.store.dispatch(setCurrentTrip(updated));
        }

        if (resolvedTripId) {
          void queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(resolvedTripId) });
        }
        void queryClient.invalidateQueries({ queryKey: queryKeys.trips.mine() });
      }

      if (onApplySchedule && !data.preview) {
        onApplySchedule(data);
      }
    },
    onError: (error: unknown) => {
      toast.error(getAIErrorMessage(error, 'Lỗi khi tối ưu hóa lịch trình bằng AI'));
    },
  });

  // ─── 5. Mutation xóa lịch sử chat ──────────────────────────────────────────
  const clearChatMutation = useMutation({
    mutationFn: () => aiService.clearChatHistory(),
    onSuccess: () => {
      chatStore.getState().clearChatMessages();
      toast.success('Đã xóa toàn bộ lịch sử trò chuyện!');
    },
    onError: (error: unknown) => {
      toast.error(getAIErrorMessage(error, 'Lỗi khi xóa lịch sử chat'));
    },
  });

  const handleSendMessage = useCallback(
    (message: string) => {
      if (!message.trim()) return;
      sendChatMutation.mutate(message);
    },
    [sendChatMutation]
  );

  return {
    sendMessage: handleSendMessage,
    isChatSending: sendChatMutation.isPending,
    chatHistoryLoading: chatHistoryQuery.isLoading,
    clearChatHistory: clearChatMutation.mutate,
    isClearingChat: clearChatMutation.isPending,

    generateSuggestion: suggestTripMutation.mutate,
    isSuggesting: suggestTripMutation.isPending,
    suggestedData: suggestTripMutation.data,

    optimizeTrip: optimizeTripMutation.mutate,
    isOptimizing: optimizeTripMutation.isPending,
    optimizedData: optimizeTripMutation.data,
  };
}
