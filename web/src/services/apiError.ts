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

/** Kiểm tra lỗi có thuộc một trong các HTTP status cho trước */
export const hasStatus = (error: unknown, ...statuses: number[]): boolean =>
  isApiError(error) && error.status !== null && statuses.includes(error.status);
