import api from '@/config/axios';
import { ApiResponse, DashboardStats } from '@/types';

export const dashboardService = {
  // Lấy thống kê tổng quan
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    // Lưu ý: Không cần tiền tố /api vì đã cấu hình trong axios baseURL
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
};
