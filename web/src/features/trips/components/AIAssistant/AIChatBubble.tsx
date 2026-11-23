import { memo } from 'react';
import { Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage } from '../../types/ai';
import { formatDate } from '../../../../utils/formatters';
import { cn } from '../../../../utils/cn';

export interface AIChatBubbleProps {
  message: ChatMessage;
}

/**
 * Component hiển thị một bong bóng tin nhắn trong khung chat AI.
 * Phân biệt tin nhắn người dùng và phản hồi từ Trợ lý Gemini AI.
 */
export const AIChatBubble = memo(function AIChatBubble({ message }: AIChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-2.5 mb-3.5 items-start',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex items-center justify-center w-7 h-7 rounded-xl shrink-0 shadow-xs',
          isUser
            ? 'bg-zinc-800 text-white dark:bg-zinc-700'
            : 'bg-linear-to-tr from-blue-600 to-indigo-600 text-white'
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Khối nội dung tin nhắn */}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs',
          isUser
            ? 'bg-blue-600 text-white rounded-tr-none'
            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200/60 dark:border-zinc-700/60'
        )}
      >
        {!isUser && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Trợ lý TravelLako</span>
          </div>
        )}

        {/* Nội dung tin nhắn hỗ trợ xuống dòng */}
        <div className="whitespace-pre-wrap break-words">{message.content}</div>

        {/* Thời gian gửi nếu có */}
        {message.timestamp && (
          <div
            className={cn(
              'text-[10px] mt-1 text-right',
              isUser ? 'text-blue-200' : 'text-zinc-400 dark:text-zinc-500'
            )}
          >
            {formatDate(message.timestamp, 'HH:mm')}
          </div>
        )}
      </div>
    </div>
  );
});

/**
 * Hiệu ứng ba chấm nhấp nháy khi AI đang soạn câu trả lời (typing indicator)
 */
export const AITypingIndicator = memo(function AITypingIndicator() {
  return (
    <div className="flex gap-2.5 mb-3.5 items-start">
      <div className="flex items-center justify-center w-7 h-7 rounded-xl shrink-0 bg-linear-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
        <Bot className="w-4 h-4" />
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs border border-zinc-200/60 dark:border-zinc-700/60">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
          <span className="text-xs text-zinc-400 ml-1.5">AI đang suy nghĩ...</span>
        </div>
      </div>
    </div>
  );
});

