import { useEffect } from 'react';
import { useToast } from '../../contexts/toast/ToastContext';
import { sessionEvents } from '../../lib/sessionEvents';

/** Hiện toast khi interceptor kết thúc phiên hoặc thu hồi quyền (không render gì) */
export const SessionNotice = () => {
  const toast = useToast();

  useEffect(
    () =>
      sessionEvents.subscribe((event) => {
        if (event.type === 'expired') {
          toast.info('Phiên đăng nhập đã hết hạn', { description: 'Vui lòng đăng nhập lại để tiếp tục.' });
        } else if (event.type === 'blocked') {
          toast.error(event.message, { description: 'Bạn đã được đăng xuất. Liên hệ quản trị viên nếu có nhầm lẫn.' });
        } else {
          toast.warning('Bạn không còn quyền quản trị', {
            description: 'Quyền Admin của tài khoản này vừa bị thu hồi.',
          });
        }
      }),
    [toast]
  );

  return null;
};
