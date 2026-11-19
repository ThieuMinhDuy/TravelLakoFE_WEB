import {
  formatCompactNumber,
  formatCurrencyVND,
  formatDate,
  formatDateTime,
  formatNumber,
  isAppLocale,
} from '@/utils/formatters';

/** Khoảng trắng không ngắt mà Intl chèn vào số tiền / giờ (U+00A0, U+202F) */
const INTL_SPACES = new RegExp(`[${String.fromCharCode(0xa0, 0x202f)}]`, 'g');

const normalize = (s: string) => s.replace(INTL_SPACES, ' ');

const date = new Date(2026, 10, 19, 14, 30); // 19/11/2026 14:30 (giờ địa phương)

describe('formatters theo locale', () => {
  it('tiền VNĐ: vi-VN dùng dấu chấm, en-US dùng dấu phẩy', () => {
    expect(normalize(formatCurrencyVND(1_500_000, 'vi-VN'))).toBe('1.500.000 ₫');
    expect(normalize(formatCurrencyVND(1_500_000, 'en-US'))).toBe('₫1,500,000');
  });

  it('tiền rỗng / không hợp lệ → 0 ₫', () => {
    expect(normalize(formatCurrencyVND(null))).toBe('0 ₫');
    expect(normalize(formatCurrencyVND(Number.NaN))).toBe('0 ₫');
  });

  it('số có phân cách hàng nghìn và số rút gọn', () => {
    expect(formatNumber(12345, 'vi-VN')).toBe('12.345');
    expect(formatNumber(12345, 'en-US')).toBe('12,345');
    expect(formatCompactNumber(1_500_000, 'en-US')).toBe('1.5M');
  });

  it('ngày tháng: dd/MM/yyyy (vi-VN) và MM/dd/yyyy (en-US)', () => {
    expect(formatDate(date, 'vi-VN')).toBe('19/11/2026');
    expect(formatDate(date, 'en-US')).toBe('11/19/2026');
    expect(formatDateTime(date, 'vi-VN')).toBe('19/11/2026 14:30');
    expect(formatDateTime(date, 'en-US')).toBe('11/19/2026 2:30 PM');
  });

  it('ngày rỗng hoặc sai định dạng → chuỗi rỗng', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate('khong-phai-ngay')).toBe('');
  });

  it('isAppLocale là type guard cho giá trị đọc từ bên ngoài', () => {
    expect(isAppLocale('vi-VN')).toBe(true);
    expect(isAppLocale('fr-FR')).toBe(false);
    expect(isAppLocale(null)).toBe(false);
  });
});
