import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Mail } from 'lucide-react';
import './css/AuthPages.css';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <Card className="auth-card">
      <div className="auth-card__header">
        <h2 className="auth-card__title">Quên mật khẩu</h2>
        <p className="auth-card__subtitle">
          Nhập địa chỉ email đăng ký để nhận mã OTP đặt lại mật khẩu
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="auth-card__form">
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

      <div className="auth-card__footer">
        <Link to="/login" className="auth-card__back-link">
          ← Quay lại Đăng nhập
        </Link>
      </div>
    </Card>
  );
};
