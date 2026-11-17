import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Compass, Sparkles, Map, Shield } from 'lucide-react';
import './css/HomePage.css';

export const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      {/* Hero Welcome Section with Scenic Landscape Banner */}
      <section className="home-hero">
        <div className="home-hero__badge">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Base Code Architecture Ready</span>
        </div>

        <h1 className="home-hero__title">
          Nền tảng Lập kế hoạch Du lịch Thông minh{' '}
          <span className="home-hero__title-highlight">TripMate</span>
        </h1>

        <p className="home-hero__script">
          Tận hưởng chuyến đi theo cách tuyệt vời nhất!
        </p>

        <p className="home-hero__description">
          Base code của dự án đã sẵn sàng với hạ tầng Axios Client kết nối 100% với TripMate Backend,
          hệ thống phân quyền RBAC, Zustand state store và bộ UI components chuẩn Figma.
        </p>

        <div className="home-hero__actions">
          <Link to="/login">
            <Button variant="accent" size="lg">
              Đăng nhập / Đăng ký
            </Button>
          </Link>
          <Link to="/profile">
            <Button
              variant="outline"
              size="lg"
              style={{
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.4)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
              }}
            >
              Hồ sơ cá nhân
            </Button>
          </Link>
          <Link to="/admin">
            <Button variant="primary" size="lg" leftIcon={<Shield className="w-4 h-4" />}>
              Cổng Quản trị Admin
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <div className="home-container">
        <section className="home-features">
          <Card hoverable>
            <div className="home-feature__icon-box home-feature__icon-box--blue">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="home-feature__title">Chuẩn hóa 100% Backend</h3>
            <p className="home-feature__desc">
              Kết nối trọn vẹn với các API của TripMate Backend (Auth OTP, Profile thống kê, Admin Dashboard, OSM Import).
            </p>
          </Card>

          <Card hoverable>
            <div className="home-feature__icon-box home-feature__icon-box--amber">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="home-feature__title">Design System Figma</h3>
            <p className="home-feature__desc">
              Bộ font Open Sans (96%), Caveat script, bảng màu Modern Natural Travel và bố cục Split-screen.
            </p>
          </Card>

          <Card hoverable>
            <div className="home-feature__icon-box home-feature__icon-box--teal">
              <Map className="w-5 h-5" />
            </div>
            <h3 className="home-feature__title">Hạ tầng Mở rộng</h3>
            <p className="home-feature__desc">
              Sẵn sàng mở rộng cho các tính năng tiếp theo: Leaflet Map, kéo thả Timeline dnd và Chatbot AI.
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
};
