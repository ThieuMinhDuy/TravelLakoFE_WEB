import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { useAuthStore } from '../../../store/useAuthStore';
import { User, Mail, Phone, Calendar, Heart, MapPin, MessageSquare } from 'lucide-react';
import './css/ProfilePage.css';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="profile-page">
      {/* Page Header */}
      <div>
        <h1 className="profile-page__title">Hồ sơ cá nhân & Cài đặt</h1>
        <p className="profile-page__subtitle">
          Quản lý thông tin tài khoản, sở thích du lịch và cá nhân hóa trải nghiệm AI
        </p>
      </div>

      {/* User Stats Card */}
      <div className="profile-stats">
        <Card className="profile-stat-card">
          <div className="profile-stat-card__icon profile-stat-card__icon--blue">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="profile-stat-card__label">Chuyến đi đã tạo</p>
            <p className="profile-stat-card__value">{user?.stats?.trips || 0}</p>
          </div>
        </Card>

        <Card className="profile-stat-card">
          <div className="profile-stat-card__icon profile-stat-card__icon--amber">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="profile-stat-card__label">Địa điểm yêu thích</p>
            <p className="profile-stat-card__value">{user?.stats?.favorites || 0}</p>
          </div>
        </Card>

        <Card className="profile-stat-card">
          <div className="profile-stat-card__icon profile-stat-card__icon--teal">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="profile-stat-card__label">Đánh giá đã viết</p>
            <p className="profile-stat-card__value">{user?.stats?.reviews || 0}</p>
          </div>
        </Card>
      </div>

      {/* Profile Form Card */}
      <Card className="profile-form-card">
        <div className="profile-user-header">
          <div className="profile-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="profile-avatar__img" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div>
            <h3 className="profile-user-name">{user?.name || 'Tên người dùng'}</h3>
            <p className="profile-user-email">{user?.email || 'email@example.com'}</p>
            <Button variant="outline" size="sm" style={{ marginTop: '0.625rem' }}>
              Đổi ảnh đại diện
            </Button>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="profile-form">
          <div className="profile-form__grid">
            <Input
              label="Họ và tên"
              defaultValue={user?.name}
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Địa chỉ Email"
              defaultValue={user?.email}
              disabled
              leftIcon={<Mail className="w-4 h-4" />}
            />
          </div>

          <div className="profile-form__grid">
            <Input
              label="Số điện thoại"
              defaultValue={user?.phone}
              placeholder="0987654321"
              leftIcon={<Phone className="w-4 h-4" />}
            />
            <Input
              label="Ngày sinh"
              type="date"
              defaultValue={user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : ''}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
          </div>

          <div className="profile-form__actions">
            <Button variant="primary" size="md">
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
