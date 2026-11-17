import React from 'react';
import { Card } from '../../../components/common/Card';
import { Users, MapPin, Compass, MessageSquare } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Tổng quan Quản trị (Dashboard)</h1>
        <p className="text-xs text-slate-500 mt-1">
          Số liệu thống kê thời gian thực từ hệ thống TravelLakoBE
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-oceanBlue flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng Người dùng</p>
            <p className="text-2xl font-extrabold text-slate-900">--</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng Chuyến đi</p>
            <p className="text-2xl font-extrabold text-slate-900">--</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Tổng Địa điểm</p>
            <p className="text-2xl font-extrabold text-slate-900">--</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Đánh giá & Review</p>
            <p className="text-2xl font-extrabold text-slate-900">--</p>
          </div>
        </Card>
      </div>

      {/* Analytics Placeholder */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Phân bố Địa điểm Du lịch</h3>
        <p className="text-xs text-slate-500 mb-6">
          Biểu đồ hiển thị cơ cấu phân bổ giữa Điểm tham quan, Khách sạn, Nhà hàng và Quán cafe.
        </p>
        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-borderGray text-xs text-slate-400">
          Khu vực hiển thị Biểu đồ Recharts (Sẵn sàng kết nối GET /api/admin/dashboard/stats)
        </div>
      </Card>
    </div>
  );
};
