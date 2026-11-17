import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Mail, Lock } from 'lucide-react';
import './css/AuthPages.css';

export const LoginPage: React.FC = () => {
  return (
    <Card className="auth-card">
      <div className="auth-card__header">
        <h2 className="auth-card__title">Đăng nhập</h2>
        <p className="auth-card__subtitle">
          Chào mừng bạn quay trở lại với TravelLako
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

        <Input
          label="Mật khẩu"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="auth-card__options">
          <label className="auth-card__remember">
            <input type="checkbox" className="rounded text-oceanBlue" />
            <span>Ghi nhớ đăng nhập</span>
          </label>
          <Link
            to="/forgot-password"
            className="auth-card__link"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button variant="primary" className="w-full" size="md">
          Đăng nhập
        </Button>
      </form>

      <div className="auth-card__footer">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="auth-card__link">
          Đăng ký ngay
        </Link>
      </div>
    </Card>
  );
};
