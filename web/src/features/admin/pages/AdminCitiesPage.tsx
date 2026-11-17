import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { DataTable, Column } from '../../../components/compound/DataTable';
import { City } from '../../../types/city';
import { Plus } from 'lucide-react';
import './css/AdminPages.css';

export const AdminCitiesPage: React.FC = () => {
  const columns: Column<City>[] = [
    {
      key: 'name',
      header: 'Tên Thành phố',
      render: (city) => (
        <span className="font-bold text-slate-900">{city.name}</span>
      ),
    },
    {
      key: 'coordinates',
      header: 'Tọa độ GPS',
      render: (city) => (
        <span className="text-slate-500">
          {city.coordinates?.lat}, {city.coordinates?.lng}
        </span>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Quản lý Thành phố</h1>
          <p className="admin-page__subtitle">
            Danh mục các tỉnh thành hỗ trợ trên hệ thống TripMate
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          Thêm thành phố
        </Button>
      </div>

      <Card className="p-4 sm:p-6">
        <DataTable<City>
          columns={columns}
          data={[]}
          searchPlaceholder="Tìm kiếm thành phố..."
          emptyTitle="Chưa có thành phố nào"
          emptyDescription="Dữ liệu sẽ được tải từ API GET /api/admin/cities"
        />
      </Card>
    </div>
  );
};
