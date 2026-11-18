import { act, renderHook } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';
import { DEFAULT_TITLE, useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMediaQuery } from '@/hooks/useMediaQuery';

describe('useDebounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('chỉ cập nhật giá trị sau khi ngừng thay đổi đủ lâu', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'h' },
    });

    rerender({ value: 'ha' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'ha n' });
    act(() => vi.advanceTimersByTime(200));
    // Vẫn đang gõ → chưa đổi
    expect(result.current).toBe('h');

    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('ha n');
  });
});

describe('usePagination', () => {
  const items = Array.from({ length: 23 }, (_, i) => i + 1);

  it('chia trang và tính khoảng hiển thị', () => {
    const { result } = renderHook(() => usePagination(items, { pageSize: 10 }));

    expect(result.current).toMatchObject({ page: 1, totalPages: 3, total: 23, from: 1, to: 10 });
    expect(result.current.pageItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.current.hasPrev).toBe(false);

    act(() => result.current.setPage(3));
    expect(result.current.pageItems).toEqual([21, 22, 23]);
    expect(result.current).toMatchObject({ from: 21, to: 23, hasNext: false });
  });

  it('không cho đi quá trang đầu / cuối', () => {
    const { result } = renderHook(() => usePagination(items, { pageSize: 10 }));
    act(() => result.current.prevPage());
    expect(result.current.page).toBe(1);
    act(() => result.current.setPage(99));
    expect(result.current.page).toBe(3);
  });

  it('tự lùi trang khi dữ liệu ít đi', () => {
    const { result, rerender } = renderHook(({ list }) => usePagination(list, { pageSize: 10 }), {
      initialProps: { list: items },
    });
    act(() => result.current.setPage(3));

    rerender({ list: items.slice(0, 12) });
    expect(result.current.page).toBe(2);
    expect(result.current.pageItems).toEqual([11, 12]);
  });

  it('danh sách rỗng vẫn có 1 trang, from/to = 0', () => {
    const { result } = renderHook(() => usePagination([], { pageSize: 10 }));
    expect(result.current).toMatchObject({ page: 1, totalPages: 1, from: 0, to: 0 });
  });
});

describe('useDocumentTitle', () => {
  it('đặt "<title> · TripMate" và khôi phục tiêu đề cũ khi unmount', () => {
    document.title = 'Trang nền · TripMate';
    const { unmount } = renderHook(() => useDocumentTitle('Đăng nhập'));
    expect(document.title).toBe('Đăng nhập · TripMate');

    unmount();
    expect(document.title).toBe('Trang nền · TripMate');
  });

  it('không truyền tiêu đề → tiêu đề mặc định của app', () => {
    renderHook(() => useDocumentTitle());
    expect(document.title).toBe(DEFAULT_TITLE);
  });
});

describe('useMediaQuery', () => {
  afterEach(() => {
    // @ts-expect-error — xóa mock để không ảnh hưởng test khác
    delete window.matchMedia;
  });

  it('trả về false khi môi trường không có matchMedia', () => {
    const { result } = renderHook(() => useMediaQuery('(max-width: 1023.98px)'));
    expect(result.current).toBe(false);
  });

  it('cập nhật khi media query thay đổi', () => {
    let matches = false;
    const listeners = new Set<() => void>();
    window.matchMedia = vi.fn().mockImplementation(() => ({
      get matches() {
        return matches;
      },
      addEventListener: (_: string, cb: () => void) => listeners.add(cb),
      removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
    }));

    const { result } = renderHook(() => useMediaQuery('(max-width: 1023.98px)'));
    expect(result.current).toBe(false);

    act(() => {
      matches = true;
      listeners.forEach((cb) => cb());
    });
    expect(result.current).toBe(true);
  });
});
