import type { ItemType, PlaceUnion } from './place';
import type { FavoriteBudget, Gender } from './user';

/* -------------------------------------------------------------------------- */
/*  Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

export interface PlaceCounts {
  total: number;
  attractions: number;
  hotels: number;
  restaurants: number;
  cafes: number;
}

/** GET /admin/dashboard/stats — chỉ có số đếm, không có số liệu theo thời gian */
export interface DashboardStats {
  users: number;
  trips: number;
  places: PlaceCounts;
  reviews: number;
}

/* -------------------------------------------------------------------------- */
/*  Users                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Một user trong GET /admin/users (document đầy đủ trừ password).
 * Backend còn trả nhầm field `otp` (kèm mã còn hiệu lực) — adminService đã loại bỏ trước khi
 * dữ liệu vào cache, nên KHÔNG khai báo field này ở đây.
 */
export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  coverImage: string;
  phone: string;
  gender: Gender;
  dateOfBirth: string | null;
  travelPreferences: string[];
  favoriteBudget: FavoriteBudget;
  authType: 'local' | 'google';
  googleId: string | null;
  isVerified: boolean;
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListResponse {
  total: number;
  users: AdminUser[];
}

/** PUT /admin/users/:id — chỉ gửi field cần đổi; boolean phải là boolean thật */
export interface AdminUpdateUserDTO {
  name?: string;
  email?: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
}

/** Response của PUT /admin/users/:id — rút gọn, KHÔNG phải AdminUser đầy đủ (phải merge vào bản cũ) */
export interface AdminUpdateUserResponse {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  isAdmin: boolean;
  isBlocked: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Cities                                                                     */
/* -------------------------------------------------------------------------- */

/** Body của lỗi 400 khi xóa thành phố còn địa điểm → phải xác nhận rồi gọi lại với cascade=true */
export interface DeleteCityConflict {
  message: string;
  code: 'CITY_HAS_PLACES';
  requiresCascade: true;
  totalPlaces: number;
}

/** Body của lỗi 400 khi thành phố còn chuyến đi của người dùng → không xóa được (kể cả cascade) */
export interface DeleteCityBlockedByTrips {
  message: string;
  code: 'CITY_HAS_TRIPS';
  totalTrips: number;
}

/** DELETE /admin/places/:type/:id — kèm số chuyến đi đã được gỡ địa điểm khỏi lịch trình */
export interface DeletePlaceResponse {
  message: string;
  affectedTrips?: number;
}

/* -------------------------------------------------------------------------- */
/*  Places                                                                     */
/* -------------------------------------------------------------------------- */

/** Thành phố đã populate trong GET /admin/places/:type (POST/PUT chỉ trả chuỗi ID) */
export interface AdminPlaceCity {
  _id: string;
  name: string;
}

/** Một địa điểm trong GET /admin/places/:type */
export type AdminPlace = Omit<PlaceUnion, 'city'> & {
  city: AdminPlaceCity | null;
  /** Field riêng theo loại — đều tùy chọn để đọc chung một kiểu */
  admissionFee?: number;
  stars?: number;
  pricePerNight?: number;
  cuisineType?: string;
  price?: number;
};

export interface AdminPlaceListResponse {
  total: number;
  places: AdminPlace[];
}

/* -------------------------------------------------------------------------- */
/*  Reviews                                                                    */
/* -------------------------------------------------------------------------- */

/** Một review trong GET /admin/reviews — `user` và `itemId` đã populate, có thể null (dữ liệu cũ) */
export interface AdminReview {
  _id: string;
  user: { _id: string; name: string; email: string; avatar: string } | null;
  itemType: ItemType;
  /** itemId.city CHỈ là ID (chưa populate tên) */
  itemId: { _id: string; name: string; address: string; images: string[]; city: string } | null;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReviewListResponse {
  total: number;
  reviews: AdminReview[];
}

export interface AdminReviewFilters {
  city?: string;
  /** Phân biệt hoa thường: 'Hotel', không phải 'hotel' (sai → 0 kết quả, không báo lỗi) */
  itemType?: ItemType;
  /** Có itemId thì backend bỏ qua city và itemType */
  itemId?: string;
}

/* -------------------------------------------------------------------------- */
/*  Import OSM                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * POST /admin/import/osm
 * - cityId: thành phố đã có trong DB
 * - cityName: tìm theo tên (không phân biệt hoa thường); chưa có thì backend tự tạo thành phố mới
 * `limit` là số địa điểm MỚI (chưa có trong hệ thống) tối đa cho MỖI loại: import lại sẽ lấy thêm địa điểm khác.
 * Số thực tế có thể ít hơn khi khu vực không đủ địa điểm (hay gặp ở điểm tham quan).
 */
export type ImportOsmDTO = { cityId: string; limit?: number } | { cityName: string; limit?: number };

export interface ImportStats {
  hotelsImported: number;
  attractionsImported: number;
  restaurantsImported: number;
  cafesImported: number;
  totalImported: number;
}

/** Kết quả bước Gemini viết mô tả và giá tham khảo cho các địa điểm vừa import */
export interface ImportEnrichment {
  /** Số địa điểm có mô tả và giá do Gemini viết */
  aiGenerated: number;
  /** Số địa điểm dùng mô tả mẫu và giá ngẫu nhiên (Gemini lỗi hoặc trả dữ liệu không hợp lệ) */
  templateGenerated: number;
  /** false: server chưa cấu hình GEMINI_API_KEY → mọi địa điểm dùng dữ liệu mẫu */
  geminiEnabled: boolean;
  /** Loại địa điểm mà lần gọi Gemini bị lỗi (hết hạn mức, quá thời gian...) */
  failedTypes: ItemType[];
}

/** Nguồn dữ liệu của lần import: Overpass (chính) | Nominatim (dự phòng khi Overpass quá tải, không có địa điểm dạng khu vực) */
export type ImportSource = 'overpass' | 'nominatim';

export interface ImportStatsResponse {
  message: string;
  /** Không có ở bản backend cũ */
  source?: ImportSource;
  stats?: ImportStats;
  enrichment?: ImportEnrichment;
}
