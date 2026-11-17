import React from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { useAuthStore } from '../../../store/useAuthStore';
import { User, Mail, Phone, Calendar, Heart, MapPin, MessageSquare } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Hồ sơ cá nhân & Cài đặt</h1>
        <p className="text-xs text-slate-500 mt-1">
          Quản lý thông tin tài khoản, sở thích du lịch và cá nhân hóa trải nghiệm AI
        </p>
      </div>

      {/* User Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-oceanBlue flex items-center justify-center font-bold">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Chuyến đi đã tạo</p>
            <p className="text-xl font-extrabold text-slate-900">{user?.stats?.trips || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Địa điểm yêu thích</p>
            <p className="text-xl font-extrabold text-slate-900">{user?.stats?.favorites || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Đánh giá đã viết</p>
            <p className="text-xl font-extrabold text-slate-900">{user?.stats?.reviews || 0}</p>
          </div>
        </Card>
      </div>

      {/* Profile Form Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-borderGray">
          <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-borderGray flex items-center justify-center text-slate-400 font-extrabold text-2xl overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{user?.name || 'Tên người dùng'}</h3>
            <p className="text-xs text-slate-500">{user?.email || 'email@example.com'}</p>
            <Button variant="outline" size="sm" className="mt-2.5">
              Đổi ảnh đại diện
            </Button>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div className="pt-4 flex justify-end">
            <Button variant="primary" size="md">
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
