import { useEffect } from 'react';
import { useNavigationType } from 'react-router-dom';

interface ScrollToTopProps {
  /**
   * Pathname của trang đang hiển thị. Khi popup đăng nhập mở, đây là pathname của
   * trang nền → mở/đóng popup không làm trang cuộn lên đầu.
   */
  pathname: string;
}

/**
 * Cuộn lên đầu trang mỗi khi chuyển sang trang khác.
 * Bỏ qua khi bấm Back/Forward (POP) để giữ vị trí cuộn cũ của trình duyệt.
 */
export const ScrollToTop: React.FC<ScrollToTopProps> = ({ pathname }) => {
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    // Chỉ chạy khi đổi trang, không chạy khi chỉ navigationType thay đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
};
