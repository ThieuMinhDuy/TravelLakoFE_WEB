import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../common/Button';
import {
  Compass,
  MapPin,
  BookOpen,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import logoImg from '../../assets/logo.webp';

export const MainHeader: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-borderGray bg-surfaceWhite/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logoImg} alt="TravelLako" className="h-10 w-auto object-contain" />
          <span className="font-extrabold text-xl tracking-tight text-slate-900 hidden sm:inline">
            Travel<span className="text-oceanBlue">Lako</span>
          </span>
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/places"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-oceanBlue transition-colors"
          >
            <Compass className="w-4 h-4" />
            Khám phá điểm đến
          </Link>
          <Link
            to="/trips"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-oceanBlue transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Chuyến đi của tôi
          </Link>
          <Link
            to="/blog"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-oceanBlue transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Cẩm nang du lịch
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-borderGray hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-oceanBlue text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate hidden sm:inline">
                  {user.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surfaceWhite shadow-xl border border-borderGray p-1.5 z-50 animate-scale-up">
                  <div className="px-3 py-2 border-b border-borderGray/60 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    Hồ sơ cá nhân & Sở thích
                  </Link>

                  {user.isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      Trang Quản trị (Admin)
                    </Link>
                  )}

                  <div className="my-1 border-t border-borderGray/60" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Đăng nhập
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
