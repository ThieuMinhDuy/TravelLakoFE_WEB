import React, { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { MailCheck } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import {
  AuthHeader,
  AuthItem,
  BackToLogin,
  FormAlert,
  SlowServerHint,
} from '../components/AuthUI';
import { useAuthModal } from '../components/AuthModalContext';
import { OtpInput } from '../components/OtpInput';
import { ResendOtp } from '../components/ResendOtp';
import { useAuthNavigation } from '../hooks/useAuthNavigation';
import { useCompleteLogin } from '../hooks/useCompleteLogin';
import { useCooldown } from '../hooks/useCooldown';
import { useSlowHint } from '../hooks/useSlowHint';
import { authService } from '../services/authService';

/** Xác thực email sau khi đăng ký — thành công sẽ đăng nhập luôn */
export const VerifyOtpPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  // Đến từ màn Login với "Ghi nhớ đăng nhập" bị bỏ chọn → remember=0
  const remember = searchParams.get('remember') !== '0';
  const { buildHref, state } = useAuthNavigation();
  const { shake } = useAuthModal();
  const completeLogin = useCompleteLogin();
  const [otp, setOtp] = useState('');
  // Mã vừa được gửi khi vào màn này → đếm ngược 60s ngay
  const cooldown = useCooldown(60);

  const verify = useMutation({
    mutationFn: authService.verifyOtp,
    onSuccess: (res) => completeLogin(res, remember),
    // Backend trả 400 cho cả "OTP sai/hết hạn" lẫn "đã xác thực trước đó" → hiển thị
    // nguyên thông báo của backend; người dùng có thể quay lại đăng nhập bằng link bên dưới.
    onError: () => {
      setOtp('');
      shake();
    },
  });

  const slow = useSlowHint(verify.isPending);

  const submit = (code: string) => {
    if (code.length === 6 && !verify.isPending) verify.mutate({ email, otp: code });
  };

  // Mở trực tiếp URL mà không có email → quay về màn đăng ký
  if (!email) return <Navigate to={buildHref('/register')} replace state={state} />;

  return (
    <div className="auth-centered">
      <AuthHeader
        centered
        icon={MailCheck}
        title="Kiểm tra email"
        subtitle={
          <>
            Chúng tôi đã gửi mã xác thực 6 số tới
            <br />
            <strong>{email}</strong>
          </>
        }
      />

      <form
        className="auth-form"
        onSubmit={(e) => {
          e.preventDefault();
          submit(otp);
        }}
      >
        <AuthItem>
          <OtpInput
            value={otp}
            onChange={(v) => {
              setOtp(v);
              if (verify.isError) verify.reset();
            }}
            onComplete={submit}
            error={verify.isError}
            disabled={verify.isPending}
          />
        </AuthItem>

        <FormAlert message={verify.error?.message} />

        <AuthItem>
          <Button
            type="submit"
            className="auth-btn"
            isLoading={verify.isPending}
            disabled={otp.length < 6}
          >
            {verify.isPending ? 'Đang xác thực…' : 'Xác thực tài khoản'}
          </Button>
          <SlowServerHint show={slow} />
        </AuthItem>
      </form>

      <AuthItem>
        <a
          className="auth-open-mail"
          href="https://mail.google.com/mail/u/0/#inbox"
          target="_blank"
          rel="noreferrer"
        >
          Mở Gmail
        </a>
        <ResendOtp
          onResend={() => authService.resendOtp(email)}
          secondsLeft={cooldown.secondsLeft}
          onResent={cooldown.restart}
        />
      </AuthItem>

      <BackToLogin email={email} />
    </div>
  );
};
