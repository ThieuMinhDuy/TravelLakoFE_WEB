import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { Menu, LogOut, Home } from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { toggleAdminSidebar } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-borderGray bg-surfaceWhite px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Sidebar Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleAdminSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Thu gọn / Mở rộng Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-xs font-semibold text-slate-400">Admin Portal</span>
          <span className="text-xs text-slate-300 mx-2">/</span>
          <span className="text-xs font-bold text-slate-800">Bảng điều khiển quản trị</span>
        </div>
      </div>

      {/* Right: Quick actions & Profile */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-borderGray"
        >
          <Home className="w-4 h-4 text-slate-500" />
          <span>Về trang chủ</span>
        </Link>

        {user && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-borderGray">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-oceanBlue text-white flex items-center justify-center text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
              <p className="text-[10px] text-amber-600 font-semibold leading-tight">Quản trị viên</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors ml-1"
          title="Đăng xuất"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
