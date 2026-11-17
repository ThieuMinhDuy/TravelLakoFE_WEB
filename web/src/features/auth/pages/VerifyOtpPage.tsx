import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { KeyRound } from 'lucide-react';

export const VerifyOtpPage: React.FC = () => {
  return (
    <Card className="p-8 shadow-lg border-borderGray text-center">
      <div className="w-12 h-12 rounded-full bg-sky-50 text-oceanBlue flex items-center justify-center mx-auto mb-4">
        <KeyRound className="w-6 h-6" />
      </div>

      <h2 className="text-2xl font-extrabold text-slate-900">Xác thực OTP</h2>
      <p className="text-xs text-slate-500 mt-1.5 mb-6">
        Vui lòng nhập mã OTP 6 số đã được gửi tới email của bạn (hạn dùng 5 phút).
      </p>

      {/* 6-box OTP Placeholder */}
      <div className="flex justify-center gap-2 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            type="text"
            maxLength={1}
            className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-borderGray bg-surfaceWhite focus:border-oceanBlue focus:ring-2 focus:ring-oceanBlue/20 outline-none transition-all"
          />
        ))}
      </div>

      <Button variant="primary" className="w-full mb-4">
        Xác thực tài khoản
      </Button>

      <p className="text-xs text-slate-500">
        Chưa nhận được mã?{' '}
        <button className="text-oceanBlue font-bold hover:underline">Gửi lại mã</button>
      </p>

      <div className="mt-6 pt-6 border-t border-borderGray">
        <Link to="/login" className="text-xs text-slate-500 hover:text-slate-800 font-medium">
          ← Quay lại Đăng nhập
        </Link>
      </div>
    </Card>
  );
};
