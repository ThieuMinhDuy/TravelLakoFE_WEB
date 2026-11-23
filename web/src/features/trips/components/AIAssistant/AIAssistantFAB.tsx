import { memo } from 'react';
import { Sparkles, Bot } from 'lucide-react';
import { useTripUIStoreApi, useTripUIContext } from '../../store/tripUIStore';
import { cn } from '../../../../utils/cn';

/**
 * Nút Floating Action Button (FAB) đặt ở góc dưới phải màn hình.
 * Nhấp vào để bật/tắt slide-in Trợ lý ảo AI.
 */
export const AIAssistantFAB = memo(function AIAssistantFAB() {
  const uiStore = useTripUIStoreApi();
  const isOpen = useTripUIContext((s) => s.isAIPanelOpen);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        type="button"
        onClick={() => uiStore.getState().toggleAIPanel()}
        aria-label="Mở Trợ lý Du lịch Ảo AI"
        className={cn(
          'group relative flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95',
          isOpen
            ? 'bg-zinc-800 text-white'
            : 'bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white'
        )}
      >
        {/* Vòng pulse ánh sáng phát ra xung quanh nút khi đóng */}
        {!isOpen && (
          <span className="absolute -inset-1 rounded-full bg-linear-to-r from-blue-600 to-purple-600 opacity-40 blur-sm group-hover:opacity-75 transition duration-500 animate-pulse" />
        )}

        <div className="relative flex items-center justify-center">
          <Bot className="w-5 h-5 transition-transform group-hover:rotate-12" />
          <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1.5 -right-2 animate-bounce" />
        </div>

        <span className="relative text-xs font-bold tracking-wide hidden sm:inline-block">
          Trợ lý AI
        </span>

        {/* Badge "AI" nổi bật */}
        <span className="relative px-1.5 py-0.5 rounded-full text-[9px] font-black bg-white/20 uppercase tracking-wider">
          Gemini
        </span>
      </button>
    </div>
  );
});

