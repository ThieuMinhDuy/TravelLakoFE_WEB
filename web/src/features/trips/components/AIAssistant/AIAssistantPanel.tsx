import { useState, useRef, useEffect, memo } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Route,
  MessageSquare,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { useTripUIStoreApi, useTripUIContext, AITabType } from '../../../../store/tripUIStore';
import { useAISuggestion } from '../../../../hooks/useAISuggestion';
import { TripDetail } from '../../../../types';
import { AIChatBubble, AITypingIndicator } from './AIChatBubble';
import { AISuggestTab } from './AISuggestTab';
import { AIOptimizeTab } from './AIOptimizeTab';
import { cn } from '../../../../utils/cn';

export interface AIAssistantPanelProps {
  currentTrip?: TripDetail | null;
}

const QUICK_PROMPTS = [
  'Gợi ý 3 món ăn nổi tiếng nhất ở đây',
  'Thời tiết mùa này đi đâu đẹp nhất?',
  'Chi phí 2 ngày 1 đêm khoảng bao nhiêu?',
];

/**
 * Slide-in Panel Trợ lý AI du lịch:
 * Gồm 3 tabs: Chat tư vấn tự do, Gợi ý lịch trình hoàn chỉnh, Tối ưu lộ trình di chuyển.
 */
export const AIAssistantPanel = memo(function AIAssistantPanel({
  currentTrip,
}: AIAssistantPanelProps) {
  const uiStore = useTripUIStoreApi();
  const isOpen = useTripUIContext((s) => s.isAIPanelOpen);
  const activeTab = useTripUIContext((s) => s.activeAITab);
  const messages = useTripUIContext((s) => s.aiChatMessages);
  const isTyping = useTripUIContext((s) => s.isAITyping);

  const [inputMessage, setInputMessage] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const {
    sendMessage,
    isChatSending,
    clearChatHistory,
    generateSuggestion,
    isSuggesting,
    suggestedData,
    optimizeTrip,
    isOptimizing,
    optimizedData,
  } = useAISuggestion({
    tripId: currentTrip?._id,
    currentTrip,
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop mờ phía sau trên mobile/tablet */}
      <div
        onClick={() => uiStore.getState().setAIPanelOpen(false)}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden animate-fade-in"
      />

      {/* Drawer slide-in từ phải sang */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out'
        )}
      >
        {/* Header Panel */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-linear-to-r from-blue-600/10 via-indigo-600/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Trợ lý Du lịch Ảo AI
                </h3>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  Gemini
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Sẵn sàng giải đáp & thiết kế lịch trình cho bạn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {activeTab === 'chat' && messages.length > 0 && (
              <button
                type="button"
                onClick={() => clearChatHistory()}
                title="Xóa lịch sử chat"
                className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => uiStore.getState().setAIPanelOpen(false)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Chat, Gợi ý, Tối ưu */}
        <div className="flex items-center p-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 gap-1 text-xs">
          <button
            type="button"
            onClick={() => uiStore.getState().setActiveAITab('chat')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-medium transition-colors cursor-pointer',
              activeTab === 'chat'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Trò chuyện
          </button>

          <button
            type="button"
            onClick={() => uiStore.getState().setActiveAITab('suggest')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-medium transition-colors cursor-pointer',
              activeTab === 'suggest'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            )}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Gợi ý mới
          </button>

          <button
            type="button"
            onClick={() => uiStore.getState().setActiveAITab('optimize')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl font-medium transition-colors cursor-pointer',
              activeTab === 'optimize'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
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
                {messages.map((msg, idx) => (
                  <AIChatBubble key={idx} message={msg} />
                ))}
                {isTyping && <AITypingIndicator />}
              </div>

              {/* Quick Prompt Chips */}
              <div className="pt-2 pb-1 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-1.5 font-medium">
                  Gợi ý câu hỏi nhanh:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
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
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none max-h-24"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isChatSending}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {activeTab === 'suggest' && (
            <AISuggestTab
              onGenerateSuggestion={generateSuggestion}
              isLoading={isSuggesting}
              suggestedResult={suggestedData}
            />
          )}

          {activeTab === 'optimize' && (
            <AIOptimizeTab
              currentTrip={currentTrip}
              onOptimize={optimizeTrip}
              isLoading={isOptimizing}
              optimizedResult={optimizedData}
            />
          )}
        </div>
      </div>
    </>
  );
});

