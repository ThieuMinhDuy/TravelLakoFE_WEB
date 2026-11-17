import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Mail, Lock, User } from 'lucide-react';
import './css/AuthPages.css';

export const RegisterPage: React.FC = () => {
  return (
    <Card className="auth-card">
      <div className="auth-card__header">
        <h2 className="auth-card__title">Đăng ký tài khoản</h2>
        <p className="auth-card__subtitle">
          Tạo tài khoản để bắt đầu lên lịch trình du lịch thông minh
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="auth-card__form">
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

      <div className="auth-card__footer">
        Đã có tài khoản?{' '}
        <Link to="/login" className="auth-card__link">
          Đăng nhập
        </Link>
      </div>
    </Card>
  );
};
