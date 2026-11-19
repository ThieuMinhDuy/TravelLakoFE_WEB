import React from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../../contexts/toast/ToastContext';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
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
import { PasswordChecklist } from '../../../components/common/PasswordChecklist';
import { PasswordInput } from '../../../components/common/PasswordInput';
import { useAuthNavigation } from '../hooks/useAuthNavigation';
import { useSlowHint } from '../hooks/useSlowHint';
import { registerSchema, type RegisterValues } from '../schemas';
import { authService } from '../services/authService';

export const RegisterPage: React.FC = () => {
  useDocumentTitle('Đăng ký');
  const { goTo } = useAuthNavigation();
  const { shake } = useAuthModal();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', agree: false },
  });

  const signUp = useMutation({
    mutationFn: authService.register,
    onSuccess: (res) => {
      toast.success('Đã gửi mã xác thực!', { description: res.message });
      goTo('/verify-otp', { email: res.email });
    },
    onError: () => shake(),
  });

  const slow = useSlowHint(signUp.isPending);

  const onSubmit = ({ name, email, password }: RegisterValues) =>
    signUp.mutate({ name: name.trim(), email: email.trim(), password });

  return (
    <>
      <AuthHeader title="Tạo tài khoản" subtitle="Bắt đầu lên kế hoạch cho chuyến đi tiếp theo" />

      <form className="auth-form" onSubmit={handleSubmit(onSubmit, shake)} noValidate>
        <AuthItem>
          <Input
            label="Họ và tên"
            placeholder="Nhập họ và tên của bạn"
            autoComplete="name"
            autoFocus
            error={errors.name?.message}
            {...register('name')}
          />
        </AuthItem>

        <AuthItem>
          <Input
            label="Địa chỉ email"
            type="email"
            placeholder="ten.cua.ban@gmail.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
        </AuthItem>

        <AuthItem>
          <PasswordInput
            label="Mật khẩu"
            placeholder="Tạo mật khẩu của bạn"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <PasswordChecklist password={watch('password')} />
        </AuthItem>

        <AuthItem>
          <label className="auth-checkbox">
            <input type="checkbox" {...register('agree')} />
            <span>
              Tôi đồng ý với <span className="auth-link">Điều khoản</span> và{' '}
              <span className="auth-link">Chính sách bảo mật</span>
            </span>
          </label>
          {errors.agree && <p className="ui-input-message--error auth-checkbox__error">{errors.agree.message}</p>}
        </AuthItem>

        <FormAlert message={signUp.error?.message} />

        <AuthItem>
          <Button type="submit" className="auth-btn" isLoading={signUp.isPending}>
            {signUp.isPending ? 'Đang tạo tài khoản…' : 'Đăng ký'}
          </Button>
          <SlowServerHint show={slow} />
        </AuthItem>
      </form>

      <AuthDivider />

      <AuthItem>
        <GoogleAuthButton mode="signup" />
      </AuthItem>

      <AuthItem>
        <p className="auth-switch">
          Đã có tài khoản? <AuthLink to="/login">Đăng nhập</AuthLink>
        </p>
      </AuthItem>
    </>
  );
};
