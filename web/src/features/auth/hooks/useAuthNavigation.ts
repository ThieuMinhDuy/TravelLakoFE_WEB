import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

type Params = Record<string, string | undefined>;

/**
 * Điều hướng giữa các màn auth trong popup.
 * - Giữ nguyên `location.state` (backgroundLocation) để trang phía sau không đổi.
 * - Giữ tham số `redirect` xuyên suốt luồng Login → Register → OTP.
 * - Dùng `replace` để nút Back của trình duyệt đóng popup thay vì lùi từng màn.
 */
export function useAuthNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') ?? undefined;

  const buildHref = useCallback(
    (path: string, params: Params = {}) => {
      const next = new URLSearchParams();
      if (redirect) next.set('redirect', redirect);
      Object.entries(params).forEach(([key, value]) => {
        if (value) next.set(key, value);
      });
      const query = next.toString();
      return query ? `${path}?${query}` : path;
    },
    [redirect]
  );

  const goTo = useCallback(
    (path: string, params?: Params) =>
      navigate(buildHref(path, params), { replace: true, state: location.state }),
    [navigate, buildHref, location.state]
  );

  return { goTo, buildHref, state: location.state as unknown };
}
