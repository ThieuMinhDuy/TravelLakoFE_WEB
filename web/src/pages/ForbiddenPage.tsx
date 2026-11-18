import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { StatusView } from '../components/common/StatusView';
import { buttonVariants } from '../components/common/buttonVariants';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/**
 * 403 — đã đăng nhập nhưng không đủ quyền (vd: tài khoản thường vào /admin).
 * Giữ nguyên URL để người dùng biết mình đã truy cập trang nào.
 */
export const ForbiddenPage: React.FC = () => {
  useDocumentTitle('Không có quyền truy cập');

  return (
    <StatusView
      code="403"
      title="Bạn không có quyền truy cập"
      description="Trang này chỉ dành cho Quản trị viên. Nếu bạn cho rằng đây là nhầm lẫn, hãy liên hệ quản trị viên hệ thống."
      actions={
        <Link to="/" className={buttonVariants({ variant: 'primary', size: 'md' })}>
          <Home className="w-4 h-4" />
          Trở về Trang chủ
        </Link>
      }
    />
  );
};
