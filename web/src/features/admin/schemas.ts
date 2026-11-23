import { z } from 'zod';
import type { CreateCityDTO } from '../../types/city';
import type { CreatePlaceDTO } from '../../types/place';

/*
 * Cùng giới hạn và câu báo lỗi với backend (tài liệu 09, mục 3.6) để người dùng thấy lỗi ngay ở form;
 * backend vẫn kiểm tra lại và trả 400 VALIDATION_ERROR nếu dữ liệu sai.
 * Các ô số trong form trả về `number | undefined` (rỗng → undefined), không phải chuỗi.
 */

const requiredNumber = (requiredMessage: string, label: string) =>
  z.number({ required_error: requiredMessage, invalid_type_error: `${label} phải là số` });

/** Giá tiền ≥ 0; `label` viết hoa chữ đầu, dùng trong câu "… không được âm" */
const priceField = (label: string) =>
  requiredNumber(`Vui lòng nhập ${label.toLowerCase()}`, label)
    .min(0, `${label} không được âm`)
    .max(1_000_000_000, `${label} quá lớn`);

/**
 * Ô số để trống trong form lưu là `null` (react-hook-form coi `undefined` là "chưa có giá trị"
 * và tự quay về giá trị mặc định → không xóa được ô). Đổi về `undefined` trước khi kiểm tra.
 */
const emptyAsUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => (value === null || value === '' ? undefined : value), schema);

export const coordinatesSchema = z.object({
  lat: requiredNumber('Vui lòng nhập vĩ độ (lat)', 'Vĩ độ')
    .min(-90, 'Vĩ độ (lat) phải từ -90 đến 90')
    .max(90, 'Vĩ độ (lat) phải từ -90 đến 90'),
  lng: requiredNumber('Vui lòng nhập kinh độ (lng)', 'Kinh độ')
    .min(-180, 'Kinh độ (lng) phải từ -180 đến 180')
    .max(180, 'Kinh độ (lng) phải từ -180 đến 180'),
});

/* --------------------------------- City --------------------------------- */

export const cityFormSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên thành phố').max(100, 'Tên tối đa 100 ký tự'),
  description: z.string().trim().max(2000, 'Mô tả tối đa 2000 ký tự'),
  image: z.string(),
  coordinates: coordinatesSchema,
});
export type CityFormValues = z.infer<typeof cityFormSchema>;

/** Thêm mới: bỏ mô tả / ảnh để trống (không cần gửi). Khi sửa, xem diffCity trong CityFormDrawer */
export const toCityDTO = ({ name, description, image, coordinates }: CityFormValues): CreateCityDTO => ({
  name,
  coordinates,
  ...(description ? { description } : {}),
  ...(image ? { image } : {}),
});

/* --------------------------------- Place -------------------------------- */

const placeBase = {
  name: z.string().trim().min(1, 'Vui lòng nhập tên địa điểm').max(200, 'Tên tối đa 200 ký tự'),
  city: z.string().min(1, 'Vui lòng chọn thành phố'),
  description: z.string().trim().max(5000, 'Mô tả tối đa 5000 ký tự'),
  address: z.string().trim().max(300, 'Địa chỉ tối đa 300 ký tự'),
  /** URL ảnh đã upload; phần tử đầu là ảnh đại diện */
  images: z.array(z.string()).max(10, 'Tối đa 10 ảnh'),
  coordinates: coordinatesSchema,
};

/** Form theo từng loại — chỉ có field backend cho ghi (không có rating/numReviews) */
export const placeFormSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('attraction'), ...placeBase, admissionFee: emptyAsUndefined(priceField('Giá vé').optional()) }),
  z.object({
    type: z.literal('hotel'),
    ...placeBase,
    stars: z
      .number({ invalid_type_error: 'Số sao phải là số' })
      .int('Số sao phải là số nguyên')
      .min(1, 'Số sao phải từ 1 đến 5')
      .max(5, 'Số sao phải từ 1 đến 5')
      .optional(),
    pricePerNight: emptyAsUndefined(priceField('Giá mỗi đêm')),
  }),
  z.object({
    type: z.literal('restaurant'),
    ...placeBase,
    cuisineType: z.string().trim().max(100, 'Tối đa 100 ký tự'),
    price: emptyAsUndefined(priceField('Giá').optional()),
  }),
  z.object({ type: z.literal('cafe'), ...placeBase, price: emptyAsUndefined(priceField('Giá').optional()) }),
]);
export type PlaceFormValues = z.infer<typeof placeFormSchema>;

/** Giá trị form → body API: bỏ `type` (nằm trên URL) và các field tùy chọn để trống */
export function toPlaceDTO(values: PlaceFormValues): CreatePlaceDTO {
  const { type: _type, ...rest } = values;
  void _type;
  return Object.fromEntries(
    Object.entries(rest).filter(([, value]) => value !== undefined)
  ) as unknown as CreatePlaceDTO;
}

/* --------------------------------- User --------------------------------- */

export const userEditSchema = z.object({
  name: z.string().trim().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(50, 'Họ tên tối đa 50 ký tự'),
  email: z.string().trim().toLowerCase().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
});
export type UserEditValues = z.infer<typeof userEditSchema>;

/* -------------------------------- Import -------------------------------- */

/** Backend tự giới hạn mỗi loại trong 1–50 (gửi lớn hơn vẫn tính là 50) */
export const IMPORT_LIMIT = { min: 1, max: 50, default: 30 } as const;

export const importFormSchema = z.object({
  /** `id:<cityId>` (thành phố đã có) hoặc `name:<tên>` (thêm mới từ danh sách) */
  target: z.string().regex(/^(id|name):.+/, 'Vui lòng chọn thành phố'),
  limit: z
    .number({ invalid_type_error: 'Số lượng phải là số' })
    .int()
    .min(IMPORT_LIMIT.min, `Tối thiểu ${IMPORT_LIMIT.min}`)
    .max(IMPORT_LIMIT.max, `Tối đa ${IMPORT_LIMIT.max}`),
});
export type ImportFormValues = z.infer<typeof importFormSchema>;
