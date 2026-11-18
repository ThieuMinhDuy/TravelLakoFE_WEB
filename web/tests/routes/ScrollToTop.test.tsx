import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { ScrollToTop } from '@/routes/ScrollToTop';

/** Mô phỏng AppRoutes: khi mở popup, pathname theo dõi là của trang nền */
const Harness = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const background = (location.state as { bg?: string } | null)?.bg;
  return (
    <>
      <ScrollToTop pathname={background ?? location.pathname} />
      <button onClick={() => navigate('/places')}>Sang trang khác</button>
      <button onClick={() => navigate('/login', { state: { bg: location.pathname } })}>Mở popup</button>
      <button onClick={() => navigate(-1)}>Quay lại</button>
    </>
  );
};

describe('ScrollToTop', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it('cuộn lên đầu khi sang trang khác', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Harness />
      </MemoryRouter>
    );
    vi.mocked(window.scrollTo).mockClear();

    await userEvent.click(screen.getByRole('button', { name: 'Sang trang khác' }));
    expect(window.scrollTo).toHaveBeenCalledOnce();
  });

  it('không cuộn khi chỉ mở popup đăng nhập (trang nền không đổi)', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Harness />
      </MemoryRouter>
    );
    vi.mocked(window.scrollTo).mockClear();

    await userEvent.click(screen.getByRole('button', { name: 'Mở popup' }));
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('không cuộn khi bấm Back (giữ vị trí cũ của trình duyệt)', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Harness />
      </MemoryRouter>
    );
    await userEvent.click(screen.getByRole('button', { name: 'Sang trang khác' }));
    vi.mocked(window.scrollTo).mockClear();

    await userEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
