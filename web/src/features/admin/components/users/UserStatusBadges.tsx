import React from 'react';
import { Badge } from '../../../../components/common/Badge';
import type { AdminUser } from '../../../../types/admin';

/** Vai trò + trạng thái — chỉ trạng thái cần chú ý (khóa, chưa xác thực) mới có màu */
export const UserStatusBadges: React.FC<{ user: AdminUser; isSelf?: boolean }> = ({ user, isSelf }) => (
  <span className="admin-badges">
    {user.isAdmin && (
      <Badge variant="primary" size="sm">
        Admin
      </Badge>
    )}
    {isSelf && (
      <Badge variant="neutral" size="sm">
        Bạn
      </Badge>
    )}
    {user.isBlocked && (
      <Badge variant="danger" size="sm">
        Đã khóa
      </Badge>
    )}
    {!user.isVerified && (
      <Badge variant="warning" size="sm">
        Chưa xác thực
      </Badge>
    )}
  </span>
);
