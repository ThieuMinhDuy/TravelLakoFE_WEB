import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Mail, Lock } from 'lucide-react';

export const LoginPage: React.FC = () => {
  return (
    <Card className="p-8 shadow-lg border-borderGray">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900">Đăng nhập</h2>
        <p className="text-xs text-slate-500 mt-1.5">
          Chào mừng bạn quay trở lại với TravelLako
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <Input
          label="Địa chỉ Email"
          type="email"
          placeholder="yourname@gmail.com"
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600">
            <input type="checkbox" className="rounded text-oceanBlue" />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-oceanBlue font-semibold hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button variant="primary" className="w-full" size="md">
          Đăng nhập
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-borderGray text-center text-xs text-slate-500">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-oceanBlue font-bold hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </Card>
  );
};
