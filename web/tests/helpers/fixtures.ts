import type { City } from '@/types/city';
import type { Favorite } from '@/types/favorite';
import type { Attraction, Cafe, Hotel, Restaurant } from '@/types/place';
import type { Trip } from '@/types/trip';

const coords = { lat: 16.05, lng: 108.2 };

export const makeCity = (overrides: Partial<City> = {}): City => ({
  _id: 'city-dn',
  name: 'Đà Nẵng',
  image: 'https://img.test/da-nang.jpg',
  coordinates: coords,
  ...overrides,
});

export const makeHotel = (overrides: Partial<Hotel> = {}): Hotel => ({
  _id: 'hotel-1',
  name: 'Khách sạn Biển Xanh',
  city: { _id: 'city-dn', name: 'Đà Nẵng', coordinates: coords },
  coordinates: coords,
  pricePerNight: 1_200_000,
  stars: 4,
  rating: 4.5,
  numReviews: 20,
  images: [],
  ...overrides,
});

export const makeAttraction = (overrides: Partial<Attraction> = {}): Attraction => ({
  _id: 'attr-1',
  name: 'Bà Nà Hills',
  city: { _id: 'city-dn', name: 'Đà Nẵng', coordinates: coords },
  coordinates: coords,
  admissionFee: 900_000,
  rating: 4.8,
  numReviews: 100,
  ...overrides,
});

export const makeRestaurant = (overrides: Partial<Restaurant> = {}): Restaurant => ({
  _id: 'rest-1',
  name: 'Mì Quảng Bà Mua',
  city: { _id: 'city-dn', name: 'Đà Nẵng', coordinates: coords },
  coordinates: coords,
  price: 60_000,
  rating: 4.2,
  numReviews: 50,
  ...overrides,
});

export const makeCafe = (overrides: Partial<Cafe> = {}): Cafe => ({
  _id: 'cafe-1',
  name: 'Cộng Cà Phê',
  city: { _id: 'city-dn', name: 'Đà Nẵng', coordinates: coords },
  coordinates: coords,
  price: 45_000,
  rating: 4.0,
  numReviews: 30,
  ...overrides,
});

export const makeTrip = (overrides: Partial<Trip> = {}): Trip => ({
  _id: 'trip-1',
  user: 'user-1',
  title: 'Đà Nẵng mùa hè',
  city: { _id: 'city-dn', name: 'Đà Nẵng', image: 'https://img.test/da-nang.jpg', coordinates: coords },
  startDate: '2026-12-01T00:00:00.000Z',
  endDate: '2026-12-03T00:00:00.000Z',
  budget: 5_000_000,
  schedule: [
    { day: 1, date: '2026-12-01T00:00:00.000Z', places: [{ _id: 's1', placeType: 'Hotel', placeId: 'hotel-1', order: 0 }] },
    { day: 2, date: '2026-12-02T00:00:00.000Z', places: [] },
  ],
  diary: { notes: '', photos: [] },
  ...overrides,
});

export const makeFavorite = (overrides: Partial<Favorite> = {}): Favorite => ({
  _id: 'fav-1',
  user: 'user-1',
  itemType: 'Hotel',
  itemId: makeHotel(),
  ...overrides,
});
