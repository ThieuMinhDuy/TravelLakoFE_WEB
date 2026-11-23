import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home, LogOut, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useLogout } from '../../features/auth/hooks/useLogout';
import { findAdminNavItem } from '../../features/admin/config/adminNav';
import { Avatar } from '../common/Avatar';
import './css/AdminHeader.css';

interface AdminHeaderProps {
  /** Nút ☰: thu gọn sidebar (desktop) hoặc mở drawer menu (màn nhỏ) — do AdminLayout quyết định */
  onMenuClick: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const { pathname } = useLocation();
  const current = findAdminNavItem(pathname);

  return (
    <header className="admin-header glass glass--lens">
      <div className="admin-header__left">
        <button
          type="button"
          onClick={onMenuClick}
          className="admin-header__icon-btn"
          aria-label="Mở / thu gọn menu quản trị"
          title="Menu quản trị"
        >
          <Menu aria-hidden="true" />
        </button>

        <nav aria-label="Breadcrumb" className="admin-header__breadcrumb">
          <ol>
            <li>
              <Link to="/admin" className="admin-header__crumb-link">
                Quản trị
              </Link>
            </li>
            {current && (
              <li aria-current="page" className="admin-header__crumb-current">
                <ChevronRight aria-hidden="true" />
                {current.title}
              </li>
            )}
          </ol>
        </nav>
      </div>

      <div className="admin-header__right">
        <Link to="/" className="admin-header__home">
          <Home aria-hidden="true" />
          <span>Trang chủ</span>
        </Link>

        {user && (
          <div className="admin-header__user">
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <span className="admin-header__user-text">
              <span className="admin-header__user-name">{user.name}</span>
              <span className="admin-header__user-role">Quản trị viên</span>
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          className="admin-header__icon-btn admin-header__icon-btn--danger"
          aria-label="Đăng xuất"
          title="Đăng xuất"
        >
          <LogOut aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};
