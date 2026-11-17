import { format, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Format số tiền sang định dạng VNĐ (ví dụ: 1.500.000 ₫)
 */
export function formatCurrencyVND(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 ₫';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format số tiền rút gọn (ví dụ: 1.5M, 500k)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`.replace('.0', '');
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}k`.replace('.0', '');
  }
  return num.toString();
}

/**
 * Format ngày tháng từ chuỗi ISO Date (dd/MM/yyyy)
 */
export function formatDate(
  dateInput?: string | Date | null,
  pattern: string = 'dd/MM/yyyy'
): string {
  if (!dateInput) return '';
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    if (!isValid(d)) return '';
    return format(d, pattern, { locale: vi });
  } catch {
    return '';
  }
}

/**
 * Format ngày giờ chi tiết (dd/MM/yyyy HH:mm)
 */
export function formatDateTime(dateInput?: string | Date | null): string {
  return formatDate(dateInput, 'dd/MM/yyyy HH:mm');
}
