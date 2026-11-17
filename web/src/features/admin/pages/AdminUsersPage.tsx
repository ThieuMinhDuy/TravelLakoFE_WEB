import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { DataTable, Column } from '../../../components/compound/DataTable';
import { Badge } from '../../../components/common/Badge';
import { User } from '../../../types/user';
import './css/AdminPages.css';

export const AdminUsersPage: React.FC = () => {
  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Người dùng',
      render: (u) => (
        <div className="admin-user-cell">
          <div className="admin-user-cell__avatar">
            {u.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="admin-user-cell__name">{u.name}</p>
            <p className="admin-user-cell__email">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Vai trò',
      render: (u) => (
        <Badge variant={u.isAdmin ? 'accent' : 'neutral'}>
          {u.isAdmin ? 'Admin' : 'Khách hàng'}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (u) => (
        <Badge variant={u.isBlocked ? 'danger' : 'success'}>
          {u.isBlocked ? 'Đang khóa' : 'Hoạt động'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: () => (
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm">
            Chi tiết
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Quản lý Người dùng</h1>
          <p className="admin-page__subtitle">
            Danh sách tất cả tài khoản trong hệ thống TravelLako
          </p>
        </div>
      </div>

      <Card className="p-4 sm:p-6">
        <DataTable<User>
          columns={columns}
          data={[]}
          searchPlaceholder="Tìm kiếm người dùng theo tên, email..."
          emptyTitle="Chưa có dữ liệu người dùng"
          emptyDescription="Dữ liệu sẽ được tải từ API GET /api/admin/users"
        />
      </Card>
    </div>
  );
};
