/**
 * Kênh báo sự kiện phiên đăng nhập từ tầng không phải React (interceptor của apiClient)
 * lên giao diện (toast). Giữ apiClient không phụ thuộc thư viện toast.
 */
export type SessionEvent =
  /** Tài khoản bị khóa khi đang dùng → đã đăng xuất */
  | { type: 'blocked'; message: string }
  /** Bị gỡ quyền admin khi đang ở trang quản trị → ProtectedRoute chuyển sang 403 */
  | { type: 'admin-revoked'; message: string };

type Listener = (event: SessionEvent) => void;

const listeners = new Set<Listener>();

export const sessionEvents = {
  emit: (event: SessionEvent) => listeners.forEach((listener) => listener(event)),
  /** Trả về hàm hủy đăng ký — dùng trực tiếp làm cleanup của useEffect */
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
