import React from 'react';
import { ConfirmDialog } from '../../../../components/compound/ConfirmDialog';
import { useToast } from '../../../../contexts/toast/ToastContext';
import type { AdminUpdateUserDTO, AdminUser } from '../../../../types/admin';
import { useDeleteUser, useUpdateUser } from '../../hooks/useAdminMutations';
import { adminErrorMessage } from '../../utils/adminErrors';

export type UserActionKind = 'block' | 'unblock' | 'grant' | 'revoke' | 'delete';

export interface UserAction {
  kind: UserActionKind;
  user: AdminUser;
}

interface ActionCopy {
  title: string;
  message: (u: AdminUser) => React.ReactNode;
  confirmText: string;
  success: string;
  variant: 'danger' | 'primary' | 'accent';
  body?: AdminUpdateUserDTO;
}

const who = (u: AdminUser) => (
  <>
    <strong>{u.name}</strong> ({u.email})
  </>
);

const COPY: Record<UserActionKind, ActionCopy> = {
  block: {
    title: 'Khóa tài khoản?',
    message: (u) => <>{who(u)} sẽ không thể đăng nhập và bị đăng xuất ở lần thao tác kế tiếp, cho tới khi được mở khóa.</>,
    confirmText: 'Khóa tài khoản',
    success: 'Đã khóa tài khoản',
    variant: 'danger',
    body: { isBlocked: true },
  },
  unblock: {
    title: 'Mở khóa tài khoản?',
    message: (u) => <>{who(u)} sẽ đăng nhập và sử dụng TripMate bình thường trở lại.</>,
    confirmText: 'Mở khóa',
    success: 'Đã mở khóa tài khoản',
    variant: 'primary',
    body: { isBlocked: false },
  },
  grant: {
    title: 'Cấp quyền quản trị?',
    message: (u) => (
      <>{who(u)} sẽ truy cập được toàn bộ trang quản trị, gồm khóa / xóa tài khoản và xóa dữ liệu địa điểm.</>
    ),
    confirmText: 'Cấp quyền Admin',
    success: 'Đã cấp quyền quản trị',
    variant: 'accent',
    body: { isAdmin: true },
  },
  revoke: {
    title: 'Gỡ quyền quản trị?',
    message: (u) => <>{who(u)} sẽ trở thành người dùng thường và mất quyền vào trang quản trị.</>,
    confirmText: 'Gỡ quyền',
    success: 'Đã gỡ quyền quản trị',
    variant: 'accent',
    body: { isAdmin: false },
  },
  delete: {
    title: 'Xóa vĩnh viễn tài khoản?',
    message: (u) => <>Bạn sắp xóa {who(u)}. Thao tác này không thể hoàn tác.</>,
    confirmText: 'Xóa vĩnh viễn',
    success: 'Đã xóa tài khoản',
    variant: 'danger',
  },
};

interface UserActionDialogProps {
  action: UserAction | null;
  onClose: () => void;
  /** Gọi sau khi xóa thành công (vd: đóng drawer chi tiết của user đó) */
  onDeleted?: (userId: string) => void;
}

/** Hộp xác nhận cho mọi thao tác trên một user; tự gọi API và báo kết quả */
export const UserActionDialog: React.FC<UserActionDialogProps> = ({ action, onClose, onDeleted }) => {
  const toast = useToast();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const isPending = updateUser.isPending || deleteUser.isPending;

  if (!action) return <ConfirmDialog isOpen={false} onClose={onClose} onConfirm={onClose} title="" message="" />;

  const { kind, user } = action;
  const copy = COPY[kind];

  const onError = (error: unknown) => toast.error(adminErrorMessage(error, 'Thao tác thất bại'));
  const onSuccess = () => {
    toast.success(copy.success, { description: user.email });
    onClose();
  };

  const confirm = () => {
    if (kind === 'delete') {
      deleteUser.mutate(user._id, {
        onSuccess: () => {
          onDeleted?.(user._id);
          onSuccess();
        },
        onError,
      });
    } else if (copy.body) {
      updateUser.mutate({ id: user._id, body: copy.body }, { onSuccess, onError });
    }
  };

  return (
    <ConfirmDialog
      isOpen
      onClose={isPending ? () => undefined : onClose}
      onConfirm={confirm}
      title={copy.title}
      message={copy.message(user)}
      confirmText={copy.confirmText}
      variant={copy.variant}
      isLoading={isPending}
      requireText={kind === 'delete' ? user.email : undefined}
    >
      {kind === 'delete' && (
        <ul className="admin-consequences">
          <li>Xóa toàn bộ chuyến đi, danh sách yêu thích và đánh giá của người này.</li>
          <li>Điểm đánh giá của các địa điểm liên quan sẽ được tính lại.</li>
        </ul>
      )}
    </ConfirmDialog>
  );
};
