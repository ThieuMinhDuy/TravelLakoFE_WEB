import React from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../../contexts/toast/ToastContext';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { storage } from '../../../utils/storage';
import {
  AuthDivider,
  AuthHeader,
  AuthItem,
  AuthLink,
  FormAlert,
  SlowServerHint,
} from '../components/AuthUI';
import { useAuthModal } from '../components/AuthModalContext';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import { PasswordInput } from '../../../components/common/PasswordInput';
import { useAuthNavigation } from '../hooks/useAuthNavigation';
import { useCompleteLogin } from '../hooks/useCompleteLogin';
import { useSlowHint } from '../hooks/useSlowHint';
import { loginSchema, type LoginValues } from '../schemas';
import { authService, isUnverifiedLoginError } from '../services/authService';

export const LoginPage: React.FC = () => {
  useDocumentTitle('Đăng nhập');
  const [searchParams] = useSearchParams();
  const { goTo } = useAuthNavigation();
  const { shake } = useAuthModal();
  const toast = useToast();
  const completeLogin = useCompleteLogin();

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: searchParams.get('email') ?? '',
      password: '',
      remember: storage.isRemembered(),
    },
  });

  const login = useMutation({
    mutationFn: authService.login,
    onSuccess: (res) => completeLogin(res, getValues('remember')),
    onError: (err, { email }) => {
      // Tài khoản chưa xác thực email → gửi lại OTP và chuyển sang màn xác thực
      if (isUnverifiedLoginError(err)) {
        toast.info('Tài khoản chưa được xác thực', {
          description: 'Chúng tôi đã gửi lại mã OTP tới email của bạn.',
        });
        authService.resendOtp(email).catch((e: Error) => toast.error(e.message));
        // Giữ lựa chọn "Ghi nhớ đăng nhập" cho lần đăng nhập sau khi xác thực OTP
        goTo('/verify-otp', { email, remember: getValues('remember') ? undefined : '0' });
        return;
      }
      shake();
    },
  });

  const slow = useSlowHint(login.isPending);
  const apiError = login.error && !isUnverifiedLoginError(login.error) ? login.error.message : null;

  const onSubmit = ({ email, password }: LoginValues) => login.mutate({ email, password });

  return (
    <>
      <AuthHeader title="Đăng nhập" subtitle="Chào mừng bạn quay lại với TripMate" />

      <form className="auth-form" onSubmit={handleSubmit(onSubmit, shake)} noValidate>
        <AuthItem>
          <Input
            label="Địa chỉ email"
            type="email"
            placeholder="Nhập địa chỉ email của bạn"
            autoComplete="email"
            autoFocus
            error={errors.email?.message}
            {...register('email')}
          />
        </AuthItem>

        <AuthItem>
          <PasswordInput
            label="Mật khẩu"
            placeholder="Nhập mật khẩu của bạn"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
        </AuthItem>

        <AuthItem className="auth-form__row">
          <label className="auth-checkbox">
            <input type="checkbox" {...register('remember')} />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <AuthLink to="/forgot-password" params={{ email: watch('email') }} className="auth-link--muted">
            Quên mật khẩu?
          </AuthLink>
        </AuthItem>

        <FormAlert message={apiError} />

        <AuthItem>
          <Button type="submit" className="auth-btn" isLoading={login.isPending}>
            {login.isPending ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </Button>
          <SlowServerHint show={slow} />
        </AuthItem>
      </form>

      <AuthDivider />

      <AuthItem>
        <GoogleAuthButton mode="signin" remember={watch('remember')} />
      </AuthItem>

      <AuthItem>
        <p className="auth-switch">
          Chưa có tài khoản? <AuthLink to="/register">Đăng ký ngay</AuthLink>
        </p>
      </AuthItem>
    </>
  );
};
