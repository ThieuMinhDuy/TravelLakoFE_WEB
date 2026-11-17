import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { MessageResponse } from '../../../types/api';

interface ResendOtpProps {
  onResend: () => Promise<MessageResponse>;
  /** Thời gian chờ giữa 2 lần gửi (giây) */
  cooldown?: number;
  /** Mã vừa được gửi khi mở màn → bắt đầu đếm ngược ngay */
  startCoolingDown?: boolean;
  onResent?: () => void;
}

export const ResendOtp: React.FC<ResendOtpProps> = ({
  onResend,
  cooldown = 60,
  startCoolingDown = true,
  onResent,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(startCoolingDown ? cooldown : 0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const resend = useMutation({
    mutationFn: onResend,
    onSuccess: (res) => {
      toast.success(res.message || 'Đã gửi lại mã OTP!');
      setSecondsLeft(cooldown);
      onResent?.();
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
