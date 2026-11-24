import { act, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import {
  countByMonth,
  countThisMonth,
  niceMax,
  ratingDistribution,
  topCitiesByReviews,
} from '@/features/admin/utils/dashboardStats';
import { countReviewTypes, filterReviews, isLowRating } from '@/features/admin/utils/reviewFilters';
import { countUserGroups, filterUsers } from '@/features/admin/utils/userFilters';
import { useUrlFilters } from '@/features/admin/hooks/useUrlFilters';
import type { AdminReview, AdminUser } from '@/types/admin';
import { makeCity } from '../../helpers/fixtures';

const makeUser = (overrides: Partial<AdminUser> = {}): AdminUser => ({
  _id: 'u1',
  name: 'Nguyễn Văn A',
  email: 'a@gmail.com',
  avatar: '',
  coverImage: '',
  phone: '',
  gender: '',
  dateOfBirth: null,
  travelPreferences: [],
  favoriteBudget: '',
  authType: 'local',
  googleId: null,
  isVerified: true,
  isAdmin: false,
  isBlocked: false,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
  ...overrides,
});

const makeReview = (overrides: Partial<AdminReview> = {}): AdminReview => ({
  _id: 'r1',
  user: { _id: 'u1', name: 'Lê Hoàng', email: 'hoang@gmail.com', avatar: '' },
  itemType: 'Hotel',
  itemId: { _id: 'p1', name: 'Khách sạn Biển Xanh', address: '', images: [], city: 'city-dn' },
  rating: 5,
  comment: 'Rất tuyệt',
  createdAt: '2026-11-10T00:00:00.000Z',
  updatedAt: '2026-11-10T00:00:00.000Z',
  ...overrides,
});

describe('Thống kê dashboard', () => {
  const now = new Date(2026, 10, 24); // 24/11/2026

  it('countByMonth: đủ số tháng, đếm đúng tháng, bỏ ngày ngoài khoảng / không hợp lệ', () => {
    const buckets = countByMonth(
      ['2026-11-02T10:00:00', '2026-11-20T10:00:00', '2026-09-15T10:00:00', '2025-01-01T00:00:00', 'abc', undefined],
      3,
      now
    );
    expect(buckets.map((b) => b.label)).toEqual(['T9', 'T10', 'T11']);
    expect(buckets.map((b) => b.value)).toEqual([1, 0, 2]);
    expect(buckets[2].fullLabel).toBe('Tháng 11/2026');
    expect(countThisMonth(['2026-11-05T10:00:00', '2026-10-05T10:00:00'], now)).toBe(1);
  });

  it('countByMonth: khoảng thời gian vắt qua năm mới', () => {
    const buckets = countByMonth(['2025-12-31T12:00:00'], 2, new Date(2026, 0, 10));
    expect(buckets.map((b) => b.key)).toEqual(['2025-12', '2026-01']);
    expect(buckets[0].value).toBe(1);
  });

  it('topCitiesByReviews: tra tên thành phố, bỏ thành phố đã xóa, xếp giảm dần', () => {
    const cities = [makeCity({ _id: 'hn', name: 'Hà Nội' }), makeCity({ _id: 'dn', name: 'Đà Nẵng' })];
    const reviews = [
      makeReview({ itemId: { _id: 'p1', name: 'A', address: '', images: [], city: 'dn' } }),
      makeReview({ itemId: { _id: 'p2', name: 'B', address: '', images: [], city: 'hn' } }),
      makeReview({ itemId: { _id: 'p3', name: 'C', address: '', images: [], city: 'hn' } }),
      makeReview({ itemId: { _id: 'p4', name: 'D', address: '', images: [], city: 'da-xoa' } }),
      makeReview({ itemId: null }),
    ];
    expect(topCitiesByReviews(reviews, cities)).toEqual([
      { key: 'hn', label: 'Hà Nội', value: 2, href: '/admin/reviews?city=hn' },
      { key: 'dn', label: 'Đà Nẵng', value: 1, href: '/admin/reviews?city=dn' },
    ]);
  });

  it('ratingDistribution: đủ 5 mức sao, thứ tự 5 → 1', () => {
    const result = ratingDistribution([makeReview({ rating: 5 }), makeReview({ rating: 1 }), makeReview({ rating: 5 })]);
    expect(result.map((r) => [r.label, r.value])).toEqual([
      ['5 sao', 2],
      ['4 sao', 0],
      ['3 sao', 0],
      ['2 sao', 0],
      ['1 sao', 1],
    ]);
  });

  it('niceMax: đỉnh trục tròn, chia đều 4 vạch số nguyên', () => {
    expect(niceMax(0)).toBe(4);
    expect(niceMax(7)).toBe(8);
    expect(niceMax(18)).toBe(20);
    expect(niceMax(30)).toBe(40);
  });
});

describe('Lọc người dùng', () => {
  const users = [
    makeUser({ _id: 'admin', name: 'Quản Trị', email: 'admin@gmail.com', isAdmin: true, createdAt: '2026-01-01' }),
    makeUser({ _id: 'hoang', name: 'Lê Hoàng', email: 'hoang@gmail.com', authType: 'google', createdAt: '2026-11-01' }),
    makeUser({ _id: 'khoa', name: 'Bị Khóa', email: 'x@gmail.com', isBlocked: true, isVerified: false, createdAt: '2026-06-01' }),
  ];

  it('đếm theo nhóm', () => {
    expect(countUserGroups(users)).toEqual({ all: 3, admin: 1, customer: 2, blocked: 1, unverified: 1 });
  });

  it('tìm không phân biệt dấu, lọc theo nhóm + cách đăng nhập, mới tạo lên trước', () => {
    expect(filterUsers(users, { q: 'hoang', group: 'all', auth: 'all' }).map((u) => u._id)).toEqual(['hoang']);
    expect(filterUsers(users, { q: '', group: 'customer', auth: 'all' }).map((u) => u._id)).toEqual(['hoang', 'khoa']);
    expect(filterUsers(users, { q: '', group: 'all', auth: 'local' }).map((u) => u._id)).toEqual(['khoa', 'admin']);
  });
});

describe('Lọc đánh giá', () => {
  const reviews = [
    makeReview({ _id: 'old', rating: 4, createdAt: '2026-01-01', comment: 'Phòng sạch sẽ' }),
    makeReview({ _id: 'spam', rating: 1, itemType: 'Cafe', createdAt: '2026-11-01', comment: 'Quảng cáo spam' }),
    makeReview({ _id: 'low', rating: 2, createdAt: '2026-06-01', comment: 'Hơi ồn' }),
  ];

  it('đánh giá thấp là ≤ 2 sao; đếm theo loại địa điểm', () => {
    expect(isLowRating({ rating: 2 })).toBe(true);
    expect(isLowRating({ rating: 3 })).toBe(false);
    expect(countReviewTypes(reviews)).toEqual({ all: 3, Attraction: 0, Hotel: 2, Restaurant: 0, Cafe: 1 });
  });

  it('lọc theo loại, số sao, từ khóa không dấu và sắp xếp', () => {
    const base = { q: '', type: 'all', rating: 'all', sort: 'newest' } as const;
    expect(filterReviews(reviews, base).map((r) => r._id)).toEqual(['spam', 'low', 'old']);
    expect(filterReviews(reviews, { ...base, sort: 'lowest' }).map((r) => r._id)).toEqual(['spam', 'low', 'old']);
    expect(filterReviews(reviews, { ...base, sort: 'oldest' }).map((r) => r._id)).toEqual(['old', 'low', 'spam']);
    expect(filterReviews(reviews, { ...base, rating: 'low', type: 'Hotel' }).map((r) => r._id)).toEqual(['low']);
    expect(filterReviews(reviews, { ...base, rating: '4' }).map((r) => r._id)).toEqual(['old']);
    expect(filterReviews(reviews, { ...base, q: 'quang cao' }).map((r) => r._id)).toEqual(['spam']);
  });
});

describe('useUrlFilters', () => {
  const setup = (url: string) => {
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(MemoryRouter, { initialEntries: [url] }, children);
    return renderHook(
      () => ({ ...useUrlFilters({ q: '', group: 'all' }), search: useLocation().search }),
      { wrapper }
    );
  };

  it('đọc bộ lọc từ URL, bỏ tham số lạ', () => {
    const { result } = setup('/admin/users?group=admin&foo=1');
    expect(result.current.filters).toEqual({ q: '', group: 'admin' });
    expect(result.current.isFiltered).toBe(true);
  });

  it('giá trị bằng mặc định thì xóa khỏi URL; reset về mặc định', () => {
    const { result } = setup('/admin/users');
    act(() => result.current.setFilters({ q: 'hoang', group: 'blocked' }));
    expect(result.current.search).toBe('?q=hoang&group=blocked');

    act(() => result.current.setFilters({ group: 'all' }));
    expect(result.current.search).toBe('?q=hoang');

    act(() => result.current.resetFilters());
    expect(result.current.search).toBe('');
    expect(result.current.isFiltered).toBe(false);
  });
});
