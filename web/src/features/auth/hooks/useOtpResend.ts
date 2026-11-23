import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../../contexts/toast/ToastContext';
import { getRetryAfter, hasErrorCode } from '../../../services/apiError';
import type { MessageResponse } from '../../../types/api';
import type { Cooldown } from './useCooldown';

/** Thời gian chờ mặc định giữa hai lần gửi mã (khớp backend) khi lỗi không kèm `retryAfter` */
export const OTP_RESEND_SECONDS = 60;

/**
 * Gửi (lại) mã OTP và đồng bộ bộ đếm với backend:
 * - Thành công → đếm lại 60 giây.
 * - `OTP_COOLDOWN` (mã vừa được gửi gần đây): không phải lỗi, chỉ nhắc và đếm theo `retryAfter`.
 * - `RATE_LIMITED` (gửi quá nhiều lần): báo lỗi và khóa nút theo `retryAfter`.
 */
export function useOtpResend(
  send: () => Promise<MessageResponse>,
  cooldown: Cooldown,
  /** Gọi sau khi gửi thành công (vd: xóa ô OTP và lỗi của mã cũ) */
  onSent?: () => void
) {
  const toast = useToast();

  return useMutation({
    mutationFn: () => send(),
    onSuccess: (res) => {
      toast.success(res.message || 'Đã gửi mã OTP!');
      cooldown.restart();
      onSent?.();
    },
    onError: (error) => {
      const wait = getRetryAfter(error) ?? OTP_RESEND_SECONDS;
      if (hasErrorCode(error, 'OTP_COOLDOWN')) {
        toast.info('Mã OTP vừa được gửi gần đây', {
          description: `Hãy kiểm tra hộp thư. Bạn có thể yêu cầu mã mới sau ${wait} giây.`,
        });
        cooldown.restart(wait);
      } else if (hasErrorCode(error, 'RATE_LIMITED')) {
        toast.error(error.message);
        cooldown.restart(wait);
      } else {
        toast.error(error.message || 'Không gửi được mã OTP');
      }
    },
  });
}
