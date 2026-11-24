/** Định dạng ảnh được phép tải lên (không nhận SVG — có thể chứa script) */
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

/** Giá trị cho thuộc tính `accept` của <input type="file"> */
export const IMAGE_ACCEPT = ACCEPTED_IMAGE_TYPES.join(',');

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/** Trả về thông báo lỗi nếu file không hợp lệ, `null` nếu hợp lệ */
export function validateImageFile(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return 'Chỉ chấp nhận ảnh định dạng PNG, JPG hoặc WEBP!';
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return 'Kích thước ảnh không được vượt quá 5MB!';
  }
  return null;
}
