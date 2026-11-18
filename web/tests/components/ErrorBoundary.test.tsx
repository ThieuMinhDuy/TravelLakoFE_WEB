import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { isChunkLoadError, reloadOnceForChunkError } from '@/utils/errors';

const Bomb: React.FC<{ explode: boolean }> = ({ explode }) => {
  if (explode) throw new Error('Hỏng render');
  return <p>Nội dung bình thường</p>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // React log lỗi bị bắt ra console — tắt cho gọn output test
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('hiện giao diện báo lỗi thay vì làm trắng trang', () => {
    render(
      <ErrorBoundary>
        <Bomb explode />
      </ErrorBoundary>
    );
    expect(screen.getByRole('heading', { name: 'Đã xảy ra lỗi' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
  });

  it('"Thử lại" render lại nội dung khi lỗi đã hết', async () => {
    const Harness = () => {
      const [explode, setExplode] = useState(true);
      return (
        <>
          <button onClick={() => setExplode(false)}>Sửa lỗi</button>
          <ErrorBoundary>
            <Bomb explode={explode} />
          </ErrorBoundary>
        </>
      );
    };
    render(<Harness />);

    await userEvent.click(screen.getByRole('button', { name: 'Sửa lỗi' }));
    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(screen.getByText('Nội dung bình thường')).toBeInTheDocument();
  });

  it('tự xóa lỗi khi resetKeys đổi (vd: chuyển trang)', () => {
    const { rerender } = render(
      <ErrorBoundary resetKeys={['/trang-loi']}>
        <Bomb explode />
      </ErrorBoundary>
    );
    expect(screen.getByText('Đã xảy ra lỗi')).toBeInTheDocument();

    rerender(
      <ErrorBoundary resetKeys={['/trang-khac']}>
        <Bomb explode={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Nội dung bình thường')).toBeInTheDocument();
  });

  it('dùng fallback tùy chỉnh nếu được truyền', () => {
    render(
      <ErrorBoundary fallback={({ error }) => <p>Lỗi: {error.message}</p>}>
        <Bomb explode />
      </ErrorBoundary>
    );
    expect(screen.getByText('Lỗi: Hỏng render')).toBeInTheDocument();
  });
});

describe('Lỗi tải chunk lazy', () => {
  it('nhận diện thông báo lỗi tải chunk của các trình duyệt', () => {
    expect(isChunkLoadError(new TypeError('Failed to fetch dynamically imported module: /a.js'))).toBe(true);
    expect(isChunkLoadError(new TypeError('Importing a module script failed.'))).toBe(true);
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false);
  });

  it('chỉ tự reload một lần trong khoảng chờ (không lặp reload vô hạn)', () => {
    const reload = vi.fn();
    expect(reloadOnceForChunkError(reload, 100_000)).toBe(true);
    expect(reloadOnceForChunkError(reload, 105_000)).toBe(false);
    expect(reload).toHaveBeenCalledOnce();

    // Hết thời gian chờ → được reload lại
    expect(reloadOnceForChunkError(reload, 120_000)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });
});
