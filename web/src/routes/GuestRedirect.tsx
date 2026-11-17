import React from 'react';
import { Navigate, type Location } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import type { AuthModalState } from '../features/auth/authPaths';

/** Chỉ chấp nhận đường dẫn nội bộ (chặn open redirect kiểu `//evil.com`) */
const isSafeRedirect = (path: string | null): path is string =>
  !!path && path.startsWith('/') && !path.startsWith('//');

/**
 * Đã đăng nhập mà đang ở màn auth (vừa đăng nhập xong, hoặc mở thẳng /login)
 * → điều hướng theo thứ tự ưu tiên:
 * `?redirect=` → Admin về /admin → trang nền phía sau popup → trang chủ.
 */
export const GuestRedirect: React.FC<{ location: Location }> = ({ location }) => {
  const user = useAuthStore((s) => s.user);
  const redirect = new URLSearchParams(location.search).get('redirect');
  const background = (location.state as AuthModalState | null)?.backgroundLocation;

  let target = '/';
  if (isSafeRedirect(redirect)) target = redirect;
  else if (user?.isAdmin) target = '/admin';
  else if (background) target = `${background.pathname}${background.search}${background.hash}`;

  return <Navigate to={target} replace />;
};
