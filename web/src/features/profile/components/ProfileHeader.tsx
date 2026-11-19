import React, { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Camera, ImagePlus, Mail, PencilLine, Wallet, X } from 'lucide-react';
import { Avatar } from '../../../components/common/Avatar';
import { IMAGE_ACCEPT, validateImageFile } from '../../../config/upload';
import { TRAVEL_INTERESTS } from '../../../config/profileOptions';
import { useLocale } from '../../../contexts/locale/LocaleContext';
import { useToast } from '../../../contexts/toast/ToastContext';
import { uploadService } from '../../../services/uploadService';
import { useAuthStore } from '../../../store/useAuthStore';
import type { User } from '../../../types/user';
import { profileService } from '../services/profileService';
import defaultCover from '../../../assets/beach_banner_1.webp';

interface ProfileHeaderProps {
  user: User;
  /** Số liệu mới nhất (ưu tiên dữ liệu đã tải của từng tab, fallback về user.stats) */
  stats: { trips: number; favorites: number; reviews: number };
  onEditProfile: () => void;
}

const interestEmoji = (value: string) => TRAVEL_INTERESTS.find((i) => i.value === value)?.emoji ?? '📍';

/** Phần đầu trang Hồ sơ: ảnh bìa, ảnh đại diện (đổi được), tên, sở thích, ngân sách, thống kê */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, stats, onEditProfile }) => {
  const updateUser = useAuthStore((s) => s.updateUser);
  const toast = useToast();
  const { formatNumber } = useLocale();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  /** Tải ảnh lên Cloudinary rồi lưu URL vào trường tương ứng; `file = null` → gỡ ảnh */
  const updateImage = useMutation({
    mutationFn: async ({ field, file }: { field: 'avatar' | 'coverImage'; file: File | null }) => {
      const url = file ? (await uploadService.uploadImage(file)).url : '';
      return profileService.updateProfile({ [field]: url });
    },
    onSuccess: (updated, { field, file }) => {
      updateUser(updated);
      toast.success(
        field === 'avatar' ? 'Đã cập nhật ảnh đại diện!' : file ? 'Đã cập nhật ảnh bìa!' : 'Đã gỡ ảnh bìa'
      );
    },
    onError: (err) => toast.error(err.message),
  });
  const pendingField = updateImage.isPending ? updateImage.variables?.field : undefined;

  const handleFileChange = (field: 'avatar' | 'coverImage') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn lại cùng một file
    if (!file) return;
    const error = validateImageFile(file);
    if (error) toast.error(error);
    else updateImage.mutate({ field, file });
  };

  const interests = user.travelPreferences ?? [];

  return (
    <section className="profile-hero" aria-label="Thông tin hồ sơ">
      <div className="profile-hero__cover">
        <img src={user.coverImage || defaultCover} alt="" className="profile-hero__cover-img" />
        <input
          ref={coverInputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          onChange={handleFileChange('coverImage')}
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />
        <div className="profile-hero__cover-actions">
          {user.coverImage && (
            <button
              type="button"
              className="profile-hero__cover-btn profile-hero__cover-btn--ghost"
              onClick={() => updateImage.mutate({ field: 'coverImage', file: null })}
              disabled={updateImage.isPending}
              aria-label="Gỡ ảnh bìa, dùng ảnh mặc định"
            >
              <X className="w-4 h-4" />
              <span className="profile-hero__cover-btn-text">Gỡ</span>
            </button>
          )}
          <button
            type="button"
            className="profile-hero__cover-btn"
            onClick={() => coverInputRef.current?.click()}
            disabled={updateImage.isPending}
          >
            <ImagePlus className={pendingField === 'coverImage' ? 'w-4 h-4 animate-pulse' : 'w-4 h-4'} />
            <span className="profile-hero__cover-btn-text">
              {pendingField === 'coverImage' ? 'Đang tải…' : 'Đổi ảnh bìa'}
            </span>
          </button>
        </div>
      </div>

      <div className="profile-hero__content">
        <div className="profile-hero__avatar-wrap">
          <Avatar name={user.name} src={user.avatar} size="xl" className="profile-hero__avatar" />
          <input
            ref={avatarInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={handleFileChange('avatar')}
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />
          <button
            type="button"
            className="profile-hero__avatar-btn"
            onClick={() => avatarInputRef.current?.click()}
            disabled={updateImage.isPending}
            aria-label="Đổi ảnh đại diện"
            title="Đổi ảnh đại diện"
          >
            <Camera className={pendingField === 'avatar' ? 'w-4 h-4 animate-pulse' : 'w-4 h-4'} />
          </button>
        </div>

        <div className="profile-hero__info">
          <div className="profile-hero__name-row">
            <h1 className="profile-hero__name">{user.name}</h1>
            <button
              type="button"
              className="profile-hero__edit-btn"
              onClick={onEditProfile}
              aria-label="Chỉnh sửa hồ sơ"
              title="Chỉnh sửa hồ sơ"
            >
              <PencilLine className="w-4 h-4" />
            </button>
          </div>

          <p className="profile-hero__email">
            <Mail className="w-4 h-4" aria-hidden="true" />
            {user.email}
          </p>

          {(interests.length > 0 || user.favoriteBudget) && (
            <ul className="profile-hero__tags" aria-label="Sở thích du lịch và ngân sách">
              {interests.map((interest) => (
                <li key={interest} className="profile-hero__tag">
                  <span aria-hidden="true">{interestEmoji(interest)}</span> {interest}
                </li>
              ))}
              {user.favoriteBudget && (
                <li className="profile-hero__tag profile-hero__tag--budget">
                  <Wallet className="w-3.5 h-3.5" aria-hidden="true" />
                  Ngân sách {user.favoriteBudget.toLowerCase()}
                </li>
              )}
            </ul>
          )}

          <dl className="profile-hero__stats">
            <div>
              <dt>Chuyến đi</dt>
              <dd>{formatNumber(stats.trips)}</dd>
            </div>
            <div>
              <dt>Yêu thích</dt>
              <dd>{formatNumber(stats.favorites)}</dd>
            </div>
            <div>
              <dt>Đánh giá</dt>
              <dd>{formatNumber(stats.reviews)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
};
