/**
 * Lỗi chuẩn hóa từ API — giữ lại HTTP status để phân loại lỗi theo status
 * thay vì dò câu chữ trong message (backend đổi câu chữ là luồng hỏng).
 */
export class ApiError extends Error {
  /** HTTP status; `null` nếu không nhận được phản hồi (mất mạng, timeout, CORS) */
  readonly status: number | null;
  /** Mã lỗi: `code` do backend trả (nếu có) hoặc mã của axios (ECONNABORTED, ERR_NETWORK...) */
  readonly code?: string;
  /** Body lỗi gốc từ backend */
  readonly data?: unknown;

  constructor(
    message: string,
    options: { status?: number | null; code?: string; data?: unknown; cause?: unknown } = {}
  ) {
    super(message, { cause: options.cause });
    this.name = 'ApiError';
    this.status = options.status ?? null;
    this.code = options.code;
    this.data = options.data;
  }

  /** Không kết nối được tới máy chủ */
  get isNetworkError() {
    return this.status === null;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

/**
 * Mã lỗi cố định của backend (`backend/utils/httpError.js`), không đổi khi backend đổi câu chữ.
 * Lỗi chưa được phân loại thì không có mã; khi đó `ApiError.code` là mã của axios (vd `ERR_BAD_REQUEST`),
 * nên luôn so với giá trị cụ thể bằng `hasErrorCode`, đừng chỉ kiểm tra `code` có tồn tại.
 */
export type BackendErrorCode =
  | 'AUTH_REQUIRED'
  | 'TOKEN_INVALID'
  | 'USER_NOT_FOUND'
  | 'INVALID_CREDENTIALS'
  | 'GOOGLE_TOKEN_INVALID'
  | 'GOOGLE_EMAIL_UNVERIFIED'
  | 'ACCOUNT_BLOCKED'
  | 'NOT_ADMIN'
  | 'ACCOUNT_UNVERIFIED'
  | 'ACCOUNT_ALREADY_VERIFIED'
  | 'MISSING_FIELDS'
  | 'EMAIL_EXISTS'
  | 'INVALID_EMAIL'
  | 'WEAK_PASSWORD'
  | 'CURRENT_PASSWORD_INCORRECT'
  | 'SAME_PASSWORD'
  | 'OTP_INVALID'
  | 'OTP_EXPIRED'
  | 'OTP_ATTEMPTS_EXCEEDED'
  | 'OTP_COOLDOWN'
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | 'INVALID_JSON'
  | 'DUPLICATE_KEY'
  | 'CITY_EXISTS'
  | 'CITY_NOT_FOUND'
  | 'CITY_HAS_PLACES'
  | 'CITY_HAS_TRIPS';

/** Lỗi API có mã backend thuộc một trong các mã cho trước */
export const hasErrorCode = (error: unknown, ...codes: BackendErrorCode[]): boolean =>
  isApiError(error) && codes.includes(error.code as BackendErrorCode);

/** Số giây phải đợi của lỗi 429 (`OTP_COOLDOWN` / `RATE_LIMITED`); null nếu backend không gửi */
export const getRetryAfter = (error: unknown): number | null => {
  const value = isApiError(error) ? (error.data as { retryAfter?: unknown } | undefined)?.retryAfter : undefined;
  return typeof value === 'number' && value > 0 ? Math.ceil(value) : null;
};

/** Kiểm tra lỗi có thuộc một trong các HTTP status cho trước */
export const hasStatus = (error: unknown, ...statuses: number[]): boolean =>
  isApiError(error) && error.status !== null && statuses.includes(error.status);
