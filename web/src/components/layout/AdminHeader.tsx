import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useLogout } from '../../features/auth/hooks/useLogout';
import { Menu, LogOut, Home } from 'lucide-react';
import './css/AdminHeader.css';

interface AdminHeaderProps {
  /** Nút ☰: thu gọn sidebar (desktop) hoặc mở drawer menu (màn nhỏ) — do AdminLayout quyết định */
  onMenuClick: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuthStore();
  const logout = useLogout();

  return (
    <header className="admin-header">
      {/* Left: Sidebar Toggle & Page Title */}
      <div className="admin-header__left">
        <button
          onClick={onMenuClick}
          className="admin-header__toggle-btn"
          title="Menu quản trị"
          aria-label="Mở / thu gọn menu quản trị"
          type="button"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="admin-header__breadcrumb">
          <span className="admin-header__breadcrumb-parent">Admin Portal</span>
          <span className="admin-header__breadcrumb-separator">/</span>
          <span className="admin-header__breadcrumb-current">Bảng điều khiển quản trị</span>
        </div>
      </div>

      {/* Right: Quick actions & Profile */}
      <div className="admin-header__right">
        <Link to="/" className="admin-header__home-link">
          <Home className="w-4 h-4 text-slate-500" />
          <span>Về trang chủ</span>
        </Link>

        {user && (
          <div className="admin-header__user">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="admin-header__avatar"
              />
            ) : (
              <div className="admin-header__avatar-fallback">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="admin-header__user-info">
              <p className="admin-header__user-name">{user.name}</p>
              <p className="admin-header__user-role">Quản trị viên</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="admin-header__logout-btn"
          title="Đăng xuất"
          aria-label="Đăng xuất"
          type="button"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
