import { memo, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import logoImg from '../../../assets/logo.png';
import { useAIChatStoreApi, useAIChatContext } from '../../../store/aiChatStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { cn } from '../../../utils/cn';
import { useAIChatHistoryQuery } from '../hooks/useAISuggestion';

const DISMISS_STORAGE_PREFIX = 'tripmate_ai_nudge_dismissed_';

function readDismissed(userId: string): boolean {
  try {
    return sessionStorage.getItem(`${DISMISS_STORAGE_PREFIX}${userId}`) === '1';
  } catch {
    return false;
  }
}

function saveDismissed(userId: string): void {
  try {
    sessionStorage.setItem(`${DISMISS_STORAGE_PREFIX}${userId}`, '1');
  } catch {
    // Bỏ qua nếu trình duyệt chặn storage
  }
}

/**
 * Nút Floating Action Button (FAB) chỉ hiển thị logo web ở góc dưới phải.
 * Khi người dùng đã đăng nhập nhưng chưa từng sử dụng AI chat, hiển thị bong bóng nhắc nhở phía trên nút.
 */
export const AIAssistantFAB = memo(function AIAssistantFAB() {
  const chatStore = useAIChatStoreApi();
  const isOpen = useAIChatContext((s) => s.isAIPanelOpen);
  const messages = useAIChatContext((s) => s.aiChatMessages);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userId = useAuthStore((s) => s.user?._id ?? '');

  const [dismissedForUser, setDismissedForUser] = useState<string | null>(() =>
    userId && readDismissed(userId) ? userId : null
  );

  // Đồng bộ khi chuyển tài khoản đăng nhập
  const [trackedUserKey, setTrackedUserKey] = useState(`${isAuthenticated}:${userId}`);
  const currentUserKey = `${isAuthenticated}:${userId}`;
  if (trackedUserKey !== currentUserKey) {
    setTrackedUserKey(currentUserKey);
    setDismissedForUser(userId && readDismissed(userId) ? userId : null);
  }

  const historyQuery = useAIChatHistoryQuery();

  const hasUsedStoreChat = messages.some((m) => m.role === 'user');
  const hasUsedHistoryChat =
    historyQuery.data?.messages?.some((m) => m.role === 'user') ?? false;
  const hasUsedAIChat = hasUsedStoreChat || hasUsedHistoryChat;
  const isDismissed = Boolean(userId && (dismissedForUser === userId || readDismissed(userId)));

  // Chỉ hiện câu nhắc nhở khi đã đăng nhập, panel đang đóng, chưa dùng AI chat và chưa tự đóng nhắc nhở
  const showReminder =
    isAuthenticated &&
    !isOpen &&
    !isDismissed &&
    !hasUsedAIChat &&
    historyQuery.isSuccess;

  const dismissReminder = () => {
    if (!userId) return;
    saveDismissed(userId);
    setDismissedForUser(userId);
  };

  const handleOpenAssistant = () => {
    dismissReminder();
    chatStore.getState().setActiveAITab('chat');
    chatStore.getState().toggleAIPanel();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
      {showReminder && (
        <div
          role="status"
          aria-live="polite"
          className="relative max-w-[260px] rounded-2xl border border-[#F6D6AC] bg-white px-3.5 py-2.5 pr-7 shadow-xl text-left animate-fade-in"
        >
          <button
            type="button"
            onClick={dismissReminder}
            aria-label="Đóng nhắc nhở Trợ lý AI"
            className="absolute top-1.5 right-1.5 p-1 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              dismissReminder();
              chatStore.getState().setActiveAITab('chat');
              chatStore.getState().setAIPanelOpen(true);
            }}
            className="block w-full text-left cursor-pointer group"
          >
            <p className="flex items-center gap-1 text-[11px] font-bold text-[#9A4E00] mb-0.5">
              <Sparkles className="w-3 h-3 text-[#FA8B02] shrink-0" aria-hidden="true" />
              Bạn chưa thử Trợ lý AI!
            </p>
            <p className="text-xs text-zinc-600 leading-snug group-hover:text-zinc-900 transition-colors">
              Nhấp vào đây để hỏi đáp và nhận lịch trình du lịch thông minh ngay.
            </p>
          </button>

          {/* Mũi tên nhỏ trỏ xuống nút logo */}
          <span
            aria-hidden="true"
            className="absolute -bottom-1.5 right-6 w-3 h-3 rotate-45 bg-white border-r border-b border-[#F6D6AC]"
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleOpenAssistant}
        aria-label="Mở Trợ lý Du lịch Ảo AI"
        title="Trợ lý Du lịch Ảo AI TripMate"
        className={cn(
          'group relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95',
          isOpen
            ? 'bg-[#FFF6E9] border-[#FA8B02] ring-4 ring-[#FA8B02]/20'
            : 'bg-white border-[#F6D6AC]'
        )}
      >
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-linear-to-tr from-[#FA8B02] to-amber-400 opacity-30 blur-sm group-hover:opacity-60 transition duration-500 animate-pulse" />
        )}

        <img
          src={logoImg}
          alt="Logo TripMate"
          className="relative w-9 h-9 object-contain transition-transform duration-200 group-hover:scale-105"
        />
      </button>
    </div>
  );
});
