import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { AdminLayout } from '../layouts/AdminLayout';

import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';

import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';

import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { VerifyOtpPage } from '../features/auth/pages/VerifyOtpPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';

import { ProfilePage } from '../features/profile/pages/ProfilePage';

import { AdminDashboardPage } from '../features/admin/pages/AdminDashboardPage';
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage';
import { AdminCitiesPage } from '../features/admin/pages/AdminCitiesPage';
import { AdminPlacesPage } from '../features/admin/pages/AdminPlacesPage';
import { AdminReviewsPage } from '../features/admin/pages/AdminReviewsPage';
import { AdminImportPage } from '../features/admin/pages/AdminImportPage';

// Simple placeholder helper
const PlaceholderPage: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="max-w-4xl mx-auto py-16 px-4 text-center">
    <h2 className="text-3xl font-extrabold text-slate-900">{title}</h2>
    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">{desc}</p>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/cities"
          element={
            <PlaceholderPage
              title="Điểm đến (Cities & Places)"
              desc="Khám phá 63 tỉnh thành Việt Nam và các điểm tham quan nổi bật."
            />
          }
        />
        <Route
          path="/places"
          element={
            <PlaceholderPage
              title="Khám phá Địa điểm (Place Directory)"
              desc="Màn 2: Tìm kiếm và lọc khách sạn, điểm vui chơi, nhà hàng, quán cafe theo 63 tỉnh thành Việt Nam."
            />
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
              <PlaceholderPage
                title="Địa điểm đã lưu (Yêu thích)"
                desc="Danh sách các địa điểm, khách sạn và nhà hàng bạn đã lưu vào mục Yêu thích."
              />
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

        {/* Protected Profile Route */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 2. Guest Auth Routes with AuthLayout (Split-Screen) */}
      <Route
        element={
          <GuestRoute>
            <AuthLayout />
          </GuestRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* 3. Protected Admin Routes with AdminLayout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="cities" element={<AdminCitiesPage />} />
        <Route path="places" element={<AdminPlacesPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="import" element={<AdminImportPage />} />
      </Route>

      {/* 4. Fallback 404 Route */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
