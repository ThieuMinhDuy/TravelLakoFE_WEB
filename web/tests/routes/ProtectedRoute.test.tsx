import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { useAuthStore } from '@/store/useAuthStore';

const LocationProbe = () => {
  const location = useLocation();
  return <p>{location.pathname + location.search}</p>;
};

const renderAt = (path: string, forbiddenFallback?: React.ReactNode) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<p>Trang chủ</p>} />
        <Route path="/login" element={<LocationProbe />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin forbiddenFallback={forbiddenFallback}>
              <p>Khu vực Admin</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );

describe('ProtectedRoute', () => {
  afterEach(() => useAuthStore.getState().logout());

  it('chưa đăng nhập → chuyển tới /login kèm redirect', () => {
    renderAt('/admin');
    expect(screen.getByText('/login?redirect=%2Fadmin')).toBeInTheDocument();
  });

  it('không phải Admin → hiện trang 403, giữ nguyên URL', () => {
    useAuthStore.getState().setAuth({ _id: '1', name: 'A', email: 'a@gmail.com' }, 't', true);
    renderAt('/admin');

    expect(screen.getByRole('heading', { name: 'Bạn không có quyền truy cập' })).toBeInTheDocument();
    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.queryByText('Khu vực Admin')).not.toBeInTheDocument();
    expect(screen.queryByText('Trang chủ')).not.toBeInTheDocument();
  });

  it('cho phép thay giao diện 403 (vd: bọc trong layout chính)', () => {
    useAuthStore.getState().setAuth({ _id: '1', name: 'A', email: 'a@gmail.com' }, 't', true);
    renderAt('/admin', <p>403 tùy chỉnh</p>);
    expect(screen.getByText('403 tùy chỉnh')).toBeInTheDocument();
  });

  it('Admin (isAdmin hoặc role) → vào được', () => {
    useAuthStore.getState().setAuth({ _id: '1', name: 'A', email: 'a@gmail.com', role: 'admin' }, 't', true);
    renderAt('/admin');
    expect(screen.getByText('Khu vực Admin')).toBeInTheDocument();
  });
});
