import { createContext, useContext } from 'react';
import type { AppLocale } from '../../utils/formatters';

export const LOCALE_STORAGE_KEY = 'tripmate_locale';

/**
 * State ít thay đổi trên toàn app: định dạng hiển thị số, tiền và ngày tháng.
 * Các hàm format đã gắn sẵn locale đang chọn → component chỉ cần gọi
 * `formatCurrency(price)` mà không phải truyền locale.
 */
export interface LocaleContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  formatCurrency: (amount?: number | null) => string;
  formatNumber: (value: number) => string;
  formatCompactNumber: (value: number) => string;
  formatDate: (input?: string | Date | null, pattern?: string) => string;
  formatDateTime: (input?: string | Date | null) => string;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale() phải được dùng bên trong <LocaleProvider>');
  }
  return context;
}
