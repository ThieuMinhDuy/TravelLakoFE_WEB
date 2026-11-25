import { useState, memo } from 'react';
import { Route, Sparkles, CheckCircle2, ArrowUpDown } from 'lucide-react';
import { TripDetail, AIOptimizeResponse } from '../../../types';

export interface AIOptimizeTabProps {
  currentTrip?: TripDetail | null;
  onOptimize: (data: { notes?: string; preview?: boolean }) => void;
  isLoading: boolean;
  optimizedResult?: AIOptimizeResponse | null;
  onSaveOptimized?: () => void;
}

/**
 * Tab: Tối ưu hóa thứ tự di chuyển lịch trình hiện tại bằng Gemini AI.
 * AI phân tích tọa độ địa lý (coordinates) của các địa điểm để tìm lộ trình ngắn nhất.
 */
export const AIOptimizeTab = memo(function AIOptimizeTab({
  currentTrip,
  onOptimize,
  isLoading,
  optimizedResult,
  onSaveOptimized,
}: AIOptimizeTabProps) {
  const [notes, setNotes] = useState('Tối ưu hóa quãng đường di chuyển ngắn nhất và tiết kiệm thời gian nhất.');
  const [isPreview, setIsPreview] = useState(true);

  if (!currentTrip) {
    return (
      <div className="p-4 text-center text-xs text-zinc-500">
        Vui lòng mở một chuyến đi cụ thể để sử dụng tính năng tối ưu hóa lộ trình.
      </div>
    );
  }

  const handleStartOptimize = (e: React.FormEvent) => {
    e.preventDefault();
    onOptimize({
      notes: notes.trim(),
      preview: isPreview,
    });
  };

  return (
    <div className="space-y-4 text-xs sm:text-sm">
      <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900">
        <p className="font-semibold flex items-center gap-1.5 text-xs">
          <Route className="w-4 h-4 text-indigo-600" />
          Tối ưu hóa hành trình bằng AI
        </p>
        <p className="text-[11px] text-indigo-600/80 mt-1">
          Gemini sẽ phân tích tọa độ địa lý (kinh độ, vĩ độ) của từng địa điểm trong chuyến đi để sắp xếp lại thứ tự di chuyển liền mạch và ngắn nhất.
        </p>
      </div>

      <div className="p-3 rounded-xl border border-zinc-200 bg-white">
        <p className="text-xs text-zinc-500">Chuyến đi hiện tại:</p>
        <p className="text-sm font-bold text-zinc-900">{currentTrip.title}</p>
        <p className="text-[11px] text-zinc-500 mt-0.5">
          {currentTrip.schedule.length} ngày •{' '}
          {currentTrip.schedule.flatMap((d) => d.places).length} địa điểm cần sắp xếp
        </p>
      </div>

      <form onSubmit={handleStartOptimize} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1">
            Chỉ dẫn thêm cho AI (Tùy chọn)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ví dụ: Xếp quán cafe vào buổi sáng, khách sạn để cuối ngày..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Lựa chọn xem trước hay lưu ngay */}
        <label className="flex items-center gap-2 p-2.5 rounded-xl border border-zinc-200 bg-zinc-50 cursor-pointer">
          <input
            type="checkbox"
            checked={isPreview}
            onChange={(e) => setIsPreview(e.target.checked)}
            className="rounded-md border-zinc-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
          />
          <div>
            <span className="block text-xs font-semibold text-zinc-800">
              Chế độ xem trước (Preview)
            </span>
            <span className="block text-[11px] text-zinc-400">
              Xem thứ tự mới trước khi quyết định ghi đè vào lịch trình
            </span>
          </div>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              AI đang tính toán tọa độ lộ trình...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {isPreview ? 'Xem trước thứ tự tối ưu' : 'Tối ưu & Lưu vào lịch trình'}
            </>
          )}
        </button>
      </form>

      {/* Kết quả sau khi tối ưu */}
      {optimizedResult && (
        <div className="mt-4 p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              Lộ trình sau khi tối ưu ({optimizedResult.schedule.length} ngày)
            </h4>
            {optimizedResult.preview && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                Bản xem trước
              </span>
            )}
          </div>

          <div className="space-y-2 text-xs">
            {optimizedResult.schedule.map((day) => (
              <div key={day.day} className="p-2.5 rounded-xl bg-white border border-indigo-100">
                <p className="font-bold text-zinc-900 mb-1 flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600" /> Ngày {day.day}
                </p>
                <div className="space-y-1">
                  {day.places.map((p, idx) => {
                    const placeObj =
                      typeof p.placeId === 'object' && p.placeId !== null
                        ? (p.placeId as { name?: string })
                        : null;
                    return (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate">
                          {placeObj?.name || p.note || `Địa điểm ${idx + 1}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {optimizedResult.preview && onSaveOptimized && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onSaveOptimized}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Xác nhận lưu lộ trình tối ưu này
            </button>
          )}
        </div>
      )}
    </div>
  );
});
