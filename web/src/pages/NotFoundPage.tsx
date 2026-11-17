import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <span className="font-extrabold text-7xl text-oceanBlue/30 select-none">404</span>
      <h2 className="text-2xl font-bold text-slate-900 mt-2">Trang không tồn tại</h2>
      <p className="text-xs text-slate-500 max-w-sm mt-2 mb-6">
        Đường dẫn bạn yêu cầu không tìm thấy hoặc đã được di chuyển sang địa chỉ khác.
      </p>
      <Link to="/">
        <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
          Trở về Trang chủ
        </Button>
      </Link>
    </div>
  );
};
