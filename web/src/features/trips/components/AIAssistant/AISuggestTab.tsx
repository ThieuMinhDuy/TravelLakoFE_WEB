import { useState, memo } from 'react';
import { Sparkles, Compass, Check, Calendar, ArrowRight } from 'lucide-react';
import { AISuggestionResponse } from '../../../../types';
import { formatCurrencyVND } from '../../../../utils/formatters';

export interface AISuggestTabProps {
  onGenerateSuggestion: (data: {
    cityId: string;
    days: number;
    budget?: number;
    preferences?: string[];
    notes?: string;
  }) => void;
  isLoading: boolean;
  suggestedResult?: AISuggestionResponse | null;
  onApplySchedule?: (result: AISuggestionResponse) => void;
}

const PREFERENCE_OPTIONS = [
  'Nghỉ dưỡng biển',
  'Văn hóa & Lịch sử',
  'Ẩm thực địa phương',
  'Thiên nhiên hùng vĩ',
  'Check-in sống ảo',
  'Tiết kiệm chi phí',
  'Trải nghiệm về đêm',
  'Hoạt động mạo hiểm',
];

/**
 * Tab: Gợi ý toàn bộ lịch trình chuyến đi thông minh bằng Gemini Flash Lite.
 */
export const AISuggestTab = memo(function AISuggestTab({
  onGenerateSuggestion,
  isLoading,
  suggestedResult,
  onApplySchedule,
}: AISuggestTabProps) {
  const [cityId, setCityId] = useState('');
  const [days, setDays] = useState<number>(3);
  const [budget, setBudget] = useState<string>('3000000');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([
    'Ẩm thực địa phương',
    'Văn hóa & Lịch sử',
  ]);
  const [notes, setNotes] = useState('');

  const togglePreference = (pref: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityId.trim()) return;

    onGenerateSuggestion({
      cityId: cityId.trim(),
      days: Number(days),
      budget: budget ? Number(budget) : undefined,
      preferences: selectedPreferences,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="space-y-4 text-xs sm:text-sm">
      <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-blue-800 dark:text-blue-300">
        <p className="font-semibold flex items-center gap-1.5 text-xs">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          Sinh lịch trình du lịch tự động
        </p>
        <p className="text-[11px] text-blue-600/80 dark:text-blue-300/80 mt-1">
          Nhập điểm đến và sở thích, Trợ lý Gemini sẽ phân bổ các điểm tham quan, ẩm thực và nơi lưu trú hợp lý nhất.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Điểm đến */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Mã hoặc ID Thành phố điểm đến *
          </label>
          <input
            type="text"
            required
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            placeholder="Nhập ID thành phố (ví dụ: Đà Nẵng, Phú Quốc...)"
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Số ngày & Ngân sách */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Số ngày đi
            </label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <option key={d} value={d}>
                  {d} ngày
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Ngân sách dự kiến (VNĐ)
            </label>
            <input
              type="number"
              step="500000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="3.000.000"
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Sở thích du lịch */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Sở thích du lịch mong muốn:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PREFERENCE_OPTIONS.map((pref) => {
              const active = selectedPreferences.includes(pref);
              return (
                <button
                  key={pref}
                  type="button"
                  onClick={() => togglePreference(pref)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {pref}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ghi chú thêm */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Ghi chú / Yêu cầu đặc biệt
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ví dụ: Đi theo nhóm bạn trẻ, thích các quán cafe view biển hoàng hôn..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Nút submit */}
        <button
          type="submit"
          disabled={isLoading || !cityId.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              AI đang thiết kế lịch trình...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Tạo gợi ý lịch trình thông minh
            </>
          )}
        </button>
      </form>

      {/* Hiển thị kết quả gợi ý nếu có */}
      {suggestedResult && (
        <div className="mt-4 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600" />
              {suggestedResult.suggestedTitle}
            </h4>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              {formatCurrencyVND(suggestedResult.estimatedTotalCost)}
            </span>
          </div>

          <div className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
            {suggestedResult.schedule.map((day) => (
              <div key={day.day} className="p-2.5 rounded-xl bg-white dark:bg-zinc-800/80 border border-emerald-100 dark:border-emerald-900/40">
                <p className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Ngày {day.day} ({day.places.length} điểm)
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                  {day.places.map((p, idx) => (
                    <li key={idx} className="truncate">
                      [{p.placeType}] {p.note || 'Điểm tham quan'}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {onApplySchedule && (
            <button
              type="button"
              onClick={() => onApplySchedule(suggestedResult)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Áp dụng lịch trình này
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
});

