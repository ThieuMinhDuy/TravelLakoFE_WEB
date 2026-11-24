import { classifyBudget, recommendPlaces } from '@/features/profile/utils/recommend';
import { pickCitiesToExplore } from '@/features/profile/utils/explore';
import { collectMemories } from '@/features/profile/utils/memories';
import type { GlobalSearchResponse } from '@/types/place';
import {
  makeAttraction,
  makeCafe,
  makeCity,
  makeHotel,
  makeRestaurant,
  makeTrip,
} from '../../helpers/fixtures';

const data: GlobalSearchResponse = {
  hotels: [
    makeHotel({ _id: 'h-cheap', name: 'Homestay', pricePerNight: 500_000, rating: 4.0 }),
    makeHotel({ _id: 'h-lux', name: 'Resort 5 sao', pricePerNight: 6_000_000, rating: 4.9 }),
  ],
  attractions: [makeAttraction({ _id: 'a-1', rating: 4.6 })],
  restaurants: [makeRestaurant({ _id: 'r-1', rating: 4.0, price: 80_000 })],
  cafes: [makeCafe({ _id: 'c-1', rating: 3.5 })],
};

describe('classifyBudget', () => {
  it('phân mức giá theo ngưỡng riêng của từng loại', () => {
    expect(classifyBudget(500_000, 'hotel')).toBe('Tiết kiệm');
    expect(classifyBudget(800_000, 'hotel')).toBe('Tiết kiệm'); // biên trên vẫn tính là Tiết kiệm
    expect(classifyBudget(1_500_000, 'hotel')).toBe('Trung bình');
    expect(classifyBudget(6_000_000, 'hotel')).toBe('Cao cấp');
    expect(classifyBudget(150_000, 'cafe')).toBe('Cao cấp');
  });
});

describe('recommendPlaces', () => {
  it('không có sở thích / ngân sách → xếp theo điểm đánh giá', () => {
    const result = recommendPlaces(data, { interests: [], limit: 2 });
    expect(result.map((r) => r.place._id)).toEqual(['h-lux', 'a-1']);
  });

  it('ngân sách tiết kiệm đẩy homestay lên trên resort 5 sao', () => {
    const result = recommendPlaces(data, { interests: [], favoriteBudget: 'Tiết kiệm' });
    const ids = result.map((r) => r.place._id);
    expect(ids.indexOf('h-cheap')).toBeLessThan(ids.indexOf('h-lux'));
    expect(result.find((r) => r.place._id === 'h-cheap')?.reason).toBe('Hợp ngân sách tiết kiệm');
  });

  it('sở thích "Ẩm thực" ưu tiên nhà hàng và ghi rõ lý do', () => {
    const [first] = recommendPlaces(data, { interests: ['Ẩm thực'], favoriteBudget: 'Tiết kiệm' });
    expect(first.type).toBe('restaurant');
    expect(first.reason).toBe('Hợp sở thích Ẩm thực');
  });

  it('bỏ qua địa điểm đã yêu thích và giới hạn số lượng', () => {
    const result = recommendPlaces(data, { interests: [], excludeIds: new Set(['h-lux']), limit: 3 });
    expect(result).toHaveLength(3);
    expect(result.some((r) => r.place._id === 'h-lux')).toBe(false);
  });
});

describe('pickCitiesToExplore', () => {
  const cities = [
    makeCity({ _id: 'hn', name: 'Hà Nội' }),
    makeCity({ _id: 'dn', name: 'Đà Nẵng' }),
    makeCity({ _id: 'no-img', name: 'Không ảnh', image: '' }),
    makeCity({ _id: 'hue', name: 'Huế' }),
  ];

  it('ưu tiên thành phố chưa đi, bỏ thành phố không có ảnh', () => {
    const trips = {
      upcoming: [makeTrip({ city: { _id: 'hn', name: 'Hà Nội', coordinates: { lat: 0, lng: 0 } } })],
      ongoing: [],
      past: [],
    };
    expect(pickCitiesToExplore(cities, trips).map((c) => c._id)).toEqual(['dn', 'hue', 'hn']);
  });

  it('chưa tải được chuyến đi vẫn trả danh sách có ảnh', () => {
    expect(pickCitiesToExplore(cities, undefined, 2).map((c) => c._id)).toEqual(['hn', 'dn']);
  });
});

describe('collectMemories', () => {
  it('gom ảnh nhật ký mọi nhóm, chuyến gần nhất trước, bỏ chuyến không có ảnh', () => {
    const older = makeTrip({ _id: 'old', startDate: '2025-01-01', diary: { notes: '', photos: ['a.jpg'] } });
    const newer = makeTrip({ _id: 'new', startDate: '2026-06-01', diary: { notes: '', photos: ['b.jpg', 'c.jpg'] } });
    const empty = makeTrip({ _id: 'empty', diary: { notes: '', photos: [] } });

    const memories = collectMemories({ upcoming: [empty], ongoing: [newer], past: [older] });
    expect(memories.map((m) => m.url)).toEqual(['b.jpg', 'c.jpg', 'a.jpg']);
  });
});
