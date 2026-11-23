import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { PasswordChecklist } from '../../../components/common/PasswordChecklist';
import { PasswordInput } from '../../../components/common/PasswordInput';
import { useToast } from '../../../contexts/toast/ToastContext';
import { hasErrorCode } from '../../../services/apiError';
import { useAuthStore } from '../../../store/useAuthStore';
import { getPasswordError } from '../../../utils/validators';
import type { User } from '../../../types/user';
import { authService } from '../../auth/services/authService';

/** Schema phụ thuộc việc tài khoản đã có mật khẩu chưa (tài khoản Google có thể chưa có) */
const buildSchema = (hasPassword: boolean) =>
  z
    .object({
      currentPassword: z.string(),
      newPassword: z.string().superRefine((value, ctx) => {
        const message = getPasswordError(value);
        if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, message });
      }),
      confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu mới'),
    })
    .superRefine((v, ctx) => {
      if (hasPassword && !v.currentPassword) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['currentPassword'], message: 'Vui lòng nhập mật khẩu hiện tại' });
      }
      if (hasPassword && v.currentPassword && v.currentPassword === v.newPassword) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['newPassword'], message: 'Mật khẩu mới phải khác mật khẩu hiện tại' });
      }
      if (v.newPassword !== v.confirmPassword) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'Mật khẩu nhập lại không khớp' });
      }
    });

type PasswordValues = z.infer<ReturnType<typeof buildSchema>>;
const EMPTY: PasswordValues = { currentPassword: '', newPassword: '', confirmPassword: '' };

/** Đổi mật khẩu (xác minh mật khẩu hiện tại) hoặc tạo mật khẩu cho tài khoản Google */
export const ChangePasswordCard: React.FC<{ user: User }> = ({ user }) => {
  const updateUser = useAuthStore((s) => s.updateUser);
  const toast = useToast();
  // Dữ liệu cũ trong cache có thể chưa có cờ hasPassword → suy ra từ loại tài khoản
  const hasPassword = user.hasPassword ?? user.authType !== 'google';
  const schema = useMemo(() => buildSchema(hasPassword), [hasPassword]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  /** Lỗi của backend thuộc về một ô cụ thể → hiện ngay dưới ô đó thay vì ở khung lỗi chung */
  const fieldOf = (error: unknown): keyof PasswordValues | null =>
    hasErrorCode(error, 'CURRENT_PASSWORD_INCORRECT')
      ? 'currentPassword'
      : hasErrorCode(error, 'WEAK_PASSWORD', 'SAME_PASSWORD')
        ? 'newPassword'
        : null;

  const change = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: (res) => {
      toast.success(res.message || (hasPassword ? 'Đổi mật khẩu thành công!' : 'Đã tạo mật khẩu!'));
      updateUser({ hasPassword: true });
      reset(EMPTY);
    },
    onError: (error) => {
      const field = fieldOf(error);
      if (field) setError(field, { message: error.message }, { shouldFocus: true });
    },
  });

  const onSubmit = ({ currentPassword, newPassword }: PasswordValues) =>
    change.mutate(hasPassword ? { currentPassword, newPassword } : { newPassword });

  return (
    <section className="settings__card" aria-labelledby="settings-security">
      <header className="settings__card-header">
        <h2 id="settings-security" className="settings__card-title">
          {hasPassword ? 'Đổi mật khẩu' : 'Tạo mật khẩu'}
        </h2>
        <p className="settings__card-desc">
          {hasPassword
            ? 'Để bảo mật, bạn cần nhập mật khẩu hiện tại trước khi đặt mật khẩu mới.'
            : 'Tài khoản của bạn đăng nhập bằng Google. Tạo mật khẩu để có thể đăng nhập bằng email.'}
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="settings__password-form" noValidate>
        {hasPassword && (
          <PasswordInput
            label="Mật khẩu hiện tại"
            autoComplete="current-password"
            leftIcon={<KeyRound className="w-4 h-4" />}
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
        )}
        <div className="settings__grid">
          <div>
            <PasswordInput
              label="Mật khẩu mới"
              autoComplete="new-password"
              leftIcon={<ShieldCheck className="w-4 h-4" />}
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <PasswordChecklist password={watch('newPassword')} />
          </div>
          <PasswordInput
            label="Nhập lại mật khẩu mới"
            autoComplete="new-password"
            leftIcon={<ShieldCheck className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        {change.error && !fieldOf(change.error) && (
          <p className="settings__alert" role="alert">
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
            {change.error.message}
          </p>
        )}

        <div className="settings__actions">
          <Button type="submit" variant="primary" isLoading={change.isPending}>
            {change.isPending ? 'Đang lưu…' : hasPassword ? 'Đổi mật khẩu' : 'Tạo mật khẩu'}
          </Button>
        </div>
      </form>
    </section>
  );
};
