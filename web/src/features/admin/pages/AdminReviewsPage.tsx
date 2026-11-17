import React from 'react';
import { Card } from '../../../components/common/Card';
import { DataTable, Column } from '../../../components/compound/DataTable';
import { Review } from '../../../types/review';

export const AdminReviewsPage: React.FC = () => {
  const columns: Column<Review>[] = [
    {
      key: 'user',
      header: 'Người đánh giá',
      render: (r) => (
        <span className="font-semibold text-slate-800">
          {typeof r.user === 'object' && r.user !== null ? r.user.name : String(r.user)}
        </span>
      ),
    },
    {
      key: 'rating',
      header: 'Số sao',
      render: (r) => <span className="font-bold text-amber-500">⭐ {r.rating} / 5</span>,
    },
    {
      key: 'comment',
      header: 'Bình luận',
      render: (r) => <span className="text-slate-600 line-clamp-2">{r.comment || '--'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Kiểm duyệt Đánh giá</h1>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi và kiểm duyệt các đánh giá của người dùng từ API GET /api/admin/reviews
        </p>
      </div>

      <Card className="p-4 sm:p-6">
        <DataTable<Review>
          columns={columns}
          data={[]}
          searchPlaceholder="Tìm kiếm đánh giá..."
          emptyTitle="Chưa có đánh giá nào"
          emptyDescription="Dữ liệu sẽ được tải từ API GET /api/admin/reviews"
        />
      </Card>
    </div>
  );
};
