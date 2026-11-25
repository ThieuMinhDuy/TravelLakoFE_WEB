import { memo } from 'react';
import {
  Wallet,
  AlertTriangle,
  CheckCircle,
  Building2,
  Ticket,
  Utensils,
  Coffee,
  TrendingUp,
} from 'lucide-react';
import { useAppSelector } from '../../../store/reduxStore';
import { selectBudgetSummary } from '../../../store/tripSelectors';
import { formatCurrencyVND } from '../../../utils/formatters';
import { cn } from '../../../utils/cn';

/**
 * Sub-component: Khối hiển thị ngân sách chuyến đi.
 * Tận dụng Memoized Selector (selectBudgetSummary) để tối ưu hiệu năng tính toán.
 * Tự động cảnh báo khi chi phí ước tính vượt quá ngân sách đã thiết lập.
 */
export const TripScheduleBudget = memo(function TripScheduleBudget() {
  const summary = useAppSelector(selectBudgetSummary);

  const {
    total,
    estimated,
    spent,
    remaining,
    percentUsed,
    isOverBudget,
    breakdown,
  } = summary;

  // Quyết định màu sắc progress bar theo tỷ lệ ngân sách
  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (percentUsed > 80) return 'bg-amber-500';
    return 'bg-blue-600';
  };

  return (
    <div
      data-testid="budget-summary-card"
      className="p-5 mb-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs"
    >
      {/* Tiêu đề & Cảnh báo */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Quản lý Ngân sách Chuyến đi
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tự động tính toán chi phí theo địa điểm thực tế
            </p>
          </div>
        </div>

        {isOverBudget ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900/50 animate-pulse">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Vượt ngân sách {formatCurrencyVND(Math.abs(remaining))}!
          </div>
        ) : (
          <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <CheckCircle className="w-3.5 h-3.5" />
            Trong tầm kiểm soát
          </div>
        )}
      </div>

      {/* Progress Bar thể hiện % ngân sách */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
          <span className="text-zinc-600 dark:text-zinc-400">
            Đã dự tính {Math.round(percentUsed)}%
          </span>
          <span
            className={cn(
              'font-semibold',
              isOverBudget ? 'text-red-600' : 'text-zinc-900 dark:text-zinc-100'
            )}
          >
            {formatCurrencyVND(estimated)} / {formatCurrencyVND(total)}
          </span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div
            role="progressbar"
            aria-valuenow={Math.round(percentUsed)}
            aria-valuemin={0}
            aria-valuemax={100}
            className={cn('h-full transition-all duration-500 rounded-full', getProgressColor())}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* 3 Thẻ tóm tắt thông số */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Tổng ngân sách</p>
          <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {formatCurrencyVND(total)}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">Đã chi (ghé thăm)</p>
          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrencyVND(spent)}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5">
            {remaining >= 0 ? 'Ngân sách còn lại' : 'Thiếu hụt'}
          </p>
          <p
            className={cn(
              'text-base font-bold',
              remaining >= 0
                ? 'text-zinc-900 dark:text-zinc-100'
                : 'text-red-600 dark:text-red-400'
            )}
          >
            {formatCurrencyVND(Math.abs(remaining))}
          </p>
        </div>
      </div>

      {/* Phân bổ theo loại hình */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5" />
          Phân bổ chi phí dự tính:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <div className="truncate">
              <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">Khách sạn</span>
              <span className="font-semibold">{formatCurrencyVND(breakdown.hotel)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300">
            <Ticket className="w-3.5 h-3.5 shrink-0" />
            <div className="truncate">
              <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">Vé tham quan</span>
              <span className="font-semibold">{formatCurrencyVND(breakdown.attraction)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300">
            <Utensils className="w-3.5 h-3.5 shrink-0" />
            <div className="truncate">
              <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">Nhà hàng</span>
              <span className="font-semibold">{formatCurrencyVND(breakdown.restaurant)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300">
            <Coffee className="w-3.5 h-3.5 shrink-0" />
            <div className="truncate">
              <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">Cafe</span>
              <span className="font-semibold">{formatCurrencyVND(breakdown.cafe)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

