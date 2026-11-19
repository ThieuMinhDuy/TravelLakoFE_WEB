export type Gender = 'Nam' | 'Nữ' | 'Khác' | '';

export type FavoriteBudget = 'Tiết kiệm' | 'Trung bình' | 'Cao cấp' | '';

export interface UserStats {
  trips: number;
  favorites: number;
  reviews: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  /** Ảnh bìa trang cá nhân (backend đang bổ sung) */
  coverImage?: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string | null;
  travelPreferences?: string[];
  favoriteBudget?: FavoriteBudget;
  authType?: 'local' | 'google';
  googleId?: string | null;
  isVerified?: boolean;
  isAdmin?: boolean;
  /** Dự phòng nếu API chuyển sang phân quyền dạng role — luôn kiểm tra qua isAdminUser() */
  role?: string;
  isBlocked?: boolean;
  stats?: UserStats;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin?: boolean;
  token?: string;
}

export interface UpdateProfileDTO {
  name?: string;
  avatar?: string;
  phone?: string;
  gender?: Gender;
  dateOfBirth?: string | null;
  travelPreferences?: string[];
  favoriteBudget?: FavoriteBudget;
  password?: string;
}
