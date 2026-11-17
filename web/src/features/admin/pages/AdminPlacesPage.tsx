import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { DataTable, Column } from '../../../components/compound/DataTable';
import { PlaceUnion, PlaceType } from '../../../types/place';
import { Plus } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quản lý Địa điểm Du lịch</h1>
          <p className="text-xs text-slate-500 mt-1">
            Quản trị 4 loại hình địa điểm du lịch theo thành phố
          </p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
          Thêm địa điểm mới
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-borderGray gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveType(tab.type)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeType === tab.type
                ? 'border-oceanBlue text-oceanBlue'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
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
