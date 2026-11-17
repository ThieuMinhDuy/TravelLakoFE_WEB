import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Lock, KeyRound } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  return (
    <Card className="p-8 shadow-lg border-borderGray">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900">Đặt lại mật khẩu</h2>
        <p className="text-xs text-slate-500 mt-1.5">
          Nhập mã OTP và thiết lập mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <Input
          label="Mã xác thực OTP (6 chữ số)"
          type="text"
          placeholder="123456"
          leftIcon={<KeyRound className="w-4 h-4" />}
          required
        />

        <Input
          label="Mật khẩu mới"
          type="password"
          placeholder="Tối thiểu 6 ký tự, 1 hoa, 1 thường, 1 số"
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <Button variant="primary" className="w-full" size="md">
          Lưu mật khẩu mới
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-borderGray text-center">
        <Link to="/login" className="text-xs text-slate-500 hover:text-slate-800 font-medium">
          ← Quay lại Đăng nhập
        </Link>
      </div>
    </Card>
  );
};
