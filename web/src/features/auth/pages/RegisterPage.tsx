import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Mail, Lock, User } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  return (
    <Card className="p-8 shadow-lg border-borderGray">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900">Đăng ký tài khoản</h2>
        <p className="text-xs text-slate-500 mt-1.5">
          Tạo tài khoản để bắt đầu lên lịch trình du lịch thông minh
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <Input
          label="Họ và tên"
          type="text"
          placeholder="Nguyễn Văn A"
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <Input
          label="Địa chỉ Email (chỉ chấp nhận @gmail.com)"
          type="email"
          placeholder="yourname@gmail.com"
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Mật khẩu"
          type="password"
          placeholder="Tối thiểu 6 ký tự, 1 hoa, 1 thường, 1 số"
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <Button variant="primary" className="w-full" size="md">
          Đăng ký & Nhận mã OTP
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-borderGray text-center text-xs text-slate-500">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-oceanBlue font-bold hover:underline">
          Đăng nhập
        </Link>
      </div>
    </Card>
  );
};
