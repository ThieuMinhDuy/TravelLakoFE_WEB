import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home } from 'lucide-react';
import './css/NotFoundPage.css';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-page">
      <span className="not-found-page__code">404</span>
      <h2 className="not-found-page__title">Trang không tồn tại</h2>
      <p className="not-found-page__desc">
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
