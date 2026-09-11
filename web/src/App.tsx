import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Admin Imports
import AdminProtectedRoute from '@/routes/admin/AdminProtectedRoute';
import AdminLayout from '@/layouts/admin/AdminLayout';
import DashboardPage from '@/pages/admin/DashboardPage';
import UserManagementPage from '@/pages/admin/UserManagementPage';
import PlaceManagementPage from '@/pages/admin/PlaceManagementPage';
import ReviewManagementPage from '@/pages/admin/ReviewManagementPage';
import SettingsPage from '@/pages/admin/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={
          <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold text-primary-600 mb-4">TravelLako Trang Chủ</h1>
            <a href="/admin" className="text-blue-500 underline">Vào trang Admin</a>
          </div>
        } />

        {/* ADMIN ROUTES */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="places" element={<PlaceManagementPage />} />
            <Route path="reviews" element={<ReviewManagementPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
