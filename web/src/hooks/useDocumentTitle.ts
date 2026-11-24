import { useEffect } from 'react';

export const APP_NAME = 'TripMate';
export const DEFAULT_TITLE = `${APP_NAME} - Nền tảng lập kế hoạch du lịch thông minh`;

/**
 * Đặt tiêu đề tab trình duyệt cho trang hiện tại: "<title> · TripMate".
 * Khi component unmount, khôi phục tiêu đề trước đó (vd: đóng popup đăng nhập
 * → tiêu đề quay về của trang phía sau).
 *
 * @param title Tiêu đề trang; bỏ trống → tiêu đề mặc định của app
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · ${APP_NAME}` : DEFAULT_TITLE;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
