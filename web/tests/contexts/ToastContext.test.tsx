import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { ToastProvider } from '@/contexts/toast/ToastProvider';
import { useToast } from '@/contexts/toast/ToastContext';

vi.mock('sonner', () => ({
  Toaster: () => null,
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn(), promise: vi.fn(), dismiss: vi.fn() },
}));

describe('ToastContext', () => {
  it('useToast() ngoài ToastProvider báo lỗi rõ ràng', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => renderHook(() => useToast())).toThrow('useToast() phải được dùng bên trong <ToastProvider>');
  });

  it('component gọi toast qua Context, không phụ thuộc thư viện', async () => {
    const SaveButton = () => {
      const toastApi = useToast();
      return (
        <button onClick={() => toastApi.success('Đã lưu!', { id: 'save' })}>Lưu</button>
      );
    };

    render(
      <ToastProvider>
        <SaveButton />
      </ToastProvider>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Lưu' }));

    expect(toast.success).toHaveBeenCalledWith('Đã lưu!', { id: 'save' });
  });

  it('API ổn định giữa các lần render (an toàn khi dùng làm dependency)', () => {
    const { result, rerender } = renderHook(() => useToast(), { wrapper: ToastProvider });
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
