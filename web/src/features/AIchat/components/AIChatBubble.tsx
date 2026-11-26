import { memo } from 'react';
import { Bot, User, Sparkles, CalendarPlus, Check, Loader2 } from 'lucide-react';
import { ChatMessage } from '../../../types';
import { formatDate } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';
import {
  isScheduleMessage,
  parseFormattedChatBlocks,
  type InlineSegment,
} from '../utils/chatFormatting';

export interface AIChatBubbleProps {
  message: ChatMessage;
  onSaveSchedule?: (content: string) => void;
  isSavingSchedule?: boolean;
  isScheduleSaved?: boolean;
}

function renderSegments(segments: InlineSegment[]) {
  return segments.map((seg, idx) =>
    seg.bold ? (
      <strong key={idx} className="font-semibold text-zinc-900">
        {seg.text}
      </strong>
    ) : (
      <span key={idx}>{seg.text}</span>
    )
  );
}

/**
 * Component hiển thị một bong bóng tin nhắn trong khung chat AI.
 * Tin nhắn AI được format sạch ký tự đặc biệt (###, **, *) và tự động hiện nút
 * "Lưu lịch trình" khi AI trả về một lịch trình cụ thể theo ngày.
 */
export const AIChatBubble = memo(function AIChatBubble({
  message,
  onSaveSchedule,
  isSavingSchedule = false,
  isScheduleSaved = false,
}: AIChatBubbleProps) {
  const isUser = message.role === 'user';
  const blocks = !isUser ? parseFormattedChatBlocks(message.content) : null;
  const showSaveAction =
    !isUser && Boolean(onSaveSchedule) && isScheduleMessage(message.content);

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
            ? 'bg-zinc-800 text-white'
            : 'bg-linear-to-tr from-[#FA8B02] to-amber-500 text-white'
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
            : 'bg-zinc-100 text-zinc-900 rounded-tl-none border border-zinc-200/60'
        )}
      >
        {!isUser && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Trợ lý TripMate</span>
          </div>
        )}

        {isUser ? (
          <div className="whitespace-pre-wrap break-words">{message.content}</div>
        ) : (
          <div className="space-y-1.5 break-words">
            {blocks?.map((block, idx) => {
              if (block.type === 'spacer') {
                return <div key={idx} className="h-1" aria-hidden="true" />;
              }
              if (block.type === 'heading') {
                return (
                  <p key={idx} className="font-bold text-zinc-900 pt-1 first:pt-0">
                    {renderSegments(block.segments)}
                  </p>
                );
              }
              if (block.type === 'bullet') {
                return (
                  <div key={idx} className="flex items-start gap-2 pl-0.5">
                    <span className="text-amber-600 font-bold leading-relaxed select-none" aria-hidden="true">
                      •
                    </span>
                    <span className="flex-1">{renderSegments(block.segments)}</span>
                  </div>
                );
              }
              return <p key={idx}>{renderSegments(block.segments)}</p>;
            })}
          </div>
        )}

        {showSaveAction && (
          <div className="mt-2.5 pt-2 border-t border-zinc-200/80 flex items-center justify-end">
            <button
              type="button"
              disabled={isSavingSchedule || isScheduleSaved}
              onClick={() => onSaveSchedule?.(message.content)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed',
                isScheduleSaved
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-[#FA8B02] hover:bg-[#D87200] text-white shadow-xs disabled:opacity-60'
              )}
            >
              {isSavingSchedule ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Đang lưu lịch trình...
                </>
              ) : isScheduleSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Đã lưu lịch trình
                </>
              ) : (
                <>
                  <CalendarPlus className="w-3.5 h-3.5" />
                  Lưu lịch trình
                </>
              )}
            </button>
          </div>
        )}

        {/* Thời gian gửi nếu có */}
        {message.timestamp && (
          <div
            className={cn(
              'text-[10px] mt-1 text-right',
              isUser ? 'text-blue-200' : 'text-zinc-400'
            )}
          >
            {formatDate(message.timestamp, undefined, 'HH:mm')}
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
      <div className="flex items-center justify-center w-7 h-7 rounded-xl shrink-0 bg-linear-to-tr from-[#FA8B02] to-amber-500 text-white shadow-xs">
        <Bot className="w-4 h-4" />
      </div>

      <div className="bg-zinc-100 text-zinc-500 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs border border-zinc-200/60">
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
