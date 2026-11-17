import { apiClient } from './apiClient';

export interface UploadResponse {
  message: string;
  url: string;
}

export const uploadService = {
  /**
   * Tải ảnh đơn lẻ lên máy chủ (Cloudinary / Local) qua POST /api/upload
   * Key form-data: 'image'
   */
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await apiClient.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
