import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation, type Location } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';

import { ProtectedRoute } from './ProtectedRoute';
import { GuestRedirect } from './GuestRedirect';
import { useAuthStore } from '../store/useAuthStore';
import { Spinner } from '../components/common/Spinner';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ScrollToTop } from './ScrollToTop';

import { ExplorePage } from '../features/explore/ExplorePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';

import { isAuthPath, type AuthModalState } from '../features/auth/authPaths';

/**
 * Lazy-load các phân hệ chỉ dành cho người đã đăng nhập / Admin → khách vào trang chủ
 * không phải tải code của chúng (tách chunk riêng khi build).
 */
const lazyNamed = <K extends string, P extends object = object>(
  loader: () => Promise<Record<K, React.ComponentType<P>>>,
  name: K
) => lazy(() => loader().then((m) => ({ default: m[name] })));

/** Popup xác thực (kèm framer-motion, zod, react-hook-form, Google SDK) — chunk riêng */
const loadAuthModal = () => import('../features/auth/AuthModalHost');
const AuthModalHost = lazyNamed(loadAuthModal, 'AuthModalHost');

const AdminLayout = lazyNamed(() => import('../layouts/AdminLayout'), 'AdminLayout');
const ProfilePage = lazyNamed(() => import('../features/profile/pages/ProfilePage'), 'ProfilePage');
const AdminDashboardPage = lazyNamed(() => import('../features/admin/pages/AdminDashboardPage'), 'AdminDashboardPage');
const AdminUsersPage = lazyNamed(() => import('../features/admin/pages/AdminUsersPage'), 'AdminUsersPage');
const AdminCitiesPage = lazyNamed(() => import('../features/admin/pages/AdminCitiesPage'), 'AdminCitiesPage');
const AdminPlacesPage = lazyNamed(() => import('../features/admin/pages/AdminPlacesPage'), 'AdminPlacesPage');
const AdminReviewsPage = lazyNamed(() => import('../features/admin/pages/AdminReviewsPage'), 'AdminReviewsPage');
const AdminImportPage = lazyNamed(() => import('../features/admin/pages/AdminImportPage'), 'AdminImportPage');

const PageFallback: React.FC = () => (
  <div className="flex items-center justify-center py-24" role="status" aria-label="Đang tải trang">
    <Spinner size="lg" className="text-oceanBlue" />
  </div>
);

/** Bọc từng trang lazy trong Suspense riêng → layout xung quanh không bị thay bằng spinner */
const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={<PageFallback />}>{element}</Suspense>
);

// Simple placeholder helper
const PlaceholderPage: React.FC<{ title: string; desc: string }> = ({ title, desc }) => {
  useDocumentTitle(title);
  return (
    <div className="max-w-4xl mx-auto py-16 px-4 text-center">
      <h2 className="text-3xl font-extrabold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">{desc}</p>
    </div>
  );
};

/** Trang nền mặc định khi mở thẳng URL /login, /register... */
const HOME_LOCATION: Location = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'auth-background',
};

export const AppRoutes: React.FC = () => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Các màn auth là popup: trang phía sau là trang người dùng đang xem (hoặc trang chủ)
  const isAuthOpen = isAuthPath(location.pathname);
  const backgroundLocation = isAuthOpen
    ? ((location.state as AuthModalState | null)?.backgroundLocation ?? HOME_LOCATION)
    : null;

  // Chỉ mount popup sau lần mở đầu tiên; sau đó giữ mount để chạy được hiệu ứng đóng
  const isAuthModalOpen = isAuthOpen && !isAuthenticated;
  const [authModalMounted, setAuthModalMounted] = useState(isAuthModalOpen);
  if (isAuthModalOpen && !authModalMounted) setAuthModalMounted(true);

  // Tải sẵn chunk popup khi trình duyệt rảnh → lần bấm "Đăng nhập" đầu tiên mở ngay
  useEffect(() => {
    if (isAuthenticated) return;
    const prefetch = () => void loadAuthModal();
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(prefetch, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(prefetch, 2000);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated]);

  const pageLocation = backgroundLocation ?? location;

  return (
    <>
    <ScrollToTop pathname={pageLocation.pathname} />
    <Routes location={pageLocation}>
      {/* 1. Public Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<ExplorePage page="home" />} />
        <Route
          path="/cities"
          element={
            <ExplorePage page="cities" />
          }
        />
        <Route
          path="/places"
          element={
            <ExplorePage page="places" />
          }
        />
        <Route
          path="/trips"
          element={
            <PlaceholderPage
              title="Chuyến đi của tôi (My Trips)"
              desc="Màn 5 & 6: Quản lý danh sách chuyến đi và giao diện kéo thả timeline lịch trình thông minh."
            />
          }
        />
        <Route
          path="/diary"
          element={
            <ProtectedRoute>
              <PlaceholderPage
                title="Nhật ký Chuyến đi (Trip Diary)"
                desc="Màn 7: Ghi lại khoảnh khắc, cảm xúc và hình ảnh trong hành trình của bạn."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:id"
          element={
            <ProtectedRoute>
              <PlaceholderPage
                title="Chi tiết chuyến đi"
                desc="Màn 6: Lịch trình theo từng ngày, kéo thả sắp xếp địa điểm và bản đồ lộ trình."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:id/diary"
          element={
            <ProtectedRoute>
              <PlaceholderPage
                title="Nhật ký Chuyến đi"
                desc="Màn 7: Ghi lại khoảnh khắc, cảm xúc và hình ảnh trong hành trình của bạn."
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <ExplorePage page="favorites" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog"
          element={
            <PlaceholderPage
              title="Cẩm nang Du lịch"
              desc="Kinh nghiệm khám phá ẩm thực và các địa danh du lịch nổi tiếng tại Việt Nam."
            />
          }
        />

        <Route path="/cities/:id" element={<ExplorePage page="city" />} />
        <Route path="/places/:type/:id" element={<ExplorePage page="place" />} />

        {/* Protected Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              {withSuspense(<ProfilePage />)}
            </ProtectedRoute>
          }
        />
      </Route>


      {/* 2. Protected Admin Routes with AdminLayout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            requireAdmin
            forbiddenFallback={
              <MainLayout>
                <ForbiddenPage />
              </MainLayout>
            }
          >
            {withSuspense(<AdminLayout />)}
          </ProtectedRoute>
        }
      >
        <Route index element={withSuspense(<AdminDashboardPage />)} />
        <Route path="users" element={withSuspense(<AdminUsersPage />)} />
        <Route path="cities" element={withSuspense(<AdminCitiesPage />)} />
        <Route path="places" element={withSuspense(<AdminPlacesPage />)} />
        <Route path="reviews" element={withSuspense(<AdminReviewsPage />)} />
        <Route path="import" element={withSuspense(<AdminImportPage />)} />
      </Route>

      {/* 3. Fallback 404 Route */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>

    {/* 4. Popup xác thực (Login, Register, OTP, Quên / Đặt lại mật khẩu) */}
    {isAuthOpen && isAuthenticated && <GuestRedirect location={location} />}
    {authModalMounted && (
      // Lỗi trong popup (kể cả lỗi tải chunk) không được làm trắng trang phía sau
      <ErrorBoundary fallback={() => null}>
        <Suspense fallback={null}>
          <AuthModalHost open={isAuthModalOpen} location={location} />
        </Suspense>
      </ErrorBoundary>
    )}
    </>
  );
};
