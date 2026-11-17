import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { DataTable, Column } from '../../../components/compound/DataTable';
import { Badge } from '../../../components/common/Badge';
import { User } from '../../../types/user';

export const AdminUsersPage: React.FC = () => {
  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Người dùng',
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
            {u.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{u.name}</p>
            <p className="text-[11px] text-slate-400">{u.email}</p>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản lý Người dùng</h1>
          <p className="text-xs text-slate-500 mt-1">
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
