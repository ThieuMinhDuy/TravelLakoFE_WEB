import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { StatusView } from '../components/common/StatusView';
import { buttonVariants } from '../components/common/buttonVariants';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const NotFoundPage: React.FC = () => {
  useDocumentTitle('Không tìm thấy trang');

  return (
    <StatusView
      code="404"
      title="Trang không tồn tại"
      description="Đường dẫn bạn yêu cầu không tìm thấy hoặc đã được di chuyển sang địa chỉ khác."
      actions={
        <Link to="/" className={buttonVariants({ variant: 'primary', size: 'md' })}>
          <Home className="w-4 h-4" />
          Trở về Trang chủ
        </Link>
      }
    />
  );
};
