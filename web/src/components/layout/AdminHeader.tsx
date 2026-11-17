import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { Menu, LogOut, Home } from 'lucide-react';
import './css/AdminHeader.css';

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { toggleAdminSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="admin-header">
      {/* Left: Sidebar Toggle & Page Title */}
      <div className="admin-header__left">
        <button
          onClick={toggleAdminSidebar}
          className="admin-header__toggle-btn"
          title="Thu gọn / Mở rộng Sidebar"
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
          onClick={handleLogout}
          className="admin-header__logout-btn"
          title="Đăng xuất"
          type="button"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
