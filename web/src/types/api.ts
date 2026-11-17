export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  message: string;
  stack?: string | null;
}

export interface PaginatedResult<T> {
  total: number;
  items: T[];
}

export interface MessageResponse {
  message: string;
}
