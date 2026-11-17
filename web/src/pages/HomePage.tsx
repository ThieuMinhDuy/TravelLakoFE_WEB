import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Compass, Sparkles, Map, Shield } from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-16 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Welcome Section */}
      <section className="text-center space-y-6 pt-8 pb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 text-oceanBlue text-xs font-semibold border border-sky-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Base Code Architecture Ready</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Nền tảng Lập kế hoạch Du lịch Thông minh{' '}
          <span className="text-oceanBlue block sm:inline">TravelLako</span>
        </h1>

        <p className="font-script text-2xl sm:text-3xl text-amber-600">
          Tận hưởng chuyến đi theo cách tuyệt vời nhất!
        </p>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Base code của dự án đã sẵn sàng với hạ tầng Axios Client kết nối 100% với TravelLakoBE,
          hệ thống phân quyền RBAC, Zustand state store và bộ UI components chuẩn Figma.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link to="/login">
            <Button variant="primary" size="lg">
              Đăng nhập / Đăng ký
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" size="lg">
              Hồ sơ cá nhân
            </Button>
          </Link>
          <Link to="/admin">
            <Button variant="accent" size="lg" leftIcon={<Shield className="w-4 h-4" />}>
              Cổng Quản trị Admin
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverable className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-oceanBlue flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Chuẩn hóa 100% Backend</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Kết nối trọn vẹn với các API của TravelLakoBE (Auth OTP, Profile thống kê, Admin Dashboard, OSM Import).
          </p>
        </Card>

        <Card hoverable className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Design System Figma</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bộ font Open Sans (96%), Caveat script, bảng màu Modern Natural Travel và bố cục Split-screen.
          </p>
        </Card>

        <Card hoverable className="space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Map className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Hạ tầng Mở rộng</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sẵn sàng mở rộng cho các tính năng tiếp theo: Leaflet Map, kéo thả Timeline dnd và Chatbot AI.
          </p>
        </Card>
      </section>
    </div>
  );
};
