import React, { useEffect, useMemo, useRef } from 'react';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { useToast } from '../../../contexts/toast/ToastContext';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { IMAGE_ACCEPT, validateImageFile } from '../../../config/upload';
import { uploadService } from '../../../services/uploadService';
import { useAuthStore } from '../../../store/useAuthStore';
import type { User as UserModel } from '../../../types/user';
import { authService } from '../../auth/services/authService';
import { profileService } from '../services/profileService';
import { User, Mail, Phone, Calendar, Heart, MapPin, MessageSquare } from 'lucide-react';
import './css/ProfilePage.css';

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(50, 'Họ tên tối đa 50 ký tự'),
  phone: z
    .string()
    .trim()
    .regex(/^(0\d{9})?$/, 'Số điện thoại gồm 10 chữ số và bắt đầu bằng 0'),
  dateOfBirth: z.string(),
});
type ProfileValues = z.infer<typeof profileSchema>;

const toFormValues = (user: UserModel | null): ProfileValues => ({
  name: user?.name ?? '',
  phone: user?.phone ?? '',
  dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
});

export const ProfilePage: React.FC = () => {
  useDocumentTitle('Hồ sơ cá nhân');
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Luôn lấy profile mới nhất (kèm thống kê) khi vào trang
  const profileQuery = useQuery({ queryKey: ['profile'], queryFn: authService.getProfile });
  useEffect(() => {
    if (profileQuery.data) updateUser(profileQuery.data);
  }, [profileQuery.data, updateUser]);

  // `values` đồng bộ form theo store khi profile tải xong; keepDirtyValues giữ ô đang sửa dở
  const formValues = useMemo(() => toFormValues(user), [user]);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: formValues,
    resetOptions: { keepDirtyValues: true },
  });

  const saveProfile = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (updated) => {
      updateUser(updated);
      toast.success('Đã lưu thông tin cá nhân!');
    },
    onError: (err) => toast.error(err.message),
  });

  const changeAvatar = useMutation({
    mutationFn: async (file: File) => {
      const { url } = await uploadService.uploadImage(file);
      return profileService.updateProfile({ avatar: url });
    },
    onSuccess: (updated) => {
      updateUser(updated);
      toast.success('Đã cập nhật ảnh đại diện!');
    },
    onError: (err) => toast.error(err.message),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn lại cùng một file
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    changeAvatar.mutate(file);
  };

  const onSubmit = ({ name, phone, dateOfBirth }: ProfileValues) =>
    saveProfile.mutate({ name: name.trim(), phone: phone.trim(), dateOfBirth: dateOfBirth || null });

  return (
    <div className="profile-page">
      {/* Page Header */}
      <div>
        <h1 className="profile-page__title">Hồ sơ cá nhân & Cài đặt</h1>
        <p className="profile-page__subtitle">
          Quản lý thông tin tài khoản, sở thích du lịch và cá nhân hóa trải nghiệm AI
        </p>
      </div>

      {/* User Stats Card */}
      <div className="profile-stats">
        <Card className="profile-stat-card">
          <div className="profile-stat-card__icon profile-stat-card__icon--blue">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="profile-stat-card__label">Chuyến đi đã tạo</p>
            <p className="profile-stat-card__value">{user?.stats?.trips || 0}</p>
          </div>
        </Card>

        <Card className="profile-stat-card">
          <div className="profile-stat-card__icon profile-stat-card__icon--amber">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="profile-stat-card__label">Địa điểm yêu thích</p>
            <p className="profile-stat-card__value">{user?.stats?.favorites || 0}</p>
          </div>
        </Card>

        <Card className="profile-stat-card">
          <div className="profile-stat-card__icon profile-stat-card__icon--teal">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="profile-stat-card__label">Đánh giá đã viết</p>
            <p className="profile-stat-card__value">{user?.stats?.reviews || 0}</p>
          </div>
        </Card>
      </div>

      {/* Profile Form Card */}
      <Card className="profile-form-card">
        <div className="profile-user-header">
          <div className="profile-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="profile-avatar__img" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div>
            <h3 className="profile-user-name">{user?.name || 'Tên người dùng'}</h3>
            <p className="profile-user-email">{user?.email || 'email@example.com'}</p>
            <input
              ref={avatarInputRef}
              type="file"
              accept={IMAGE_ACCEPT}
              onChange={handleAvatarChange}
              className="hidden"
              aria-label="Chọn ảnh đại diện"
            />
            <Button
              variant="outline"
              size="sm"
              style={{ marginTop: '0.625rem' }}
              isLoading={changeAvatar.isPending}
              onClick={() => avatarInputRef.current?.click()}
            >
              {changeAvatar.isPending ? 'Đang tải ảnh…' : 'Đổi ảnh đại diện'}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="profile-form" noValidate>
          <div className="profile-form__grid">
            <Input
              label="Họ và tên"
              autoComplete="name"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              id="profile-email"
              label="Địa chỉ Email"
              value={user?.email ?? ''}
              readOnly
              disabled
              leftIcon={<Mail className="w-4 h-4" />}
            />
          </div>

          <div className="profile-form__grid">
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
          </div>

          <div className="profile-form__actions">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={saveProfile.isPending}
              disabled={!isDirty}
            >
              {saveProfile.isPending ? 'Đang lưu…' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
