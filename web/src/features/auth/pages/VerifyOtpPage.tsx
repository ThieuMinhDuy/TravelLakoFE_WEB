import React, { useEffect, useRef, useState } from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { MailCheck } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { useToast } from '../../../contexts/toast/ToastContext';
import { hasErrorCode } from '../../../services/apiError';
import {
  AuthHeader,
  AuthItem,
  AuthLink,
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
import { OTP_RESEND_SECONDS, useOtpResend } from '../hooks/useOtpResend';
import { useSlowHint } from '../hooks/useSlowHint';
import { authService, isOtpRenewRequired } from '../services/authService';

/** Xác thực email sau khi đăng ký — thành công sẽ đăng nhập luôn */
export const VerifyOtpPage: React.FC = () => {
  useDocumentTitle('Xác thực email');
  const [searchParams, setSearchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  // Đến từ màn Login với "Ghi nhớ đăng nhập" bị bỏ chọn → remember=0
  const remember = searchParams.get('remember') !== '0';
  // Đến từ Login / Quên mật khẩu khi tài khoản chưa xác thực → màn này tự gửi mã (send=1)
  const shouldSend = searchParams.get('send') === '1';
  const { goTo, buildHref, state } = useAuthNavigation();
  const { shake } = useAuthModal();
  const toast = useToast();
  const completeLogin = useCompleteLogin();
  const [otp, setOtp] = useState('');
  // Mã vừa được gửi khi vào màn này (sau đăng ký, hoặc gửi ngay bên dưới) → đếm ngược 60s
  const cooldown = useCooldown(OTP_RESEND_SECONDS);

  const verify = useMutation({
    mutationFn: authService.verifyOtp,
    onSuccess: (res) => completeLogin(res, remember),
    onError: (error) => {
      setOtp('');
      if (hasErrorCode(error, 'ACCOUNT_ALREADY_VERIFIED')) {
        toast.info('Tài khoản đã được xác thực', { description: 'Hãy đăng nhập để tiếp tục.' });
        goTo('/login', { email });
        return;
      }
      shake();
    },
  });

  // Gửi mã mới thành công → bỏ lỗi của mã cũ
  const resend = useOtpResend(() => authService.resendOtp(email), cooldown, () => verify.reset());

  // Tự gửi mã một lần, rồi bỏ cờ khỏi URL để tải lại trang không gửi thêm mã
  const autoSent = useRef(false);
  useEffect(() => {
    if (!shouldSend || !email || autoSent.current) return;
    autoSent.current = true;
    resend.mutate();
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('send');
        return next;
      },
      { replace: true, state }
    );
  }, [shouldSend, email, resend, setSearchParams, state]);

  const slow = useSlowHint(verify.isPending);
  const renewRequired = isOtpRenewRequired(verify.error);
  const accountMissing = hasErrorCode(verify.error, 'USER_NOT_FOUND');

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
        {accountMissing && (
          <AuthItem>
            <p className="auth-switch">
              Email này chưa có tài khoản. <AuthLink to="/register">Đăng ký ngay</AuthLink>
            </p>
          </AuthItem>
        )}

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
          onResend={() => resend.mutate()}
          isPending={resend.isPending}
          secondsLeft={cooldown.secondsLeft}
          highlight={renewRequired}
        />
      </AuthItem>

      <BackToLogin email={email} />
    </div>
  );
};
