import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import {
  AuthHeader,
  AuthItem,
  BackToLogin,
  FormAlert,
  SlowServerHint,
} from '../components/AuthUI';
import { useAuthModal } from '../components/AuthModalContext';
import { useAuthNavigation } from '../hooks/useAuthNavigation';
import { useSlowHint } from '../hooks/useSlowHint';
import { forgotPasswordSchema, type ForgotPasswordValues } from '../schemas';
import { authService } from '../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { goTo } = useAuthNavigation();
  const { shake } = useAuthModal();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: searchParams.get('email') ?? '' },
  });

  const forgot = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (res, email) => {
      toast.success(res.message);
      goTo('/reset-password', { email });
    },
    onError: () => shake(),
  });

  const slow = useSlowHint(forgot.isPending);

  return (
    <div className="auth-centered">
      <AuthHeader
        centered
        icon={KeyRound}
        title="Quên mật khẩu?"
        subtitle="Đừng lo, nhập email đã đăng ký và chúng tôi sẽ gửi mã đặt lại mật khẩu cho bạn."
      />

      <form
        className="auth-form"
        onSubmit={handleSubmit(({ email }) => forgot.mutate(email.trim()), shake)}
        noValidate
      >
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

        <FormAlert message={forgot.error?.message} />

        <AuthItem>
          <Button type="submit" className="auth-btn" isLoading={forgot.isPending}>
            {forgot.isPending ? 'Đang gửi mã…' : 'Gửi mã đặt lại'}
          </Button>
          <SlowServerHint show={slow} />
        </AuthItem>
      </form>

      <BackToLogin email={watch('email')} />
    </div>
  );
};
