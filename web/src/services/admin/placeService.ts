import api from '@/config/axios';
import { ApiResponse, Place, ItemType } from '@/types';

export const placeService = {
  // Lấy danh sách địa điểm theo loại (Khách sạn, Nhà hàng, v.v.)
  getPlacesByType: async (type: ItemType, page = 1, limit = 10): Promise<ApiResponse<{ places: Place[]; total: number }>> => {
    const response = await api.get(`/admin/places?type=${type}&page=${page}&limit=${limit}`);
    return response.data;
  },
  
  // Tạo địa điểm mới (Dùng Partial<Place> vì form tạo chưa có _id)
  createPlace: async (data: Partial<Place>): Promise<ApiResponse<Place>> => {
    const response = await api.post('/admin/places', data);
    return response.data;
  },

  // Cập nhật địa điểm
  updatePlace: async (placeId: string, data: Partial<Place>): Promise<ApiResponse<Place>> => {
    const response = await api.put(`/admin/places/${placeId}`, data);
    return response.data;
  },

  // Xóa địa điểm
  deletePlace: async (placeId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/admin/places/${placeId}`);
    return response.data;
  },
};
