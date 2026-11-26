import { useState, useRef, useEffect, memo } from 'react';
import { useInRouterContext } from 'react-router-dom';
import {
  Bot,
  X,
  Send,
  Route,
  MessageSquare,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAIChatStoreApi, useAIChatContext } from '../../../store/aiChatStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { useAISuggestion } from '../hooks/useAISuggestion';
import { TripDetail, AIOptimizeResponse, AISuggestionResponse } from '../../../types';
import { OpenAuthLink } from '../../auth/components/OpenAuthLink';
import { AIChatBubble, AITypingIndicator } from './AIChatBubble';
import { AIOptimizeTab } from './AIOptimizeTab';
import { cn } from '../../../utils/cn';

export interface AIAssistantPanelProps {
  currentTrip?: TripDetail | null;
  onApplySchedule?: (suggestedTrip: AISuggestionResponse) => Promise<void> | void;
  onOptimizeApplied?: (optimizedTrip: AIOptimizeResponse) => void;
  isApplying?: boolean;
}

const QUICK_PROMPTS = [
  'Gợi ý 3 món ăn nổi tiếng nhất ở đây',
  'Lên lịch trình du lịch Đà Nẵng 2 ngày ngân sách 4 triệu',
  'Chi phí 2 ngày 1 đêm khoảng bao nhiêu?',
];

/**
 * Slide-in Panel Trợ lý AI du lịch:
 * Gồm 2 tabs: Trò chuyện tư vấn (có nút Lưu lịch trình khi AI gợi ý lịch trình) và Tối ưu lộ trình.
 */
export const AIAssistantPanel = memo(function AIAssistantPanel({
  currentTrip,
  onApplySchedule,
  onOptimizeApplied,
  isApplying = false,
}: AIAssistantPanelProps) {
  const chatStore = useAIChatStoreApi();
  const isOpen = useAIChatContext((s) => s.isAIPanelOpen);
  const rawActiveTab = useAIChatContext((s) => s.activeAITab);
  const activeTab = rawActiveTab === 'optimize' ? 'optimize' : 'chat';
  const messages = useAIChatContext((s) => s.aiChatMessages);
  const isTyping = useAIChatContext((s) => s.isAITyping);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const inRouter = useInRouterContext();

  const [inputMessage, setInputMessage] = useState('');
  const [savingMsgKey, setSavingMsgKey] = useState<string | null>(null);
  const [savedMsgKeys, setSavedMsgKeys] = useState<string[]>([]);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const {
    sendMessage,
    isChatSending,
    clearChatHistory,
    generateSuggestionAsync,
    isSuggesting,
    optimizeTrip,
    isOptimizing,
    optimizedData,
  } = useAISuggestion({
    tripId: currentTrip?._id,
    currentTrip,
    onApplySchedule: (result) => {
      if ('preview' in result) {
        onOptimizeApplied?.(result);
      }
    },
  });

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isChatSending) return;
    sendMessage(inputMessage.trim());
    setInputMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveScheduleFromChat = async (msgKey: string, content: string) => {
    if (savingMsgKey !== null || isSuggesting || isApplying) return;

    setSavingMsgKey(msgKey);
    try {
      const parsed = await generateSuggestionAsync({
        isParse: true,
        notes: content,
      });

      const hasPlaces = parsed.schedule?.some((day) => (day.places?.length ?? 0) > 0);
      if (!parsed.city?._id || !hasPlaces) {
        toast.error(
          'Chưa trích xuất được địa điểm cụ thể từ lịch trình này. Hãy yêu cầu AI nêu rõ tên thành phố và địa điểm nhé!'
        );
        return;
      }

      await onApplySchedule?.(parsed);
      setSavedMsgKeys((prev) => (prev.includes(msgKey) ? prev : [...prev, msgKey]));
    } catch {
      // Lỗi từ API đã được toast ở useAISuggestion / onApplySchedule
    } finally {
      setSavingMsgKey(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop mờ phía sau trên mobile/tablet */}
      <div
        onClick={() => chatStore.getState().setAIPanelOpen(false)}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden animate-fade-in"
      />

      {/* Drawer slide-in từ phải sang */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white border-l border-zinc-200 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out'
        )}
      >
        {/* Header Panel */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-linear-to-r from-amber-500/10 via-orange-500/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-tr from-[#FA8B02] to-amber-500 text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-zinc-900">
                  Trợ lý Du lịch Ảo AI
                </h3>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                  Gemini
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Sẵn sàng giải đáp & thiết kế lịch trình cho bạn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {activeTab === 'chat' && messages.length > 0 && isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setSavedMsgKeys([]);
                  clearChatHistory();
                }}
                title="Xóa lịch sử chat"
                className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => chatStore.getState().setAIPanelOpen(false)}
              aria-label="Đóng Trợ lý AI"
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nhắc đăng nhập khi khách chưa đăng nhập */}
        {!isAuthenticated && inRouter && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center justify-between gap-2 text-[11px] text-amber-900">
            <span>Đăng nhập để dùng đầy đủ AI và lưu lịch sử trò chuyện.</span>
            <OpenAuthLink
              to="/login"
              onClick={() => chatStore.getState().setAIPanelOpen(false)}
              className="font-bold text-[#9A4E00] underline shrink-0"
            >
              Đăng nhập
            </OpenAuthLink>
          </div>
        )}

        {/* Tab Switcher: Trò chuyện & Tối ưu lộ trình */}
        <div className="flex items-center p-2 border-b border-zinc-200 bg-zinc-50 gap-1 text-xs">
          <button
            type="button"
            onClick={() => chatStore.getState().setActiveAITab('chat')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-medium transition-colors cursor-pointer',
              activeTab === 'chat'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-800'
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Trò chuyện
          </button>

          <button
            type="button"
            onClick={() => chatStore.getState().setActiveAITab('optimize')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-medium transition-colors cursor-pointer',
              activeTab === 'optimize'
                ? 'bg-white text-blue-600 shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-800'
            )}
          >
            <Route className="w-3.5 h-3.5" />
            Tối ưu lộ trình
          </button>
        </div>

        {/* Nội dung Tab */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'chat' && (
            <div className="flex flex-col h-full">
              {/* Danh sách tin nhắn cuộn */}
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-2 pr-1">
                {messages.map((msg, idx) => {
                  const msgKey = msg._id || `${idx}-${msg.content.slice(0, 32)}`;
                  return (
                    <AIChatBubble
                      key={msgKey}
                      message={msg}
                      onSaveSchedule={
                        onApplySchedule
                          ? (content) => void handleSaveScheduleFromChat(msgKey, content)
                          : undefined
                      }
                      isSavingSchedule={savingMsgKey === msgKey}
                      isScheduleSaved={savedMsgKeys.includes(msgKey)}
                    />
                  );
                })}
                {isTyping && <AITypingIndicator />}
              </div>

              {/* Quick Prompt Chips */}
              <div className="pt-2 pb-1 border-t border-zinc-100">
                <p className="text-[11px] text-zinc-400 mb-1.5 font-medium">
                  Gợi ý câu hỏi nhanh:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-zinc-100 hover:bg-blue-50 hover:text-blue-600 text-zinc-600 transition-colors cursor-pointer"
                    >
                      <span>{prompt}</span>
                      <ChevronRight className="w-3 h-3 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Ô nhập tin nhắn */}
              <form onSubmit={handleSend} className="pt-2 flex items-center gap-2">
                <textarea
                  rows={1}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Hỏi AI bất cứ điều gì về chuyến đi... (Enter để gửi)"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none max-h-24"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isChatSending}
                  aria-label="Gửi tin nhắn"
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {activeTab === 'optimize' && (
            <AIOptimizeTab
              currentTrip={currentTrip}
              onOptimize={optimizeTrip}
              isLoading={isOptimizing}
              optimizedResult={optimizedData}
              onSaveOptimized={
                optimizedData
                  ? () =>
                      optimizeTrip({
                        preview: false,
                        optimizedSchedule: optimizedData.schedule,
                      })
                  : undefined
              }
            />
          )}
        </div>
      </div>
    </>
  );
});
