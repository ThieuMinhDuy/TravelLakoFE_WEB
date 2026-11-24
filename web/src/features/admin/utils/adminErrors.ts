import { hasErrorCode, isApiError } from '../../../services/apiError';
import type { DeleteCityBlockedByTrips, DeleteCityConflict } from '../../../types/admin';

/**
 * Câu tiếng Anh backend còn trả (kể cả khi đi kèm mã, vd CITY_EXISTS) → tiếng Việt.
 * Chỉ dùng để HIỂN THỊ; nhận diện loại lỗi luôn dựa vào `code`.
 * Gỡ bảng này khi backend dịch xong các câu tiếng Anh. So khớp theo tiền tố vì một số câu có phần đuôi thay đổi.
 */
const MESSAGE_MAP: [prefix: string, vi: string][] = [
  ['City already exists', 'Thành phố này đã tồn tại'],
  ['City not found', 'Không tìm thấy thành phố'],
  ['Place not found', 'Không tìm thấy địa điểm'],
  ['Review not found', 'Không tìm thấy đánh giá'],
  ['User not found', 'Không tìm thấy người dùng'],
  ['Resource not found', 'Không tìm thấy dữ liệu'],
  ['Not authorized as an admin', 'Bạn không có quyền quản trị'],
  ['Cannot delete the last administrator', 'Không thể xóa quản trị viên cuối cùng'],
  ['Invalid place type', 'Loại địa điểm không hợp lệ'],
  ['Please provide either cityId or cityName', 'Vui lòng chọn thành phố'],
];

/**
 * Câu hiển thị cho admin từ một lỗi bất kỳ.
 * Lỗi 400 của backend (VALIDATION_ERROR, MISSING_FIELDS, CITY_*…) đã là câu tiếng Việt, có thể gồm
 * nhiều lỗi nối bằng ". " → hiện nguyên văn. Lỗi 500 không đưa chi tiết kỹ thuật ra giao diện.
 */
export function adminErrorMessage(error: unknown, fallback = 'Đã xảy ra lỗi, vui lòng thử lại'): string {
  if (!(error instanceof Error)) return fallback;

  if (isApiError(error)) {
    if (error.code === 'ECONNABORTED') return 'Máy chủ phản hồi quá lâu, vui lòng thử lại';
    if (error.status === 500) return 'Máy chủ gặp sự cố, vui lòng thử lại sau';
    if (hasErrorCode(error, 'OSM_UNAVAILABLE')) return 'Máy chủ OpenStreetMap đang bận, vui lòng thử lại sau ít phút';
  }

  const match = MESSAGE_MAP.find(([prefix]) => error.message.startsWith(prefix));
  return match ? match[1] : error.message || fallback;
}

/** Xóa thành phố còn địa điểm (CITY_HAS_PLACES) → hỏi xác nhận rồi xóa kèm (cascade) */
export function isCascadeConflict(error: unknown): error is Error & { data: DeleteCityConflict } {
  return hasErrorCode(error, 'CITY_HAS_PLACES');
}

/** Xóa thành phố còn chuyến đi của người dùng (CITY_HAS_TRIPS) → luôn bị chặn, kể cả khi cascade */
export function isCityBlockedByTrips(error: unknown): error is Error & { data: DeleteCityBlockedByTrips } {
  return hasErrorCode(error, 'CITY_HAS_TRIPS');
}
