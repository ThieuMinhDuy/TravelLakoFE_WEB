import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as aiService from '../services/aiService';
import {
  AISuggestRequestDTO,
  AISuggestionResponse,
  AIOptimizeRequestDTO,
  AIOptimizeResponse,
} from '../types/ai';
import { useTripUIStoreApi } from '../store/tripUIStore';
import { useAppDispatch } from '../../../store/reduxStore';
import { setCurrentTrip } from '../store/tripSlice';
import { TripDetail } from '../types/trip';

export interface UseAISuggestionProps {
  tripId?: string;
  currentTrip?: TripDetail | null;
  onApplySchedule?: (suggestedTrip: AIOptimizeResponse | AISuggestionResponse) => void;
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
  const uiStore = useTripUIStoreApi();
  const dispatch = useAppDispatch();

  // ─── 1. Query lấy lịch sử chat ─────────────────────────────────────────────
  const chatHistoryQuery = useQuery({
    queryKey: ['ai-chat-history'],
    queryFn: async () => {
      const data = await aiService.getChatHistory();
      if (data && data.messages && data.messages.length > 0) {
        uiStore.getState().setChatMessages(data.messages);
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  // ─── 2. Mutation gửi tin nhắn Chat ─────────────────────────────────────────
  const sendChatMutation = useMutation({
    mutationFn: (message: string) => aiService.sendChatMessage({ message }),
    onMutate: (message: string) => {
      // Optimistic: thêm tin nhắn của user ngay lập tức vào Zustand UI
      uiStore.getState().addChatMessage({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString(),
      });
      uiStore.getState().setIsAITyping(true);
    },
    onSuccess: (data) => {
      // Thêm phản hồi của AI model vào cuộc hội thoại
      uiStore.getState().addChatMessage({
        role: 'model',
        content: data.reply,
        timestamp: data.timestamp || new Date().toISOString(),
      });
      uiStore.getState().setIsAITyping(false);
    },
    onError: (error: Error) => {
      uiStore.getState().setIsAITyping(false);
      uiStore.getState().addChatMessage({
        role: 'model',
        content: 'Rất tiếc, đã có sự cố kết nối tới Trợ lý AI. Vui lòng thử lại sau ít phút!',
        timestamp: new Date().toISOString(),
      });
      toast.error(error.message || 'Lỗi khi gửi tin nhắn tới AI');
    },
  });

  // ─── 3. Mutation sinh gợi ý lịch trình ────────────────────────────────────
  const suggestTripMutation = useMutation({
    mutationFn: (data: AISuggestRequestDTO) => aiService.generateAISuggestion(data),
    onSuccess: (data) => {
      toast.success('AI đã thiết kế xong lịch trình gợi ý!');
      if (onApplySchedule) {
        onApplySchedule(data);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Lỗi khi yêu cầu AI tạo lịch trình');
    },
  });

  // ─── 4. Mutation tối ưu hóa thứ tự di chuyển ──────────────────────────────
  const optimizeTripMutation = useMutation({
    mutationFn: (data: AIOptimizeRequestDTO) => {
      const targetId = tripId || currentTrip?._id;
      if (!targetId) throw new Error('Không tìm thấy ID của chuyến đi để tối ưu!');
      return aiService.optimizeTrip(targetId, data);
    },
    onSuccess: (data) => {
      if (data.preview) {
        toast.info('Đã tạo bản xem trước lộ trình tối ưu!');
      } else {
        toast.success('Đã lưu lộ trình di chuyển tối ưu vào chuyến đi!');
        // Cập nhật lại currentTrip trong Redux nếu BE lưu trực tiếp
        if (currentTrip) {
          const updated: TripDetail = {
            ...currentTrip,
            schedule: data.schedule as unknown as TripDetail['schedule'],
          };
          dispatch(setCurrentTrip(updated));
        }
        // Invalidate cache liên quan
        queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      }

      if (onApplySchedule) {
        onApplySchedule(data);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Lỗi khi tối ưu hóa lịch trình bằng AI');
    },
  });

  // ─── 5. Mutation xóa lịch sử chat ──────────────────────────────────────────
  const clearChatMutation = useMutation({
    mutationFn: () => aiService.clearChatHistory(),
    onSuccess: () => {
      uiStore.getState().clearChatMessages();
      toast.success('Đã xóa toàn bộ lịch sử trò chuyện!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Lỗi khi xóa lịch sử chat');
    },
  });

  // Gửi tin nhắn tiện ích
  const handleSendMessage = useCallback(
    (message: string) => {
      if (!message.trim()) return;
      sendChatMutation.mutate(message);
    },
    [sendChatMutation]
  );

  return {
    // Chat
    sendMessage: handleSendMessage,
    isChatSending: sendChatMutation.isPending,
    chatHistoryLoading: chatHistoryQuery.isLoading,
    clearChatHistory: clearChatMutation.mutate,
    isClearingChat: clearChatMutation.isPending,

    // Gợi ý
    generateSuggestion: suggestTripMutation.mutate,
    isSuggesting: suggestTripMutation.isPending,
    suggestedData: suggestTripMutation.data,

    // Tối ưu
    optimizeTrip: optimizeTripMutation.mutate,
    isOptimizing: optimizeTripMutation.isPending,
    optimizedData: optimizeTripMutation.data,
  };
}

