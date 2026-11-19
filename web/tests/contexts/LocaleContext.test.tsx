import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocaleProvider } from '@/contexts/locale/LocaleProvider';
import { LOCALE_STORAGE_KEY, useLocale } from '@/contexts/locale/LocaleContext';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';

/** Khoảng trắng không ngắt mà Intl chèn vào số tiền / giờ (U+00A0, U+202F) */
const INTL_SPACES = new RegExp(`[${String.fromCharCode(0xa0, 0x202f)}]`, 'g');

const normalize = (s: string | null) => (s ?? '').replace(INTL_SPACES, ' ');

/** Một component hiển thị giá tiền — đổi định dạng là hiển thị đổi theo */
const PriceTag = () => {
  const { formatCurrency } = useLocale();
  return <p data-testid="price">{formatCurrency(1_500_000)}</p>;
};

const renderApp = () =>
  render(
    <LocaleProvider>
      <LocaleSwitcher />
      <PriceTag />
    </LocaleProvider>
  );

describe('LocaleContext', () => {
  it('mặc định là định dạng Việt Nam', () => {
    renderApp();
    expect(normalize(screen.getByTestId('price').textContent)).toBe('1.500.000 ₫');
    expect(screen.getByLabelText('Định dạng hiển thị')).toHaveValue('vi-VN');
  });

  it('đổi định dạng → giao diện cập nhật ngay và được lưu lại', async () => {
    renderApp();

    await userEvent.selectOptions(screen.getByLabelText('Định dạng hiển thị'), 'en-US');

    expect(normalize(screen.getByTestId('price').textContent)).toBe('₫1,500,000');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en-US');
  });

  it('mở lại trang → dùng lựa chọn đã lưu', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en-US');
    renderApp();
    expect(normalize(screen.getByTestId('price').textContent)).toBe('₫1,500,000');
  });

  it('giá trị lưu bị hỏng → quay về mặc định', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'xx-XX');
    renderApp();
    expect(screen.getByLabelText('Định dạng hiển thị')).toHaveValue('vi-VN');
  });

  it('useLocale() ngoài LocaleProvider báo lỗi rõ ràng', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useLocale())).toThrow('useLocale() phải được dùng bên trong <LocaleProvider>');
  });
});
