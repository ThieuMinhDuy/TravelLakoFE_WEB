/**
 * Khóa so khớp tên: bỏ dấu, đ → d, chữ thường, gộp khoảng trắng.
 * Giống hệt `toSearchKey` của backend (`backend/utils/text.js`) để FE xếp "đã có / chưa có"
 * khớp với cách backend chọn thành phố khi import và báo trùng tên (CITY_EXISTS).
 */
export const toSearchKey = (value = ''): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
