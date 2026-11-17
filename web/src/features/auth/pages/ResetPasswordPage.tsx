import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Lock, KeyRound } from 'lucide-react';
import './css/AuthPages.css';

export const ResetPasswordPage: React.FC = () => {
  return (
    <Card className="auth-card">
      <div className="auth-card__header">
        <h2 className="auth-card__title">Đặt lại mật khẩu</h2>
        <p className="auth-card__subtitle">
          Nhập mã OTP và thiết lập mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="auth-card__form">
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

      <div className="auth-card__footer">
        <Link to="/login" className="auth-card__back-link">
          ← Quay lại Đăng nhập
        </Link>
      </div>
    </Card>
  );
};
