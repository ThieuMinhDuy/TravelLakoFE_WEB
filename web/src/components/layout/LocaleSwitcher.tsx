import React, { useId, useMemo } from 'react';
import { Globe } from 'lucide-react';
import { useLocale } from '../../contexts/locale/LocaleContext';
import {
  APP_LOCALES,
  formatCurrencyVND,
  formatDate,
  isAppLocale,
  type AppLocale,
} from '../../utils/formatters';
import './css/LocaleSwitcher.css';

const LOCALE_NAMES: Record<AppLocale, string> = {
  'vi-VN': 'Việt Nam',
  'en-US': 'Quốc tế',
};

/** Chọn định dạng hiển thị số tiền & ngày tháng; mỗi lựa chọn kèm ví dụ thật */
export const LocaleSwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { locale, setLocale } = useLocale();
  const selectId = useId();

  // Ví dụ minh họa chỉ cần tính một lần
  const options = useMemo(() => {
    const today = new Date();
    return APP_LOCALES.map((value) => ({
      value,
      label: `${LOCALE_NAMES[value]} — ${formatCurrencyVND(1_500_000, value)} · ${formatDate(today, value)}`,
    }));
  }, []);

  return (
    <div className={['locale-switcher', className].filter(Boolean).join(' ')}>
      <Globe className="locale-switcher__icon" aria-hidden="true" />
      <label htmlFor={selectId} className="locale-switcher__label">
        Định dạng hiển thị
      </label>
      <select
        id={selectId}
        className="locale-switcher__select"
        value={locale}
        onChange={(e) => {
          if (isAppLocale(e.target.value)) setLocale(e.target.value);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
