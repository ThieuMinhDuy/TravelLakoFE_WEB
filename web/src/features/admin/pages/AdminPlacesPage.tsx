import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { DataTable, Column } from '../../../components/compound/DataTable';
import { PlaceUnion, PlaceType } from '../../../types/place';
import { Plus } from 'lucide-react';
import './css/AdminPages.css';

export const AdminPlacesPage: React.FC = () => {
  const [activeType, setActiveType] = useState<PlaceType>('attraction');

  const tabs: { type: PlaceType; label: string }[] = [
    { type: 'attraction', label: 'Điểm tham quan' },
    { type: 'hotel', label: 'Khách sạn' },
    { type: 'restaurant', label: 'Nhà hàng' },
    { type: 'cafe', label: 'Quán Cafe' },
  ];

  const columns: Column<PlaceUnion>[] = [
    {
      key: 'name',
      header: 'Tên địa điểm',
      render: (p) => <span className="font-bold text-slate-900">{p.name}</span>,
    },
    {
      key: 'address',
      header: 'Địa chỉ',
      render: (p) => <span className="text-slate-500">{p.address || '--'}</span>,
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Quản lý Địa điểm Du lịch</h1>
          <p className="admin-page__subtitle">
            Quản trị 4 loại hình địa điểm du lịch theo thành phố
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          Thêm địa điểm mới
        </Button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            type="button"
            onClick={() => setActiveType(tab.type)}
            className={`admin-tab ${activeType === tab.type ? 'admin-tab--active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card className="p-4 sm:p-6">
        <DataTable<PlaceUnion>
          columns={columns}
          data={[]}
          searchPlaceholder="Tìm kiếm địa điểm..."
          emptyTitle="Chưa có địa điểm nào"
          emptyDescription={`Dữ liệu sẽ được tải từ API GET /api/admin/places/${activeType}`}
        />
      </Card>
    </div>
  );
};
