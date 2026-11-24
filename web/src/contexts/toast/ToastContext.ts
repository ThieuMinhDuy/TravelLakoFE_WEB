import { createContext, useContext } from 'react';

export interface ToastOptions {
  /** Dòng mô tả phụ bên dưới tiêu đề */
  description?: string;
  /** Toast cùng `id` sẽ được cập nhật thay vì hiện thêm (chống trùng lặp) */
  id?: string | number;
  /** Thời gian hiển thị (ms) */
  duration?: number;
}

export interface ToastMessages<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: unknown) => string);
}

/**
 * API thông báo dùng chung toàn app. Component chỉ phụ thuộc vào interface này,
 * không gọi thẳng thư viện → đổi thư viện toast hoặc mock khi test chỉ sửa ở ToastProvider.
 */
export interface ToastApi {
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  /** Hiển thị trạng thái đang xử lý → thành công / thất bại của một Promise */
  promise: <T>(promise: Promise<T>, messages: ToastMessages<T>) => void;
  dismiss: (id?: string | number) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast() phải được dùng bên trong <ToastProvider>');
  }
  return context;
}
