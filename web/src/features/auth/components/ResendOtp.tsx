import React from 'react';
import { cn } from '../../../utils/cn';

interface ResendOtpProps {
  /** Gửi lại mã — thường là `mutate` của useOtpResend */
  onResend: () => void;
  isPending: boolean;
  /** Số giây còn phải chờ — lấy từ useCooldown() ở component cha */
  secondsLeft: number;
  /** Mã hiện tại không dùng được nữa (hết hạn / nhập sai quá số lần) → làm nút gửi lại nổi bật */
  highlight?: boolean;
}

export const ResendOtp: React.FC<ResendOtpProps> = ({ onResend, isPending, secondsLeft, highlight = false }) => (
  <p className={cn('auth-resend', highlight && 'auth-resend--highlight')}>
    {highlight ? 'Mã cũ đã hết hiệu lực.' : 'Chưa nhận được email?'}{' '}
    {secondsLeft > 0 ? (
      <span className="auth-resend__countdown">Gửi lại sau {secondsLeft}s</span>
    ) : (
      <button type="button" className="auth-link auth-resend__btn" onClick={onResend} disabled={isPending}>
        {isPending ? 'Đang gửi…' : highlight ? 'Gửi mã mới' : 'Gửi lại mã'}
      </button>
    )}
  </p>
);
