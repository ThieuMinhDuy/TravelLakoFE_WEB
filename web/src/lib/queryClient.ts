import { QueryClient } from '@tanstack/react-query';

/** QueryClient dùng chung — tách riêng để có thể xóa cache khi đăng xuất / hết phiên */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});
