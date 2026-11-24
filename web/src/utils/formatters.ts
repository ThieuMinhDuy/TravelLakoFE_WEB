import { format, parseISO, isValid } from 'date-fns';
import { enUS, vi } from 'date-fns/locale';

/**
 * Định dạng hiển thị số / tiền / ngày tháng mà ứng dụng hỗ trợ.
 * Chỉ đổi cách *định dạng*, nội dung giao diện vẫn là tiếng Việt.
 */
export const APP_LOCALES = ['vi-VN', 'en-US'] as const;
export type AppLocale = (typeof APP_LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = 'vi-VN';

/** Type guard: kiểm tra chuỗi bất kỳ (vd: đọc từ localStorage) có phải locale hợp lệ */
export const isAppLocale = (value: unknown): value is AppLocale =>
  typeof value === 'string' && (APP_LOCALES as readonly string[]).includes(value);

const DATE_FNS_LOCALES: Record<AppLocale, typeof vi> = { 'vi-VN': vi, 'en-US': enUS };

const DATE_PATTERNS: Record<AppLocale, { date: string; dateTime: string }> = {
  'vi-VN': { date: 'dd/MM/yyyy', dateTime: 'dd/MM/yyyy HH:mm' },
  'en-US': { date: 'MM/dd/yyyy', dateTime: 'MM/dd/yyyy h:mm a' },
};

/**
 * Định dạng số tiền VNĐ theo locale.
 * vi-VN: "1.500.000 ₫" · en-US: "₫1,500,000"
 */
export function formatCurrencyVND(amount?: number | null, locale: AppLocale = DEFAULT_LOCALE): string {
  const value = amount === undefined || amount === null || Number.isNaN(amount) ? 0 : amount;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Định dạng số có phân cách hàng nghìn. vi-VN: "12.345" · en-US: "12,345" */
export function formatNumber(value: number, locale: AppLocale = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** Số rút gọn. vi-VN: "1,5 Tr" · en-US: "1.5M" */
export function formatCompactNumber(value: number, locale: AppLocale = DEFAULT_LOCALE): string {
  return new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function toDate(input?: string | Date | null): Date | null {
  if (!input) return null;
  const d = typeof input === 'string' ? parseISO(input) : input;
  return isValid(d) ? d : null;
}

/**
 * Định dạng ngày. vi-VN: "19/11/2026" · en-US: "11/19/2026"
 * @param pattern Mẫu date-fns tùy chỉnh (bỏ trống → mẫu mặc định của locale)
 */
export function formatDate(
  input?: string | Date | null,
  locale: AppLocale = DEFAULT_LOCALE,
  pattern?: string
): string {
  const d = toDate(input);
  if (!d) return '';
  return format(d, pattern ?? DATE_PATTERNS[locale].date, { locale: DATE_FNS_LOCALES[locale] });
}

/** Định dạng ngày giờ. vi-VN: "19/11/2026 14:30" · en-US: "11/19/2026 2:30 PM" */
export function formatDateTime(input?: string | Date | null, locale: AppLocale = DEFAULT_LOCALE): string {
  return formatDate(input, locale, DATE_PATTERNS[locale].dateTime);
}
