import { useState, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Compass, Check, Calendar, ArrowRight } from 'lucide-react';
import {
  AIBudgetTier,
  AISuggestRequestDTO,
  AISuggestionResponse,
} from '../../../types';
import { formatCurrencyVND } from '../../../utils/formatters';
import { cityService } from '../../../services/cityService';
import { queryKeys } from '../../../lib/queryKeys';

export interface AISuggestTabProps {
  onGenerateSuggestion: (data: AISuggestRequestDTO) => void;
  isLoading: boolean;
  suggestedResult?: AISuggestionResponse | null;
  onApplySchedule?: (result: AISuggestionResponse) => void;
  isApplying?: boolean;
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

const BUDGET_TIERS: AIBudgetTier[] = ['Tiết kiệm', 'Trung bình', 'Sang trọng'];

/**
 * Tab: Gợi ý toàn bộ lịch trình chuyến đi thông minh bằng Gemini Flash Lite.
 */
export const AISuggestTab = memo(function AISuggestTab({
  onGenerateSuggestion,
  isLoading,
  suggestedResult,
  onApplySchedule,
  isApplying = false,
}: AISuggestTabProps) {
  const [cityId, setCityId] = useState('');
  const [days, setDays] = useState<number>(3);
  const [budget, setBudget] = useState<AIBudgetTier>('Trung bình');
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([
    'Ẩm thực địa phương',
    'Văn hóa & Lịch sử',
  ]);
  const [notes, setNotes] = useState('');

  const citiesQuery = useQuery({
    queryKey: queryKeys.cities.list(),
    queryFn: ({ signal }) => cityService.getCities({ signal }),
    staleTime: 5 * 60 * 1000,
  });
  const cities = citiesQuery.data?.cities ?? [];

  const togglePreference = (pref: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityId.trim()) return;

    const totalDays = Math.max(1, Number(days) || 1);
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + totalDays - 1);

    onGenerateSuggestion({
      cityId: cityId.trim(),
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      budget,
      preferences: selectedPreferences.join(', ') || undefined,
      notes: notes.trim() || undefined,
      isParse: false,
    });
  };

  return (
    <div className="space-y-4 text-xs sm:text-sm">
      <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-800">
        <p className="font-semibold flex items-center gap-1.5 text-xs">
          <Sparkles className="w-4 h-4 text-blue-600" />
          Sinh lịch trình du lịch tự động
        </p>
        <p className="text-[11px] text-blue-600/80 mt-1">
          Chọn điểm đến và sở thích, Trợ lý Gemini sẽ phân bổ các điểm tham quan, ẩm thực và nơi lưu trú hợp lý nhất.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Điểm đến */}
        <div>
          <label
            htmlFor="ai-suggest-city"
            className="block text-xs font-semibold text-zinc-700 mb-1"
          >
            Thành phố điểm đến *
          </label>
          {cities.length > 0 ? (
            <select
              id="ai-suggest-city"
              required
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn thành phố --</option>
              {cities.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="ai-suggest-city"
              type="text"
              required
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              placeholder={
                citiesQuery.isLoading
                  ? 'Đang tải danh sách thành phố...'
                  : 'Nhập ID thành phố điểm đến'
              }
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>

        {/* Số ngày & Mức ngân sách */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label
              htmlFor="ai-suggest-days"
              className="block text-xs font-semibold text-zinc-700 mb-1"
            >
              Số ngày đi
            </label>
            <select
              id="ai-suggest-days"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <option key={d} value={d}>
                  {d} ngày
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="ai-suggest-budget"
              className="block text-xs font-semibold text-zinc-700 mb-1"
            >
              Mức ngân sách
            </label>
            <select
              id="ai-suggest-budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value as AIBudgetTier)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              {BUDGET_TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sở thích du lịch */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
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
                      : 'bg-zinc-100 text-zinc-600 border-transparent hover:bg-zinc-200'
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
          <label
            htmlFor="ai-suggest-notes"
            className="block text-xs font-semibold text-zinc-700 mb-1"
          >
            Ghi chú / Yêu cầu đặc biệt
          </label>
          <textarea
            id="ai-suggest-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ví dụ: Đi theo nhóm bạn trẻ, thích các quán cafe view biển hoàng hôn..."
            className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-white text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
        <div className="mt-4 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
              {suggestedResult.suggestedTitle}
            </h4>
            <span className="text-xs font-semibold text-emerald-700 shrink-0">
              {formatCurrencyVND(suggestedResult.estimatedTotalCost)}
            </span>
          </div>

          <div className="space-y-2 text-xs text-zinc-700">
            {suggestedResult.schedule.map((day) => (
              <div
                key={day._id || day.day}
                className="p-2.5 rounded-xl bg-white border border-emerald-100"
              >
                <p className="font-bold text-zinc-900 flex items-center gap-1 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Ngày {day.day} ({day.places.length} điểm)
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-zinc-600">
                  {day.places.map((p, idx) => {
                    const placeObj =
                      typeof p.placeId === 'object' && p.placeId !== null
                        ? (p.placeId as { name?: string })
                        : null;
                    return (
                      <li key={idx} className="truncate">
                        [{p.placeType}] {placeObj?.name || p.note || 'Điểm tham quan'}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {onApplySchedule && (
            <button
              type="button"
              disabled={isApplying}
              onClick={() => onApplySchedule(suggestedResult)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {isApplying ? 'Đang tạo chuyến đi...' : 'Áp dụng lịch trình này'}
              {!isApplying && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
});
