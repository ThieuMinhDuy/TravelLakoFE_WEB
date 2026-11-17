import React from 'react';
import { Card } from '../../../components/common/Card';
import { Users, MapPin, Compass, MessageSquare } from 'lucide-react';
import './css/AdminPages.css';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="admin-page">
      <div>
        <h1 className="admin-page__title">Tổng quan Quản trị (Dashboard)</h1>
        <p className="admin-page__subtitle">
          Số liệu thống kê thời gian thực từ hệ thống TripMate Backend
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="admin-stats-grid">
        <Card className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--blue">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="admin-stat-card__label">Tổng Người dùng</p>
            <p className="admin-stat-card__value">--</p>
          </div>
        </Card>

        <Card className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--amber">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="admin-stat-card__label">Tổng Chuyến đi</p>
            <p className="admin-stat-card__value">--</p>
          </div>
        </Card>

        <Card className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--teal">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="admin-stat-card__label">Tổng Địa điểm</p>
            <p className="admin-stat-card__value">--</p>
          </div>
        </Card>

        <Card className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--purple">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="admin-stat-card__label">Đánh giá & Review</p>
            <p className="admin-stat-card__value">--</p>
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
