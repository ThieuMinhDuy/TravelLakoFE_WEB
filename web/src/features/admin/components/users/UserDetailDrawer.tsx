import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ShieldCheck, ShieldOff, Trash2, Unlock } from 'lucide-react';
import { Drawer } from '../../../../components/common/Drawer';
import { Avatar } from '../../../../components/common/Avatar';
import { Badge } from '../../../../components/common/Badge';
import { Button } from '../../../../components/common/Button';
import { Input } from '../../../../components/common/Input';
import { useLocale } from '../../../../contexts/locale/LocaleContext';
import { useToast } from '../../../../contexts/toast/ToastContext';
import type { AdminUpdateUserDTO, AdminUser } from '../../../../types/admin';
import { useUpdateUser } from '../../hooks/useAdminMutations';
import { userEditSchema, type UserEditValues } from '../../schemas';
import { adminErrorMessage } from '../../utils/adminErrors';
import type { UserActionKind } from './UserActionDialog';
import { UserStatusBadges } from './UserStatusBadges';

interface UserDetailDrawerProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  /** Là tài khoản của admin đang đăng nhập → không cho khóa / gỡ quyền / xóa */
  isSelf: boolean;
  onAction: (kind: UserActionKind) => void;
}

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({ user, open, onClose, isSelf, onAction }) => (
  <Drawer open={open} onClose={onClose} side="right" title="Chi tiết người dùng" className="admin-user-drawer">
    {user && (
      <div className="admin-user-detail">
        <section className="admin-user-detail__hero">
          <Avatar src={user.avatar} name={user.name} size="lg" />
          <div className="admin-user-detail__identity">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <UserStatusBadges user={user} isSelf={isSelf} />
          </div>
        </section>

        <UserInfoList user={user} />

        {/* key: đổi user → form khởi tạo lại với dữ liệu mới */}
        <UserEditForm key={user._id} user={user} />

        <section className="admin-user-detail__section">
          <h4 className="admin-user-detail__heading">Thao tác</h4>
          {isSelf && <p className="admin-user-detail__note">Bạn không thể khóa, gỡ quyền hoặc xóa tài khoản của chính mình.</p>}
          <div className="admin-user-detail__actions">
            <Button
              variant="outline"
              size="sm"
              disabled={isSelf}
              leftIcon={user.isBlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              onClick={() => onAction(user.isBlocked ? 'unblock' : 'block')}
            >
              {user.isBlocked ? 'Mở khóa' : 'Khóa tài khoản'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isSelf}
              leftIcon={user.isAdmin ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              onClick={() => onAction(user.isAdmin ? 'revoke' : 'grant')}
            >
              {user.isAdmin ? 'Gỡ quyền Admin' : 'Cấp quyền Admin'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isSelf}
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => onAction('delete')}
            >
              Xóa tài khoản
            </Button>
          </div>
        </section>
      </div>
    )}
  </Drawer>
);

const UserInfoList: React.FC<{ user: AdminUser }> = ({ user }) => {
  const { formatDate, formatDateTime } = useLocale();
  const rows: [string, React.ReactNode][] = [
    ['Đăng nhập bằng', user.authType === 'google' ? 'Google' : 'Email & mật khẩu'],
    ['Xác thực email', user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'],
    ['Số điện thoại', user.phone || '—'],
    ['Giới tính', user.gender || '—'],
    ['Ngày sinh', user.dateOfBirth ? formatDate(user.dateOfBirth) : '—'],
    ['Ngân sách ưa thích', user.favoriteBudget || '—'],
    [
      'Sở thích du lịch',
      user.travelPreferences?.length ? (
        <span className="admin-user-detail__tags">
          {user.travelPreferences.map((p) => (
            <Badge key={p} variant="neutral" size="sm">
              {p}
            </Badge>
          ))}
        </span>
      ) : (
        '—'
      ),
    ],
    ['Ngày tham gia', formatDateTime(user.createdAt)],
    ['Cập nhật lần cuối', formatDateTime(user.updatedAt)],
  ];

  return (
    <section className="admin-user-detail__section">
      <h4 className="admin-user-detail__heading">Thông tin tài khoản</h4>
      <dl className="admin-user-detail__info">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

const UserEditForm: React.FC<{ user: AdminUser }> = ({ user }) => {
  const toast = useToast();
  const updateUser = useUpdateUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UserEditValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: { name: user.name, email: user.email },
  });

  const onSubmit = (values: UserEditValues) => {
    // Chỉ gửi field thực sự thay đổi
    const body: AdminUpdateUserDTO = {};
    if (values.name !== user.name) body.name = values.name;
    if (values.email !== user.email.toLowerCase()) body.email = values.email;
    if (!Object.keys(body).length) return;

    updateUser.mutate(
      { id: user._id, body },
      {
        onSuccess: (updated) => {
          toast.success('Đã cập nhật thông tin');
          reset({ name: updated.name, email: updated.email });
        },
      }
    );
  };

  return (
    <section className="admin-user-detail__section">
      <h4 className="admin-user-detail__heading">Chỉnh sửa</h4>
      <form className="admin-user-detail__form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input label="Họ tên" autoComplete="off" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" autoComplete="off" error={errors.email?.message} {...register('email')} />
        {updateUser.isError && (
          <p role="alert" className="admin-form-error">
            {adminErrorMessage(updateUser.error, 'Không lưu được thay đổi')}
          </p>
        )}
        <div className="admin-user-detail__form-actions">
          <Button
            variant="ghost"
            size="sm"
            disabled={!isDirty || updateUser.isPending}
            onClick={() => {
              reset();
              updateUser.reset();
            }}
          >
            Hoàn tác
          </Button>
          <Button type="submit" size="sm" disabled={!isDirty} isLoading={updateUser.isPending}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </section>
  );
};
