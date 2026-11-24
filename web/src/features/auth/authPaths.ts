import type { Location } from 'react-router-dom';

/** Các route auth được hiển thị dưới dạng popup phủ lên trang hiện tại */
export const AUTH_PATHS = [
  '/login',
  '/register',
  '/verify-otp',
  '/forgot-password',
  '/reset-password',
] as const;

export const isAuthPath = (pathname: string) =>
  (AUTH_PATHS as readonly string[]).includes(pathname);

/**
 * Thứ tự "chiều sâu" của từng màn để quyết định hướng trượt:
 * đi sâu hơn → nội dung trượt từ phải sang, quay lại → trượt từ trái sang.
 */
export const AUTH_DEPTH: Record<string, number> = {
  '/login': 0,
  '/register': 1,
  '/forgot-password': 1,
  '/verify-otp': 2,
  '/reset-password': 2,
};

/** `location.state` khi mở popup: trang đang xem sẽ được giữ làm nền phía sau */
export interface AuthModalState {
  backgroundLocation?: Location;
}
