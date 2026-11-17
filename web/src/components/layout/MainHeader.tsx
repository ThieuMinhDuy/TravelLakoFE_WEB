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
import './css/MainHeader.css';

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
    <header className="main-header">
      <div className="main-header__container">
        {/* Logo */}
        <Link to="/" className="main-header__brand-link">
          <img src={logoImg} alt="TravelLako" className="main-header__brand-logo" />
          <span className="main-header__brand-title">
            Travel<span className="main-header__brand-highlight">Lako</span>
          </span>
        </Link>

        {/* Navigation Menu */}
        <nav className="main-header__nav">
          <Link to="/places" className="main-header__nav-link">
            <Compass className="main-header__nav-icon" />
            Khám phá điểm đến
          </Link>
          <Link to="/trips" className="main-header__nav-link">
            <MapPin className="main-header__nav-icon" />
            Chuyến đi của tôi
          </Link>
          <Link to="/blog" className="main-header__nav-link">
            <BookOpen className="main-header__nav-icon" />
            Cẩm nang du lịch
          </Link>
        </nav>

        {/* User Actions */}
        <div className="main-header__actions">
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="main-header__user-btn"
                type="button"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="main-header__user-avatar"
                  />
                ) : (
                  <div className="main-header__user-avatar-fallback">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="main-header__user-name">
                  {user.name}
                </span>
                <ChevronDown className="main-header__user-chevron" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="main-header__dropdown">
                  <div className="main-header__dropdown-header">
                    <p className="main-header__dropdown-title">{user.name}</p>
                    <p className="main-header__dropdown-email">{user.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="main-header__dropdown-item"
                  >
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    Hồ sơ cá nhân & Sở thích
                  </Link>

                  {user.isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="main-header__dropdown-item main-header__dropdown-item--admin"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      Trang Quản trị (Admin)
                    </Link>
                  )}

                  <div className="main-header__dropdown-divider" />

                  <button
                    onClick={handleLogout}
                    className="main-header__dropdown-item main-header__dropdown-item--logout"
                    type="button"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="main-header__guest-actions">
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
