import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Mail } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <Card className="p-8 shadow-lg border-borderGray">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900">Quên mật khẩu</h2>
        <p className="text-xs text-slate-500 mt-1.5">
          Nhập địa chỉ email đăng ký để nhận mã OTP đặt lại mật khẩu
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

        <Button variant="primary" className="w-full" size="md">
          Gửi mã OTP xác nhận
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
