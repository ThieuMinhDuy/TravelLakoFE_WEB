import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Calendar, Mail, Phone, Save, User as UserIcon } from 'lucide-react';
import { Button } from '../../../../components/common/Button';
import { Input } from '../../../../components/common/Input';
import { Select } from '../../../../components/common/Select';
import { TagSelect } from '../../../../components/common/TagSelect';
import { LocaleSwitcher } from '../../../../components/layout/LocaleSwitcher';
import { BUDGET_OPTIONS, GENDER_OPTIONS, TRAVEL_INTERESTS } from '../../../../config/profileOptions';
import { useToast } from '../../../../contexts/toast/ToastContext';
import { queryKeys } from '../../../../lib/queryKeys';
import { useAuthStore } from '../../../../store/useAuthStore';
import { cn } from '../../../../utils/cn';
import type { User } from '../../../../types/user';
import { profileService } from '../../services/profileService';
import { ChangePasswordCard } from '../ChangePasswordCard';

const MAX_INTERESTS = 6;

const settingsSchema = z.object({
  name: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(50, 'Họ tên tối đa 50 ký tự'),
  phone: z
    .string()
    .trim()
    .regex(/^(0\d{9})?$/, 'Số điện thoại gồm 10 chữ số và bắt đầu bằng 0'),
  dateOfBirth: z
    .string()
    .refine((v) => !v || new Date(v) <= new Date(), 'Ngày sinh không được ở tương lai'),
  gender: z.enum(['', 'Nam', 'Nữ', 'Khác']),
  travelPreferences: z.array(z.string()).max(MAX_INTERESTS, `Chọn tối đa ${MAX_INTERESTS} sở thích`),
  favoriteBudget: z.enum(['', 'Tiết kiệm', 'Trung bình', 'Cao cấp']),
});
type SettingsValues = z.infer<typeof settingsSchema>;

const toFormValues = (user: User): SettingsValues => ({
  name: user.name ?? '',
  phone: user.phone ?? '',
  dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
  gender: user.gender ?? '',
  travelPreferences: user.travelPreferences ?? [],
  favoriteBudget: user.favoriteBudget ?? '',
});

const INTEREST_OPTIONS = TRAVEL_INTERESTS.map((i) => ({ value: i.value, label: i.value, icon: <span aria-hidden="true">{i.emoji}</span> }));

/** Tab "Cài đặt tài khoản": thông tin cá nhân, sở thích & ngân sách, định dạng hiển thị */
export const SettingsTab: React.FC<{ user: User }> = ({ user }) => {
  const updateUser = useAuthStore((s) => s.updateUser);
  const queryClient = useQueryClient();
  const toast = useToast();

  // `values` đồng bộ form theo dữ liệu mới nhất; keepDirtyValues giữ các ô đang sửa dở
  const formValues = useMemo(() => toFormValues(user), [user]);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    values: formValues,
    resetOptions: { keepDirtyValues: true },
  });

  const save = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (updated) => {
      updateUser(updated);
      void queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      toast.success('Đã lưu thông tin cá nhân!');
    },
    onError: (err) => toast.error('Lưu thất bại', { description: err.message }),
  });

  const onSubmit = (values: SettingsValues) =>
    save.mutate({
      name: values.name.trim(),
      phone: values.phone.trim(),
      dateOfBirth: values.dateOfBirth || null,
      gender: values.gender,
      travelPreferences: values.travelPreferences,
      favoriteBudget: values.favoriteBudget,
    });

  return (
    <div className="settings">
      <form onSubmit={handleSubmit(onSubmit)} className="settings__form" noValidate>
        {/* 1. Thông tin cá nhân */}
        <section className="settings__card" aria-labelledby="settings-info">
          <header className="settings__card-header">
            <h2 id="settings-info" className="settings__card-title">Thông tin cá nhân</h2>
            <p className="settings__card-desc">Thông tin cơ bản hiển thị trên hồ sơ của bạn.</p>
          </header>
          <div className="settings__grid">
            <Input
              label="Họ và tên"
              autoComplete="name"
              leftIcon={<UserIcon className="w-4 h-4" />}
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              id="settings-email"
              label="Địa chỉ email"
              value={user.email}
              readOnly
              disabled
              helperText="Email dùng để đăng nhập, không thể thay đổi."
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <Input
              label="Số điện thoại"
              type="tel"
              placeholder="0987654321"
              autoComplete="tel"
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Ngày sinh"
              type="date"
              autoComplete="bday"
              leftIcon={<Calendar className="w-4 h-4" />}
              error={errors.dateOfBirth?.message}
              {...register('dateOfBirth')}
            />
            <Select
              label="Giới tính"
              placeholder="Không muốn tiết lộ"
              options={GENDER_OPTIONS}
              error={errors.gender?.message}
              {...register('gender')}
            />
          </div>
        </section>

        {/* 2. Sở thích & ngân sách — dùng để cá nhân hóa gợi ý */}
        <section className="settings__card" aria-labelledby="settings-preferences">
          <header className="settings__card-header">
            <h2 id="settings-preferences" className="settings__card-title">Sở thích du lịch</h2>
            <p className="settings__card-desc">
              TripMate dùng sở thích và ngân sách để gợi ý địa điểm, lịch trình phù hợp với bạn.
            </p>
          </header>

          <Controller
            control={control}
            name="travelPreferences"
            render={({ field }) => (
              <TagSelect
                label="Sở thích du lịch"
                options={INTEREST_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                max={MAX_INTERESTS}
              />
            )}
          />
          <p className="settings__hint">
            {errors.travelPreferences?.message ?? `Chọn tối đa ${MAX_INTERESTS} sở thích.`}
          </p>

          <fieldset className="settings__budget">
            <legend className="settings__label">Ngân sách mong muốn</legend>
            <Controller
              control={control}
              name="favoriteBudget"
              render={({ field }) => (
                <div className="budget-options">
                  {BUDGET_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={cn('budget-option', field.value === option.value && 'budget-option--selected')}
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={option.value}
                        checked={field.value === option.value}
                        onChange={() => field.onChange(option.value)}
                        className="budget-option__input"
                      />
                      <span className="budget-option__label">{option.label}</span>
                      <span className="budget-option__hint">{option.hint}</span>
                    </label>
                  ))}
                </div>
              )}
            />
          </fieldset>
        </section>

        <div className="settings__actions">
          <Button
            type="submit"
            variant="primary"
            isLoading={save.isPending}
            disabled={!isDirty}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {save.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
          </Button>
        </div>
      </form>

      {/* 3. Bảo mật — form riêng, lưu độc lập với thông tin cá nhân */}
      <ChangePasswordCard user={user} />

      {/* 4. Hiển thị — lưu ngay khi chọn, không cần bấm Lưu */}
      <section className="settings__card" aria-labelledby="settings-display">
        <header className="settings__card-header">
          <h2 id="settings-display" className="settings__card-title">Hiển thị</h2>
          <p className="settings__card-desc">Cách hiển thị số tiền và ngày tháng trên toàn bộ trang web.</p>
        </header>
        <LocaleSwitcher variant="light" />
      </section>
    </div>
  );
};
