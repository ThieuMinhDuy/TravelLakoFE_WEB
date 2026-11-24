import React, { useCallback, useMemo, useState } from 'react';
import {
  DEFAULT_LOCALE,
  formatCompactNumber,
  formatCurrencyVND,
  formatDate,
  formatDateTime,
  formatNumber,
  isAppLocale,
  type AppLocale,
} from '../../utils/formatters';
import { LOCALE_STORAGE_KEY, LocaleContext, type LocaleContextValue } from './LocaleContext';

/** Đọc lựa chọn đã lưu; giá trị lạ hoặc storage bị chặn → dùng mặc định */
function readStoredLocale(): AppLocale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isAppLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

/**
 * Lưu định dạng hiển thị người dùng chọn (nhớ qua các lần mở trang).
 * Không đổi <html lang>: nội dung trang vẫn là tiếng Việt, chỉ đổi định dạng số / ngày.
 */
export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<AppLocale>(readStoredLocale);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      // Không lưu được (private mode) → vẫn áp dụng trong phiên hiện tại
    }
  }, []);

  // useMemo: chỉ tạo lại object khi đổi locale → các component dùng useLocale()
  // không bị re-render mỗi khi LocaleProvider render lại vì lý do khác
  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      formatCurrency: (amount) => formatCurrencyVND(amount, locale),
      formatNumber: (n) => formatNumber(n, locale),
      formatCompactNumber: (n) => formatCompactNumber(n, locale),
      formatDate: (input, pattern) => formatDate(input, locale, pattern),
      formatDateTime: (input) => formatDateTime(input, locale),
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};
