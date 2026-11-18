import React, { useState } from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, KeyRound, MailCheck } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import {
  AuthHeader,
  AuthItem,
  BackToLogin,
  FormAlert,
  SlowServerHint,
  SuccessCheck,
} from '../components/AuthUI';
import { useAuthModal } from '../components/AuthModalContext';
import { OtpInput } from '../components/OtpInput';
import { PasswordChecklist } from '../components/PasswordChecklist';
import { PasswordInput } from '../components/PasswordInput';
import { ResendOtp } from '../components/ResendOtp';
import { slideVariants } from '../components/motion';
import { useAuthNavigation } from '../hooks/useAuthNavigation';
import { useCooldown } from '../hooks/useCooldown';
import { useSlowHint } from '../hooks/useSlowHint';
import { newPasswordSchema, type NewPasswordValues } from '../schemas';
import { authService, isResetOtpError } from '../services/authService';

type Step = 'otp' | 'password' | 'success';

/**
 * Luồng đặt lại mật khẩu gồm 3 bước trong cùng một màn:
 * Kiểm tra email (nhập OTP) → Đặt mật khẩu mới → Thành công.
 *
 * Backend không có API kiểm tra riêng OTP quên mật khẩu — mã chỉ được xác minh khi gửi
 * kèm mật khẩu mới. Nếu mã sai/hết hạn, quay lại bước OTP và hiển thị lỗi.
 */
export const ResetPasswordPage: React.FC = () => {
  useDocumentTitle('Đặt lại mật khẩu');
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const { goTo, buildHref, state } = useAuthNavigation();
  const { shake } = useAuthModal();

  const [step, setStep] = useState<Step>('otp');
  const [direction, setDirection] = useState(1);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  // Đặt ở cha: quay lại bước OTP không làm bộ đếm gửi lại mã chạy lại từ đầu
  const cooldown = useCooldown(60);

  const goToStep = (next: Step, dir = 1) => {
    setDirection(dir);
    setStep(next);
  };

  const reset = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => goToStep('success'),
    onError: (err) => {
      shake();
      if (isResetOtpError(err)) {
        setOtpError(err.message);
        setOtp('');
        goToStep('otp', -1);
      }
    },
  });

  if (!email) return <Navigate to={buildHref('/forgot-password')} replace state={state} />;

  return (
    <AnimatePresence mode="wait" custom={direction} initial={false}>
      <motion.div
        key={step}
        className="auth-centered"
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
      >
        {step === 'otp' && (
          <OtpStep
            email={email}
            otp={otp}
            error={otpError}
            onChange={(v) => {
              setOtp(v);
              setOtpError(null);
            }}
            onNext={() => goToStep('password')}
            onInvalid={shake}
            resendSecondsLeft={cooldown.secondsLeft}
            onResent={() => {
              cooldown.restart();
              setOtp('');
              setOtpError(null);
            }}
          />
        )}

        {step === 'password' && (
          <PasswordStep
            isPending={reset.isPending}
            error={reset.error && !isResetOtpError(reset.error) ? reset.error.message : null}
            onSubmit={(newPassword) => reset.mutate({ email, otp, newPassword })}
            onBack={() => goToStep('otp', -1)}
            onInvalid={shake}
          />
        )}

        {step === 'success' && (
          <>
            <AuthHeader
              centered
              badge={<SuccessCheck />}
              title="Đặt lại mật khẩu thành công"
              subtitle="Mật khẩu của bạn đã được cập nhật. Nhấn bên dưới để đăng nhập ngay."
            />
            <AuthItem>
              <Button type="button" className="auth-btn" onClick={() => goTo('/login', { email })}>
                Tiếp tục đăng nhập
              </Button>
            </AuthItem>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

/* -------------------------------------------------------------------------- */

interface OtpStepProps {
  email: string;
  otp: string;
  error: string | null;
  onChange: (value: string) => void;
  onNext: () => void;
  onInvalid: () => void;
  resendSecondsLeft: number;
  onResent: () => void;
}

const OtpStep: React.FC<OtpStepProps> = ({
  email,
  otp,
  error,
  onChange,
  onNext,
  onInvalid,
  resendSecondsLeft,
  onResent,
}) => {
  const next = () => (otp.length === 6 ? onNext() : onInvalid());

  return (
    <>
      <AuthHeader
        centered
        icon={MailCheck}
        title="Kiểm tra email"
        subtitle={
          <>
            Chúng tôi đã gửi mã đặt lại mật khẩu tới
            <br />
            <strong>{email}</strong>
          </>
        }
      />

      <form
        className="auth-form"
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        <AuthItem>
          <OtpInput value={otp} onChange={onChange} onComplete={onNext} error={!!error} />
        </AuthItem>

        <FormAlert message={error} />

        <AuthItem>
          <Button type="submit" className="auth-btn" disabled={otp.length < 6}>
            Tiếp tục
          </Button>
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
          onResend={() => authService.forgotPassword(email)}
          secondsLeft={resendSecondsLeft}
          onResent={onResent}
        />
      </AuthItem>

      <BackToLogin email={email} />
    </>
  );
};

/* -------------------------------------------------------------------------- */

interface PasswordStepProps {
  isPending: boolean;
  error: string | null;
  onSubmit: (newPassword: string) => void;
  onBack: () => void;
  onInvalid: () => void;
}

const PasswordStep: React.FC<PasswordStepProps> = ({
  isPending,
  error,
  onSubmit,
  onBack,
  onInvalid,
}) => {
  const slow = useSlowHint(isPending);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  return (
    <>
      <AuthHeader
        centered
        icon={KeyRound}
        title="Đặt mật khẩu mới"
        subtitle="Mật khẩu mới nên khác với mật khẩu bạn đã sử dụng trước đó."
      />

      <form
        className="auth-form"
        onSubmit={handleSubmit(({ newPassword }) => onSubmit(newPassword), onInvalid)}
        noValidate
      >
        <AuthItem>
          <PasswordInput
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới"
            autoComplete="new-password"
            autoFocus
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <PasswordChecklist password={watch('newPassword')} />
        </AuthItem>

        <AuthItem>
          <PasswordInput
            label="Nhập lại mật khẩu"
            placeholder="Nhập lại mật khẩu mới"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </AuthItem>

        <FormAlert message={error} />

        <AuthItem>
          <Button type="submit" className="auth-btn" isLoading={isPending}>
            {isPending ? 'Đang cập nhật…' : 'Đặt lại mật khẩu'}
          </Button>
          <SlowServerHint show={slow} />
        </AuthItem>
      </form>

      <AuthItem className="auth-back">
        <button type="button" className="auth-back__link" onClick={onBack}>
          <ArrowLeft className="w-3.5 h-3.5" />
          Nhập lại mã OTP
        </button>
      </AuthItem>
    </>
  );
};
