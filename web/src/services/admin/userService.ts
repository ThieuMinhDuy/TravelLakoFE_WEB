import api from '@/config/axios';
import { ApiResponse, User } from '@/types';

export const userService = {
  // Lấy danh sách người dùng (có phân trang)
  getAllUsers: async (page = 1, limit = 10): Promise<ApiResponse<{ users: User[]; total: number }>> => {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  // Khóa / Mở khóa người dùng
  toggleBlockUser: async (userId: string, isBlocked: boolean): Promise<ApiResponse<User>> => {
    const response = await api.patch(`/admin/users/${userId}/block`, { isBlocked });
    return response.data;
  },
  
  // Xóa người dùng
  deleteUser: async (userId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
};
