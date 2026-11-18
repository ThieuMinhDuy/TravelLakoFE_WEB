import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { MessageResponse } from '../../../types/api';

interface ResendOtpProps {
  onResend: () => Promise<MessageResponse>;
  /** Số giây còn phải chờ — lấy từ useCooldown() ở component cha */
  secondsLeft: number;
  /** Gọi sau khi gửi lại thành công (cha khởi động lại bộ đếm) */
  onResent: () => void;
}

export const ResendOtp: React.FC<ResendOtpProps> = ({ onResend, secondsLeft, onResent }) => {
  const resend = useMutation({
    mutationFn: onResend,
    onSuccess: (res) => {
      toast.success(res.message || 'Đã gửi lại mã OTP!');
      onResent();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <p className="auth-resend">
      Chưa nhận được email?{' '}
      {secondsLeft > 0 ? (
        <span className="auth-resend__countdown">Gửi lại sau {secondsLeft}s</span>
      ) : (
        <button
          type="button"
          className="auth-link auth-resend__btn"
          onClick={() => resend.mutate()}
          disabled={resend.isPending}
        >
          {resend.isPending ? 'Đang gửi…' : 'Gửi lại mã'}
        </button>
      )}
    </p>
  );
};
