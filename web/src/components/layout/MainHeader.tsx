import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { cn } from '../../utils/cn';
import { toast } from 'sonner';
import {
  Search,
  X,
  Heart,
  User as UserIcon,
  Compass,
  LogOut,
  ShieldAlert,
  ChevronDown,
} from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { OpenAuthLink } from '../../features/auth/components/OpenAuthLink';
import './css/MainHeader.css';

export const MainHeader: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  // Lắng nghe scroll để áp dụng background glass khi cuộn
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Xử lý submit tìm kiếm Global
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/cities?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Xóa nhanh text tìm kiếm
  const handleClearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    toast.success('Đã đăng xuất. Hẹn gặp lại bạn!');
    navigate('/');
  };

  const isTransparent = isHome && !isScrolled;
  const isAdmin = user?.isAdmin || (user as { role?: string })?.role === 'admin';

  return (
    <header
      className={cn(
        'main-header',
        isTransparent ? 'main-header--transparent' : 'main-header--scrolled'
      )}
    >
      <div className="main-header__container">
        {/* ==================================================================
            1. BÊN TRÁI: Logo thương hiệu
            ================================================================== */}
        <div className="main-header__left">
          <Link to="/" className="main-header__brand-link">
            <img src={logoImg} alt="TripMate" className="main-header__brand-logo" />
            <span className="main-header__brand-title">
              Trip<span className="main-header__brand-highlight">Mate</span>
            </span>
          </Link>
        </div>

        {/* ==================================================================
            2. Ở GIỮA: Navigation Links
            - Điểm đến (/cities)
            - Lịch trình (/trips)
            - Nhật ký (/diary)
            ================================================================== */}
        <div className="main-header__center">
          <nav className="main-header__nav">
            <NavLink
              to="/cities"
              className={({ isActive }) =>
                cn('main-header__nav-link', isActive && 'main-header__nav-link--active')
              }
            >
              Điểm đến
            </NavLink>

            <NavLink
              to="/trips"
              className={({ isActive }) =>
                cn('main-header__nav-link', isActive && 'main-header__nav-link--active')
              }
            >
              Lịch trình
            </NavLink>

            <NavLink
              to="/diary"
              className={({ isActive }) =>
                cn('main-header__nav-link', isActive && 'main-header__nav-link--active')
              }
            >
              Nhật ký
            </NavLink>
          </nav>
        </div>

        {/* ==================================================================
            3. BÊN PHẢI: Actions & User Controls
            - Global Search với nút xóa nhanh
            - Yêu thích (/favorites - chỉ hiện khi đăng nhập)
            - Auth State: Guest (Đăng nhập / Đăng ký) hoặc Authenticated Dropdown
            ================================================================== */}
        <div className="main-header__right">
          {/* Thanh tìm kiếm (Global Search) */}
          <form onSubmit={handleSearchSubmit} className="main-header__search-form">
            <div className="main-header__search-wrapper">
              <button
                type="submit"
                className="main-header__search-icon-btn"
                title="Tìm kiếm"
              >
                <Search className="w-4 h-4" />
              </button>

              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm điểm đến..."
                className="main-header__search-input"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="main-header__search-clear-btn"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </form>

          {/* Nút Yêu thích (/favorites) - Chỉ hiển thị khi đã đăng nhập */}
          {isAuthenticated && user && (
            <Link
              to="/favorites"
              className="main-header__fav-link"
              title="Địa điểm đã lưu (Yêu thích)"
            >
              <Heart className="w-4 h-4 fill-current text-white/90 hover:text-red-400" />
              {user.stats && user.stats.favorites > 0 && (
                <span className="main-header__fav-badge">
                  {user.stats.favorites > 99 ? '99+' : user.stats.favorites}
                </span>
              )}
            </Link>
          )}

          {/* Khu vực Tài khoản (Auth State) */}
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="main-header__user-btn"
                type="button"
                aria-label="Menu tài khoản"
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

                  {/* 1. Thông tin tài khoản */}
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="main-header__dropdown-item"
                  >
                    <UserIcon className="w-4 h-4 text-slate-500" />
                    Thông tin tài khoản
                  </Link>

                  {/* 2. Chuyến đi của tôi */}
                  <Link
                    to="/trips"
                    onClick={() => setDropdownOpen(false)}
                    className="main-header__dropdown-item"
                  >
                    <Compass className="w-4 h-4 text-slate-500" />
                    Chuyến đi của tôi
                  </Link>

                  {/* 3. Địa điểm đã lưu */}
                  <Link
                    to="/favorites"
                    onClick={() => setDropdownOpen(false)}
                    className="main-header__dropdown-item"
                  >
                    <Heart className="w-4 h-4 text-red-500" />
                    Địa điểm đã lưu
                  </Link>

                  {/* 4. Trang quản trị (Chỉ render nếu là Admin) */}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="main-header__dropdown-item main-header__dropdown-item--admin"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      Trang quản trị (Admin)
                    </Link>
                  )}

                  {/* Divider ngăn cách */}
                  <div className="main-header__dropdown-divider" />

                  {/* 5. Đăng xuất */}
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
              <OpenAuthLink to="/login" className="main-header__login-link">
                Đăng nhập
              </OpenAuthLink>
              <OpenAuthLink to="/register" className="main-header__signup-btn">
                Đăng ký
              </OpenAuthLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
