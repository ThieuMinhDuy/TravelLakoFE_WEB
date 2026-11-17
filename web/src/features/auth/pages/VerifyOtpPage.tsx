import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { KeyRound } from 'lucide-react';
import './css/AuthPages.css';

export const VerifyOtpPage: React.FC = () => {
  return (
    <Card className="auth-card" style={{ textAlign: 'center' }}>
      <div className="auth-card__icon-box">
        <KeyRound className="w-6 h-6" />
      </div>

      <h2 className="auth-card__title">Xác thực OTP</h2>
      <p className="auth-card__subtitle" style={{ marginBottom: '1.5rem' }}>
        Vui lòng nhập mã OTP 6 số đã được gửi tới email của bạn (hạn dùng 5 phút).
      </p>

      {/* 6-box OTP Placeholder */}
      <div className="auth-otp-inputs">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            type="text"
            maxLength={1}
            className="auth-otp-box"
          />
        ))}
      </div>

      <Button variant="primary" className="w-full" style={{ marginBottom: '1rem' }}>
        Xác thực tài khoản
      </Button>

      <p className="text-xs text-slate-500">
        Chưa nhận được mã?{' '}
        <button type="button" className="text-oceanBlue font-bold hover:underline bg-transparent border-none cursor-pointer">
          Gửi lại mã
        </button>
      </p>

      <div className="auth-card__footer">
        <Link to="/login" className="auth-card__back-link">
          ← Quay lại Đăng nhập
        </Link>
      </div>
    </Card>
  );
};
